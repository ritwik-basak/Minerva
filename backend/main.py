import os
import json
import asyncio
import queue
import threading
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="bs4")
from dotenv import load_dotenv

load_dotenv()

os.environ["LANGCHAIN_TRACING_V2"] = os.getenv("LANGCHAIN_TRACING_V2", "true")
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY", "")
os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "minerva")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from graph.workflow import build_graph

app = FastAPI(title="Minerva API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

graph_app = build_graph()

# Maps LangGraph node names to frontend agent ids
NODE_MAP = {
    "supervisor_agent": ("supervisor", "Selecting tools..."),
    "search_agent":     ("search",     "Searching the web..."),
    "reranker_agent":   ("reranker",   "Ranking by relevance..."),
    "summarizer_agent": ("summarizer", "Synthesizing knowledge..."),
    "writer_agent":     ("writer",     "Crafting your report..."),
}


class QueryRequest(BaseModel):
    query: str
    conversation_history: list = []


class FollowupRequest(BaseModel):
    question: str
    conversation_history: list


def is_new_topic(question: str, conversation_history: list) -> bool:
    if not conversation_history:
        return True
    last_report = conversation_history[-1]["content"][:500]
    prompt = f"""The user is chatting with a research assistant.
The last research topic was about:
{last_report}

The user's new message is:
"{question}"

Is this a follow-up question about the same topic, or a completely new research topic?
Reply with ONLY one word: FOLLOWUP or NEWTOPIC"""
    response = llm.invoke(prompt)
    verdict = response.content.strip().upper()
    return "NEWTOPIC" in verdict


async def stream_research(query: str):
    async def event_stream():
        try:
            yield f"data: {json.dumps({'type': 'start'})}\n\n"
            await asyncio.sleep(0.05)

            initial_state = {
                "query": query,
                "refined_query": "",
                "tool_calls": [],
                "tool_choice": "",
                "search_results": [],
                "reranked_results": [],
                "results_quality": "",
                "retry_count": 0,
                "summary": "",
                "fact_check": "",
                "final_report": ""
            }

            event_queue = queue.Queue()

            def run_pipeline():
                try:
                    final_state = None

                    # stream() yields after each node completes — one node at a time
                    for step in graph_app.stream(initial_state):
                        for node_name, node_state in step.items():
                            if node_name in NODE_MAP:
                                agent_id, message = NODE_MAP[node_name]
                                event_queue.put({
                                    "type": "agent",
                                    "agent": agent_id,
                                    "status": "done",
                                    "message": message
                                })
                            # Keep track of latest state
                            final_state = node_state

                    # After stream completes, send final result
                    if final_state:
                        tool_calls = final_state.get("tool_calls", [])
                        tools_used = list(set([tc["name"] for tc in tool_calls])) if tool_calls else ["web_search"]
                        retry_count = final_state.get("retry_count", 0)
                        sources = [
                            {
                                "title": r.get("title", ""),
                                "url": r.get("url", ""),
                                "score": round(r.get("relevance_score", 0), 2)
                            }
                            for r in final_state.get("reranked_results", [])
                        ]
                        event_queue.put({
                            "type": "complete",
                            "report": final_state.get("final_report", ""),
                            "tools_used": tools_used,
                            "retries": retry_count,
                            "sources": sources
                        })
                    else:
                        event_queue.put({"type": "error", "message": "Pipeline returned no state"})

                except Exception as e:
                    event_queue.put({"type": "error", "message": str(e)})

            # Run pipeline in background thread so we can yield events async
            thread = threading.Thread(target=run_pipeline)
            thread.start()

            # Read events from queue and stream them to frontend
            while True:
                try:
                    event = event_queue.get(timeout=180)
                    yield f"data: {json.dumps(event)}\n\n"

                    if event["type"] in ("complete", "error"):
                        break

                    await asyncio.sleep(0.05)

                except queue.Empty:
                    # Keep connection alive
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@app.post("/research")
async def research(request: QueryRequest):
    return await stream_research(request.query)


@app.post("/followup")
async def followup(request: FollowupRequest):
    history_text = ""
    for turn in request.conversation_history:
        role = "User" if turn["role"] == "user" else "Assistant"
        history_text += f"{role}: {turn['content']}\n\n"

    prompt = f"""You are a research assistant. Answer the follow-up question based on the conversation.
If new information is needed, say so clearly.

Conversation History:
{history_text}
User: {request.question}

Answer:"""

    response = llm.invoke(prompt)
    return {"answer": response.content.strip(), "type": "followup"}


@app.post("/check-topic")
async def check_topic(request: QueryRequest):
    new_topic = is_new_topic(request.query, request.conversation_history)
    return {"is_new_topic": new_topic}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Minerva API"}
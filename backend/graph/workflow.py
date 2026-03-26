from langgraph.graph import StateGraph, END
from state.schema import ResearchState
from agents.search import search_agent
from agents.reranker import reranker_agent
from agents.supervisor import supervisor_agent
from agents.summarizer import summarizer_agent
from agents.writer import writer_agent


def route_after_supervisor(state: ResearchState) -> str:
    """
    After supervisor runs:
    - If no search_results yet (first run) → go to search_agent to execute tools
    - If results are poor (retry) → go to search_agent with refined query
    - If results are good → go to summarizer_agent
    """
    # First run — supervisor just picked tools, search hasn't run yet
    if not state.get("search_results"):
        return "search_agent"

    # Retry — results were poor, search again with refined query
    if state.get("results_quality") == "poor":
        return "search_agent"

    # Results are good — move forward
    return "summarizer_agent"


def build_graph():
    """
    Corrected flow — Supervisor runs FIRST to pick tools via function calling,
    then Search executes those tools, then Reranker scores results,
    then Supervisor checks quality (retry if needed).

    Flow:
    supervisor_agent (picks tools via Gemini function calling)
          ↓
    search_agent (executes the chosen tools)
          ↓
    reranker_agent (scores and filters results)
          ↓
    supervisor_agent (quality check — retry or continue)
          ↓ poor                    ↓ good
    search_agent              summarizer_agent
    (retry loop)                    ↓
                               writer_agent
                                    ↓
                                  END
    """
    graph = StateGraph(ResearchState)

    # Add all nodes
    graph.add_node("supervisor_agent", supervisor_agent)
    graph.add_node("search_agent", search_agent)
    graph.add_node("reranker_agent", reranker_agent)
    graph.add_node("summarizer_agent", summarizer_agent)
    graph.add_node("writer_agent", writer_agent)

    # Supervisor runs FIRST — picks tools via Gemini function calling
    graph.set_entry_point("supervisor_agent")

    # Conditional edge after supervisor
    graph.add_conditional_edges(
        "supervisor_agent",
        route_after_supervisor,
        {
            "search_agent": "search_agent",
            "summarizer_agent": "summarizer_agent"
        }
    )

    # Search → Rerank → back to Supervisor for quality check
    graph.add_edge("search_agent", "reranker_agent")
    graph.add_edge("reranker_agent", "supervisor_agent")

    # Final pipeline
    graph.add_edge("summarizer_agent", "writer_agent")
    graph.add_edge("writer_agent", END)

    return graph.compile()
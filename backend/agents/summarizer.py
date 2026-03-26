from langchain_google_genai import ChatGoogleGenerativeAI
from state.schema import ResearchState
import os

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

def summarizer_agent(state: ResearchState) -> ResearchState:
    """
    Summarizer Agent — reads the top reranked search results
    and produces a clean, structured summary using Gemini.
    """
    print("\n📝 Summarizer Agent running...")

    reranked_results = state["reranked_results"]

    results_text = ""
    for i, result in enumerate(reranked_results, 1):
        title = result.get("title", "No title")
        content = result.get("content", "")[:2000]
        url = result.get("url", "")
        score = result.get("relevance_score", 0)
        results_text += f"\n[Source {i}] {title} (relevance: {score:.2f})\nURL: {url}\n{content}\n"

    prompt = f"""You are a research summarizer. Below are the top search results for the following query:

Query: {state['query']}

Search Results:
{results_text}

Write a clear, structured summary of the key findings. Format it as:
- Use bullet points for key facts
- Group related points together
- Mention which source each key point comes from (e.g. [Source 1])
- Be concise but comprehensive
- Do not add information that is not in the search results"""

    response = llm.invoke(prompt)
    summary = response.content.strip()

    print("   Summary generated successfully.")
    return {**state, "summary": summary}
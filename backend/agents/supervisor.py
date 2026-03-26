"""
supervisor.py — Supervisor Agent

Two responsibilities:
1. TOOL SELECTION via real function calling (first run)
2. QUALITY CHECK after reranking (every run) — retry if poor
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from state.schema import ResearchState
from agents.search_tools import ALL_TOOLS
import os

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# Gemini with tools bound — for autonomous tool selection
llm_with_tools = llm.bind_tools(ALL_TOOLS)

MAX_RETRIES = 2


def supervisor_agent(state: ResearchState) -> ResearchState:
    print("\n🧠 Supervisor Agent running...")

    retry_count = state.get("retry_count", 0)
    reranked_results = state.get("reranked_results", [])

    # ── TOOL SELECTION (first run only) ─────────────────────────
    if retry_count == 0 and not state.get("tool_calls"):
        print("   🤖 Gemini deciding which tools to call...")
        try:
            response = llm_with_tools.invoke(
                f"I need to research this topic thoroughly: {state['query']}\n"
                f"Use the most appropriate search tool(s) to find relevant information."
            )
            tool_calls = response.tool_calls
            if tool_calls:
                for tc in tool_calls:
                    print(f"   ✅ Gemini chose: {tc['name']}({tc['args']})")
            else:
                print("   ⚠️  Gemini didn't call a tool — using web_search fallback")
                tool_calls = [{"name": "web_search", "args": {"query": state["query"]}}]
        except Exception as e:
            print(f"   ⚠️  Tool selection failed: {e}. Using web_search fallback")
            tool_calls = [{"name": "web_search", "args": {"query": state["query"]}}]

        state = {**state, "tool_calls": tool_calls}

    # ── QUALITY CHECK ────────────────────────────────────────────

    # Max retries reached — continue with best results
    if retry_count >= MAX_RETRIES:
        print(f"   Max retries ({MAX_RETRIES}) reached. Continuing with best results.")
        return {**state, "results_quality": "good"}

    # No reranked results yet
    if not reranked_results:
        if not state.get("search_results"):
            # Search hasn't run yet — first run passthrough
            print("   First run — waiting for search results.")
            return {**state, "results_quality": "poor", "retry_count": retry_count}
        else:
            # Search ran but nothing came back — retry
            print("   Search returned no rankable results. Retrying...")
            return _retry(state, retry_count)

    # Check reranker score
    top_score = reranked_results[0].get("relevance_score", 0)
    print(f"   Top relevance score: {top_score:.2f}")

    if top_score < 0.0:
        print(f"   Score {top_score:.2f} is negative. Retrying...")
        return _retry(state, retry_count)

    # Gemini quality check
    print("   Asking Gemini to verify result quality...")
    top_result_content = reranked_results[0].get("content", "")[:500]

    quality_prompt = f"""Evaluate if these search results are relevant to the research query.

Query: {state['query']}

Top result content:
{top_result_content}

Are these results relevant and useful? Reply with ONLY one word: YES or NO"""

    try:
        quality_response = llm.invoke(quality_prompt)
        verdict = quality_response.content.strip().upper()
    except Exception as e:
        print(f"   Quality check failed: {e}. Assuming good.")
        verdict = "YES"

    print(f"   Gemini quality verdict: {verdict}")

    if "NO" in verdict:
        print("   Results are poor quality. Retrying...")
        return _retry(state, retry_count)

    print("   Results are good quality. Moving to Summarizer.")
    return {**state, "results_quality": "good"}


def _retry(state: ResearchState, retry_count: int) -> ResearchState:
    """Generate a refined query and re-select tools."""

    refine_prompt = f"""The following search query did not return good results:
"{state.get('refined_query') or state['query']}"

Generate a better search query that covers the SAME topic and intent as the original.
Do NOT narrow the topic or focus on just one aspect.
Just rephrase it differently to get better search results.
Reply with ONLY the search query — no explanation, no quotes."""

    try:
        response = llm.invoke(refine_prompt)
        refined_query = response.content.strip()
    except Exception as e:
        refined_query = state.get("refined_query") or state["query"]

    print(f"   🔄 RETRY {retry_count + 1}: Refined query: '{refined_query}'")

    # Re-select tools for refined query
    try:
        tool_response = llm_with_tools.invoke(
            f"I need to research this topic thoroughly: {refined_query}\n"
            f"Use the most appropriate search tool(s) to find relevant information."
        )
        new_tool_calls = tool_response.tool_calls
        if new_tool_calls:
            for tc in new_tool_calls:
                print(f"   ✅ Gemini chose: {tc['name']}({tc['args']})")
        else:
            new_tool_calls = [{"name": "web_search", "args": {"query": refined_query}}]
    except Exception as e:
        print(f"   ⚠️  Tool re-selection failed. Using web_search.")
        new_tool_calls = [{"name": "web_search", "args": {"query": refined_query}}]

    return {
        **state,
        "results_quality": "poor",
        "refined_query": refined_query,
        "retry_count": retry_count + 1,
        "tool_calls": new_tool_calls,
        "search_results": [],
        "reranked_results": [],
    }
"""
search.py — Search Agent

Now much simpler. Instead of routing logic, this agent just
executes whatever tool Gemini decided to call via function calling.
The tool choice is made by Gemini in supervisor.py, not here.
"""

from state.schema import ResearchState
from agents.search_tools import web_search, news_search, academic_search, youtube_search, wikipedia_search

# Map tool names to actual functions
TOOL_REGISTRY = {
    "web_search": web_search,
    "news_search": news_search,
    "academic_search": academic_search,
    "wikipedia_search": wikipedia_search,
}


def search_agent(state: ResearchState) -> ResearchState:
    """
    Search Agent — executes the tool that Gemini selected via function calling.
    Can also execute MULTIPLE tools if Gemini decided to call more than one.
    Falls back to web_search if no tool was chosen yet (first run edge case).
    """
    print("\n🔍 Search Agent running...")

    query_to_use = state.get("refined_query") or state["query"]
    tool_calls = state.get("tool_calls", [])  # set by supervisor via function calling

    all_results = []

    if tool_calls:
        # Execute every tool Gemini decided to call
        for tool_call in tool_calls:
            tool_name = tool_call.get("name")
            tool_args = tool_call.get("args", {})

            print(f"   🔧 Executing: {tool_name}({tool_args})")

            if tool_name in TOOL_REGISTRY:
                # Call the actual tool function with Gemini's chosen arguments
                results = TOOL_REGISTRY[tool_name].invoke(tool_args)
                if isinstance(results, list):
                    all_results.extend(results)
    else:
        # First run — supervisor hasn't run yet, use web_search as default
        print(f"   Tool: web_search (default, supervisor not run yet)")
        print(f"   Searching for: {query_to_use}")
        all_results = web_search.invoke({"query": query_to_use})

    print(f"   Total results collected: {len(all_results)}")
    return {**state, "search_results": all_results}
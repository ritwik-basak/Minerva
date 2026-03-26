from langchain_google_genai import ChatGoogleGenerativeAI
from state.schema import ResearchState
import os

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

def writer_agent(state: ResearchState) -> ResearchState:
    """
    Writer Agent — takes the summary and produces a final
    polished research report using Gemini.
    """
    print("\n✍️  Writer Agent running...")

    sources_list = ""
    for i, result in enumerate(state["reranked_results"], 1):
        title = result.get("title", "No title")
        url = result.get("url", "")
        score = result.get("relevance_score", 0)
        sources_list += f"[{i}] {title} (relevance: {score:.2f})\n    {url}\n"

    prompt = f"""You are a professional research writer.
Using the summary below, write a final structured research report.

Original Query: {state['query']}

Summary:
{state['summary']}

Write the final report in this exact format:

# Research Report: [topic]

## Overview
[2-3 sentence introduction]

## Key Findings
[Detailed findings in bullet points]

## Conclusion
[2-3 sentence conclusion]

## Sources
{sources_list}

Keep the tone professional and factual. Do not add information not present in the summary."""

    response = llm.invoke(prompt)
    final_report = response.content.strip()

    print("   Final report written successfully.")
    return {**state, "final_report": final_report, "fact_check": ""}
"""
search_tools.py — All search tools defined with LangChain @tool decorator.

Using @tool means Gemini can call these functions DIRECTLY through
function calling API — no if/else routing needed in your code.
Gemini reads the docstring to understand what each tool does.
"""

from langchain_core.tools import tool
from tavily import TavilyClient
import os
import arxiv
import wikipedia
from googleapiclient.discovery import build


@tool
def web_search(query: str) -> list:
    """
    Search the web for general topics — travel, products, people,
    places, how-to questions, or anything that doesn't fit other categories.
    Use this for broad everyday research questions.
    Examples: famous tourist spots India, best laptops 2026, how to learn python
    """
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    response = client.search(
        query=query,
        max_results=8,
        search_depth="basic"
    )
    results = response.get("results", [])
    print(f"   [web_search] Found {len(results)} results")
    return results


@tool
def news_search(query: str) -> list:
    """
    Search for current events, breaking news, stock market updates,
    politics, sports scores, business news — anything time-sensitive
    happening recently or today.
    Examples: Apple stock today, IPL 2026 results, US election news
    """
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    response = client.search(
        query=query,
        max_results=8,
        search_depth="basic",
        topic="news"
    )
    results = response.get("results", [])
    print(f"   [news_search] Found {len(results)} results")
    return results


@tool
def academic_search(query: str) -> list:
    """
    Search academic papers and scientific research on ArXiv.
    Use for scientific topics, medical research, technical papers,
    machine learning, physics, biology, engineering research.
    Examples: CRISPR base editing, quantum computing algorithms, transformer architecture
    """
    search = arxiv.Search(
        query=query,
        max_results=8,
        sort_by=arxiv.SortCriterion.Relevance
    )
    results = []
    for paper in search.results():
        results.append({
            "title": paper.title,
            "url": paper.entry_id,
            "content": paper.summary,
            "source": "arxiv",
            "published": str(paper.published.date()) if paper.published else ""
        })
    print(f"   [academic_search] Found {len(results)} papers")
    return results


@tool
def youtube_search(query: str) -> list:
    """
    Search YouTube for video tutorials, lectures, interviews,
    documentaries, how-to videos, product reviews, or course content.
    Use when the user wants to learn something through video format.
    Examples: python tutorial, Elon Musk interview, how to cook biryani
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    youtube = build("youtube", "v3", developerKey=api_key)
    response = youtube.search().list(
        q=query,
        part="snippet",
        maxResults=8,
        type="video",
        relevanceLanguage="en"
    ).execute()

    results = []
    for item in response.get("items", []):
        snippet = item["snippet"]
        video_id = item["id"]["videoId"]
        results.append({
            "title": snippet["title"],
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "content": snippet["description"],
            "source": "youtube",
            "channel": snippet["channelTitle"]
        })
    print(f"   [youtube_search] Found {len(results)} videos")
    return results


@tool
def wikipedia_search(query: str) -> list:
    """
    Search Wikipedia for background information, historical facts,
    biographies, definitions of concepts, or general knowledge about
    well-established topics.
    Examples: history of Roman Empire, who is Albert Einstein, French Revolution
    """
    wikipedia.set_lang("en")
    search_titles = wikipedia.search(query, results=5)

    results = []
    for title in search_titles:
        try:
            page = wikipedia.page(title, auto_suggest=False)
            results.append({
                "title": page.title,
                "url": page.url,
                "content": page.content[:2000],
                "source": "wikipedia"
            })
        except (wikipedia.DisambiguationError, wikipedia.PageError):
            continue

    # If Wikipedia returned nothing, fall back to web_search
    if not results:
        print("   [wikipedia_search] No results — falling back to web_search")
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        response = client.search(query=query, max_results=8, search_depth="basic")
        results = response.get("results", [])
        print(f"   [wikipedia_search → web_search fallback] Found {len(results)} results")
    else:
        print(f"   [wikipedia_search] Found {len(results)} pages")

    return results


# Export all tools as a list — used by supervisor to bind to Gemini
ALL_TOOLS = [web_search, news_search, academic_search, wikipedia_search]
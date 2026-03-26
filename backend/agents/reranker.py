from sentence_transformers import CrossEncoder
from state.schema import ResearchState

# Load the reranker model once when the file is imported
# This avoids reloading it on every function call
print("   Loading HuggingFace reranker model (first time may take a moment)...")
reranker_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def reranker_agent(state: ResearchState) -> ResearchState:
    """
    Reranker Agent — uses HuggingFace CrossEncoder to score each
    search result against the query and return only the top 5 most relevant.
    """
    print("\n📊 Reranker Agent running...")

    query = state.get("refined_query") or state["query"]
    search_results = state["search_results"]

    if not search_results:
        print("   No search results to rerank.")
        return {**state, "reranked_results": []}

    # Build (query, document_content) pairs for the reranker
    pairs = [
        [query, result.get("content", "") or result.get("snippet", "")]
        for result in search_results
    ]

    # Score each pair — returns a list of floats between 0 and 1
    scores = reranker_model.predict(pairs)

    # Attach scores to results
    scored_results = [
        {**result, "relevance_score": float(score)}
        for result, score in zip(search_results, scores)
    ]

    # Sort by score — highest first
    scored_results.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Keep only top 5
    top_results = scored_results[:5]

    print(f"   Top result score: {top_results[0]['relevance_score']:.2f}")
    print(f"   Keeping top 5 out of {len(search_results)} results")

    return {**state, "reranked_results": top_results}
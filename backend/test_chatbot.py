"""
Quick test script to verify RAG chatbot is working with indexed content
"""

import os
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient

# Load environment variables
load_dotenv()

# Configuration
COLLECTION_NAME = "textbook_content"
EMBEDDING_MODEL = "embed-english-light-v3.0"

# Initialize clients
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

def test_search(query: str, top_k: int = 3):
    """Test semantic search with a query."""
    print(f"\n{'='*70}")
    print(f"Query: {query}")
    print(f"{'='*70}")

    # Generate query embedding
    response = cohere_client.embed(
        texts=[query],
        model=EMBEDDING_MODEL,
        input_type="search_query"
    )
    query_embedding = response.embeddings[0]

    # Search Qdrant
    search_results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=top_k
    ).points

    print(f"\nFound {len(search_results)} results:\n")

    for i, result in enumerate(search_results, 1):
        print(f"Result {i}:")
        print(f"  Score: {result.score:.3f}")
        print(f"  Chapter: {result.payload.get('chapter', 'N/A')}")
        print(f"  Section: {result.payload.get('section', 'N/A')}")
        print(f"  Module: {result.payload.get('module', 'N/A')}")
        print(f"  Source: {result.payload.get('source', 'N/A')}")
        print(f"  Text preview: {result.payload.get('text', '')[:150]}...")
        print()

if __name__ == "__main__":
    print("\n" + "="*70)
    print("RAG Chatbot Search Test")
    print("="*70)

    # Test queries
    test_queries = [
        "What is ROS 2?",
        "Explain humanoid robotics",
        "Tell me about computer vision"
    ]

    for query in test_queries:
        test_search(query)

    print("="*70)
    print("Test complete!")
    print("="*70)

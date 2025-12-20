"""
Quick test script to verify backend setup and API credentials
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("RAG Backend Setup Verification")
print("=" * 60)

# Check environment variables
checks = {
    "Cohere API Key": os.getenv("COHERE_API_KEY"),
    "Qdrant URL": os.getenv("QDRANT_URL"),
    "Qdrant API Key": os.getenv("QDRANT_API_KEY"),
    "Neon DB URL": os.getenv("NEON_DB_URL"),
}

all_good = True
for name, value in checks.items():
    status = "[OK]" if value else "[MISSING]"
    masked = value[:20] + "..." if value and len(value) > 20 else value or "NOT SET"
    print(f"{status} {name}: {masked}")
    if not value:
        all_good = False

print("=" * 60)

if all_good:
    print("[OK] All environment variables are set!")

    # Test Cohere connection
    try:
        import cohere
        co = cohere.Client(os.getenv("COHERE_API_KEY"))
        print("\n[OK] Cohere client initialized successfully")
    except Exception as e:
        print(f"\n[FAIL] Cohere connection failed: {e}")
        all_good = False

    # Test Qdrant connection
    try:
        from qdrant_client import QdrantClient
        qdrant = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        collections = qdrant.get_collections()
        print(f"[OK] Qdrant connected - {len(collections.collections)} collections found")
    except Exception as e:
        print(f"[FAIL] Qdrant connection failed: {e}")
        all_good = False

    print("=" * 60)
    if all_good:
        print("\nSUCCESS! Setup verified! Ready to run the backend.\n")
        print("Run: python main.py")
        print("Or:  uvicorn main:app --reload")
    else:
        print("\nWARNING: Some services failed to connect. Check your credentials.")
else:
    print("\nERROR: Missing environment variables. Copy .env.example to .env and fill in your keys.")

print("=" * 60)

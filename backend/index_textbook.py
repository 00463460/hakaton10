"""
Textbook Indexing Script for RAG Backend
=========================================

This script reads all markdown files from the docs/ directory,
chunks them intelligently, generates embeddings using Cohere,
and uploads them to Qdrant for semantic search.

Usage:
    python index_textbook.py
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Load environment variables
load_dotenv()

# Configuration
DOCS_DIR = Path(__file__).parent.parent / "docs"
COLLECTION_NAME = "textbook_content"
EMBEDDING_MODEL = "embed-english-light-v3.0"
EMBEDDING_DIMENSION = 384
CHUNK_SIZE = 800  # characters per chunk
OVERLAP = 100  # character overlap between chunks

# Initialize clients
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)


def extract_title_from_content(content: str) -> str:
    """Extract the first H1 heading from markdown content."""
    match = re.search(r'^# (.+)$', content, re.MULTILINE)
    return match.group(1).strip() if match else "Untitled"


def chunk_text_by_sections(content: str, file_path: str) -> List[Dict[str, Any]]:
    """
    Chunk text intelligently by markdown sections (headings).
    Falls back to character-based chunking if sections are too large.
    """
    chunks = []

    # Extract title
    title = extract_title_from_content(content)

    # Split by H2 headings
    sections = re.split(r'\n## ', content)

    for i, section in enumerate(sections):
        # Add back the ## marker (except for first section which might be H1)
        if i > 0:
            section = "## " + section

        section = section.strip()
        if not section or len(section) < 50:  # Skip very short sections
            continue

        # Extract section title
        section_match = re.search(r'^## (.+)$', section, re.MULTILINE)
        section_title = section_match.group(1).strip() if section_match else "Introduction"

        # If section is small enough, use it as-is
        if len(section) <= CHUNK_SIZE:
            chunks.append({
                "text": section,
                "section": section_title,
                "size": len(section)
            })
        else:
            # Split large sections into smaller chunks
            words = section.split()
            current_chunk = []
            current_size = 0

            for word in words:
                word_size = len(word) + 1  # +1 for space
                if current_size + word_size > CHUNK_SIZE and current_chunk:
                    chunk_text = " ".join(current_chunk)
                    chunks.append({
                        "text": chunk_text,
                        "section": section_title,
                        "size": len(chunk_text)
                    })
                    # Keep overlap
                    overlap_words = current_chunk[-20:] if len(current_chunk) > 20 else current_chunk
                    current_chunk = overlap_words + [word]
                    current_size = sum(len(w) + 1 for w in current_chunk)
                else:
                    current_chunk.append(word)
                    current_size += word_size

            # Add remaining chunk
            if current_chunk:
                chunk_text = " ".join(current_chunk)
                chunks.append({
                    "text": chunk_text,
                    "section": section_title,
                    "size": len(chunk_text)
                })

    return chunks


def process_markdown_file(file_path: Path) -> List[Dict[str, Any]]:
    """Process a single markdown file and return chunks with metadata."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract metadata from file path
    relative_path = file_path.relative_to(DOCS_DIR.parent)
    parts = relative_path.parts

    module = parts[1] if len(parts) > 1 else "unknown"  # e.g., "module-1"
    chapter_file = parts[2] if len(parts) > 2 else "unknown"  # e.g., "chapter-1.md"

    # Extract title from content
    title = extract_title_from_content(content)

    # Chunk the content
    chunks = chunk_text_by_sections(content, str(file_path))

    # Add metadata to each chunk
    for chunk in chunks:
        chunk.update({
            "source": str(relative_path).replace('\\', '/'),
            "module": module.replace('-', ' ').title(),
            "chapter": title,
            "file": chapter_file
        })

    return chunks


def create_collection_if_not_exists():
    """Create Qdrant collection if it doesn't exist."""
    try:
        collections = qdrant_client.get_collections().collections
        collection_names = [c.name for c in collections]

        if COLLECTION_NAME in collection_names:
            print(f"[WARNING] Collection '{COLLECTION_NAME}' already exists. Recreating...")
            qdrant_client.delete_collection(COLLECTION_NAME)

        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=EMBEDDING_DIMENSION,
                distance=Distance.COSINE
            )
        )
        print(f"[OK] Collection '{COLLECTION_NAME}' created successfully")

    except Exception as e:
        print(f"[ERROR] Error creating collection: {e}")
        raise


def index_documents():
    """Main indexing function."""
    print("=" * 70)
    print("Physical AI Textbook Indexing Script")
    print("=" * 70)

    # Verify docs directory exists
    if not DOCS_DIR.exists():
        print(f"[ERROR] Docs directory not found: {DOCS_DIR}")
        return

    print(f"\nReading markdown files from: {DOCS_DIR}")

    # Find all markdown files
    md_files = list(DOCS_DIR.glob("**/*.md"))
    print(f"Found {len(md_files)} markdown files")

    if not md_files:
        print("[WARNING] No markdown files found!")
        return

    # Create collection
    print("\nSetting up Qdrant collection...")
    create_collection_if_not_exists()

    # Process all files
    all_chunks = []
    print("\nProcessing files...")

    for file_path in md_files:
        print(f"  - {file_path.name}...", end=" ")
        try:
            chunks = process_markdown_file(file_path)
            all_chunks.extend(chunks)
            print(f"[OK] {len(chunks)} chunks")
        except Exception as e:
            print(f"[ERROR] {e}")

    print(f"\nTotal chunks created: {len(all_chunks)}")

    if not all_chunks:
        print("[WARNING] No chunks to index!")
        return

    # Generate embeddings in batches
    print("\nGenerating embeddings with Cohere...")
    batch_size = 96  # Cohere API limit
    all_embeddings = []

    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i + batch_size]
        texts = [chunk["text"] for chunk in batch]

        try:
            response = cohere_client.embed(
                texts=texts,
                model=EMBEDDING_MODEL,
                input_type="search_document"
            )
            all_embeddings.extend(response.embeddings)
            print(f"  [OK] Batch {i//batch_size + 1}/{(len(all_chunks)-1)//batch_size + 1} completed")
        except Exception as e:
            print(f"  [ERROR] Error generating embeddings for batch {i//batch_size + 1}: {e}")
            raise

    print(f"[OK] Generated {len(all_embeddings)} embeddings")

    # Upload to Qdrant
    print("\nUploading to Qdrant...")
    points = []

    for idx, (chunk, embedding) in enumerate(zip(all_chunks, all_embeddings)):
        point = PointStruct(
            id=idx,
            vector=embedding,
            payload={
                "text": chunk["text"],
                "source": chunk["source"],
                "module": chunk["module"],
                "chapter": chunk["chapter"],
                "section": chunk["section"],
                "file": chunk["file"],
                "size": chunk["size"]
            }
        )
        points.append(point)

    try:
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"[OK] Uploaded {len(points)} chunks to Qdrant")
    except Exception as e:
        print(f"[ERROR] Error uploading to Qdrant: {e}")
        raise

    # Verify upload
    collection_info = qdrant_client.get_collection(COLLECTION_NAME)
    print(f"\nCollection Info:")
    print(f"  - Name: {COLLECTION_NAME}")
    print(f"  - Points: {collection_info.points_count}")

    print("\n" + "=" * 70)
    print("SUCCESS! Textbook indexed successfully!")
    print("=" * 70)
    print("\nNow you can ask questions like:")
    print("  - What is ROS 2?")
    print("  - Explain humanoid robotics")
    print("  - How do vision-language-action models work?")
    print("\nThe chatbot will answer from your textbook content!")


if __name__ == "__main__":
    try:
        index_documents()
    except KeyboardInterrupt:
        print("\n\n[WARNING] Indexing interrupted by user")
    except Exception as e:
        print(f"\n\n[ERROR] Fatal error: {e}")
        import traceback
        traceback.print_exc()

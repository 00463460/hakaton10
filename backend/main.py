"""
RAG Chatbot Backend - FastAPI Application
Uses Cohere for LLM and embeddings, Qdrant for vector storage, Neon for PostgreSQL
"""

import os
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import structlog
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize structured logger
logger = structlog.get_logger()

# Environment variables
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", ":memory:")  # Use in-memory for local dev
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
NEON_DB_URL = os.getenv("NEON_DB_URL")

# Cohere configuration
EMBEDDING_MODEL = "embed-english-light-v3.0"  # Free-tier friendly
LLM_MODEL = "command-light"  # Free-tier friendly
VECTOR_DIMENSION = 384  # Dimension for embed-english-light-v3.0

# Global clients (initialized in lifespan)
cohere_client: Optional[cohere.Client] = None
qdrant_client: Optional[QdrantClient] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    global cohere_client, qdrant_client

    # Startup
    logger.info("Starting up RAG chatbot backend...")

    # Initialize Cohere client
    if not COHERE_API_KEY:
        logger.warning("COHERE_API_KEY not set, some features will be disabled")
    else:
        cohere_client = cohere.Client(COHERE_API_KEY)
        logger.info("Cohere client initialized")

    # Initialize Qdrant client
    try:
        if QDRANT_URL == ":memory:":
            qdrant_client = QdrantClient(":memory:")
            logger.info("Qdrant client initialized (in-memory mode)")
        else:
            qdrant_client = QdrantClient(
                url=QDRANT_URL,
                api_key=QDRANT_API_KEY
            )
            logger.info("Qdrant client initialized (cloud mode)")

        # Create collection if it doesn't exist
        collection_name = "textbook_content"
        collections = qdrant_client.get_collections().collections
        if not any(c.name == collection_name for c in collections):
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=VECTOR_DIMENSION,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Created Qdrant collection: {collection_name}")
    except Exception as e:
        logger.error(f"Failed to initialize Qdrant: {e}")
        qdrant_client = None

    yield

    # Shutdown
    logger.info("Shutting down RAG chatbot backend...")
    if qdrant_client:
        qdrant_client.close()


# Initialize FastAPI app
app = FastAPI(
    title="Physical AI Textbook RAG Chatbot",
    description="RAG-powered chatbot for the Physical AI & Humanoid Robotics textbook",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Models
# ============================================================================

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    query: str = Field(..., description="User's question or query", min_length=1)
    selected_text_context: Optional[str] = Field(
        None,
        description="Optional text selected by user for context"
    )
    conversation_history: Optional[List[dict]] = Field(
        default=None,
        description="Optional conversation history for context"
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    answer: str = Field(..., description="Generated answer from the RAG system")
    sources: List[dict] = Field(
        default_factory=list,
        description="Source documents used to generate the answer"
    )
    metadata: dict = Field(
        default_factory=dict,
        description="Additional metadata about the response"
    )


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    version: str
    services: dict


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify service status
    """
    services = {
        "cohere": "connected" if cohere_client else "disconnected",
        "qdrant": "connected" if qdrant_client else "disconnected",
        "neon": "not_implemented"
    }

    return HealthResponse(
        status="healthy" if all(v != "disconnected" for k, v in services.items() if k != "neon") else "degraded",
        version="1.0.0",
        services=services
    )


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for RAG-powered question answering

    Process:
    1. Generate embedding for user query using Cohere
    2. Search Qdrant vector database for relevant chunks
    3. Retrieve relevant context from matched documents
    4. Generate answer using Cohere LLM with context
    """
    try:
        logger.info("Processing chat request", query=request.query)

        # Validate clients
        if not cohere_client:
            raise HTTPException(
                status_code=503,
                detail="Cohere service not available"
            )

        if not qdrant_client:
            raise HTTPException(
                status_code=503,
                detail="Qdrant service not available"
            )

        # Step 1: Generate query embedding
        query_embedding = await generate_query_embedding(request.query)

        # Step 2: Search vector database
        search_results = await search_knowledge_base(
            query_embedding,
            top_k=5,
            selected_context=request.selected_text_context
        )

        # Step 3: Generate answer with context
        answer = await generate_answer(
            query=request.query,
            context_chunks=search_results,
            conversation_history=request.conversation_history
        )

        return ChatResponse(
            answer=answer["text"],
            sources=search_results,
            metadata={
                "model": LLM_MODEL,
                "chunks_used": len(search_results)
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error processing chat request", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# ============================================================================
# Helper Functions (Placeholders for RAG implementation)
# ============================================================================

async def generate_query_embedding(query: str) -> List[float]:
    """
    Generate embedding for user query using Cohere

    Args:
        query: User's question text

    Returns:
        List of floats representing the embedding vector
    """
    try:
        response = cohere_client.embed(
            texts=[query],
            model=EMBEDDING_MODEL,
            input_type="search_query"
        )
        return response.embeddings[0]
    except Exception as e:
        logger.error("Error generating query embedding", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embedding: {str(e)}"
        )


async def search_knowledge_base(
    query_embedding: List[float],
    top_k: int = 5,
    selected_context: Optional[str] = None
) -> List[dict]:
    """
    Search Qdrant vector database for relevant content chunks

    Args:
        query_embedding: Vector representation of user query
        top_k: Number of top results to return
        selected_context: Optional user-selected text for filtering

    Returns:
        List of relevant document chunks with metadata
    """
    try:
        collection_name = "textbook_content"

        # Perform vector search
        search_results = qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=top_k
        )

        # Format results
        formatted_results = []
        for result in search_results:
            formatted_results.append({
                "text": result.payload.get("text", ""),
                "score": result.score,
                "metadata": {
                    "source": result.payload.get("source", "unknown"),
                    "chapter": result.payload.get("chapter", "unknown"),
                    "section": result.payload.get("section", "unknown")
                }
            })

        # If selected_context provided, boost its relevance
        if selected_context:
            formatted_results.insert(0, {
                "text": selected_context,
                "score": 1.0,
                "metadata": {
                    "source": "user_selection",
                    "chapter": "N/A",
                    "section": "N/A"
                }
            })

        return formatted_results

    except Exception as e:
        logger.error("Error searching knowledge base", error=str(e))
        # Return empty results on error rather than failing
        return []


async def generate_answer(
    query: str,
    context_chunks: List[dict],
    conversation_history: Optional[List[dict]] = None
) -> dict:
    """
    Generate answer using Cohere LLM with retrieved context

    Args:
        query: User's question
        context_chunks: Relevant document chunks from vector search
        conversation_history: Optional previous conversation turns

    Returns:
        Dictionary containing generated answer and metadata
    """
    try:
        # Build context string from chunks
        context_text = "\n\n".join([
            f"[Source: {chunk['metadata']['source']}]\n{chunk['text']}"
            for chunk in context_chunks[:3]  # Use top 3 chunks
        ])

        # Build prompt
        system_prompt = """You are an expert AI assistant for the Physical AI & Humanoid Robotics textbook.
Answer questions accurately based on the provided context. If the context doesn't contain enough information,
say so clearly. Always cite your sources."""

        user_prompt = f"""Context from the textbook:
{context_text}

Question: {query}

Please provide a clear, accurate answer based on the context above."""

        # Generate response using Cohere
        response = cohere_client.generate(
            model=LLM_MODEL,
            prompt=user_prompt,
            max_tokens=500,
            temperature=0.3,  # Lower temperature for more factual responses
            k=0,
            stop_sequences=[],
            return_likelihoods='NONE'
        )

        return {
            "text": response.generations[0].text.strip(),
            "model": LLM_MODEL
        }

    except Exception as e:
        logger.error("Error generating answer", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(e)}"
        )


# ============================================================================
# Root endpoint
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Physical AI Textbook RAG Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

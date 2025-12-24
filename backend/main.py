"""
RAG Chatbot Backend - FastAPI Application
Uses Cohere for LLM and embeddings, Qdrant for vector storage, Neon for PostgreSQL
"""

import os
import asyncio
from typing import Optional, List
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import structlog
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row
import bcrypt
import jwt

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
LLM_MODEL = "command-a-03-2025"  # Latest Cohere model (command-r was deprecated Sept 2025)
VECTOR_DIMENSION = 384  # Dimension for embed-english-light-v3.0

# Authentication configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

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


class SignupRequest(BaseModel):
    """Request model for user signup"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")


class LoginRequest(BaseModel):
    """Request model for user login"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class AuthResponse(BaseModel):
    """Response model for authentication"""
    token: str = Field(..., description="JWT access token")
    email: str = Field(..., description="User email")
    message: str = Field(..., description="Success message")


class UserResponse(BaseModel):
    """Response model for user data"""
    id: int
    email: str
    created_at: str
    last_login: Optional[str]


# ============================================================================
# Database Helper Functions
# ============================================================================

def get_db_connection():
    """Get database connection with timeout"""
    return psycopg.connect(
        NEON_DB_URL,
        row_factory=dict_row,
        connect_timeout=10  # 10 second timeout
    )


def _signup_user_db(email: str, password_hash: str):
    """Database operation for signup (runs in thread pool)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if user already exists
        cursor.execute("SELECT email FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            raise ValueError("Email already registered")

        # Create user
        cursor.execute(
            "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id",
            (email, password_hash)
        )
        conn.commit()
        return True
    finally:
        cursor.close()
        conn.close()


def _login_user_db(email: str, password: str):
    """Database operation for login (runs in thread pool)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get user
        cursor.execute("SELECT email, password_hash FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user or not verify_password(password, user['password_hash']):
            raise ValueError("Invalid email or password")

        # Update last login
        cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = %s", (email,))
        conn.commit()
        return user['email']
    finally:
        cursor.close()
        conn.close()


def _get_all_users_db():
    """Database operation to get all users (runs in thread pool)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, email, created_at, last_login FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        return users
    finally:
        cursor.close()
        conn.close()


# ============================================================================
# Authentication Helper Functions
# ============================================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_jwt_token(email: str) -> str:
    """Create JWT token for user"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "email": email,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token from request"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


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


@app.post("/api/v1/auth/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    User signup endpoint
    """
    try:
        # Hash password
        password_hash = hash_password(request.password)

        # Run database operation in thread pool
        await asyncio.to_thread(_signup_user_db, request.email, password_hash)

        # Create JWT token
        token = create_jwt_token(request.email)

        logger.info("User signup successful", email=request.email)

        return AuthResponse(
            token=token,
            email=request.email,
            message="Signup successful"
        )

    except ValueError as e:
        # Email already exists
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Signup error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@app.post("/api/v1/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    User login endpoint
    """
    try:
        # Run database operation in thread pool
        email = await asyncio.to_thread(_login_user_db, request.email, request.password)

        # Create JWT token
        token = create_jwt_token(email)

        logger.info("User login successful", email=email)

        return AuthResponse(
            token=token,
            email=email,
            message="Login successful"
        )

    except ValueError as e:
        # Invalid credentials
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/api/v1/auth/users", response_model=List[UserResponse])
async def get_all_users():
    """
    Get all registered users (for admin viewing)
    """
    try:
        # Run database operation in thread pool
        users = await asyncio.to_thread(_get_all_users_db)

        return [
            UserResponse(
                id=user['id'],
                email=user['email'],
                created_at=str(user['created_at']),
                last_login=str(user['last_login']) if user['last_login'] else None
            )
            for user in users
        ]

    except Exception as e:
        logger.error("Error fetching users", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


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
        search_results = qdrant_client.query_points(
            collection_name=collection_name,
            query=query_embedding,
            limit=top_k
        ).points

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
        # Build context string from chunks (if any)
        context_text = ""
        if context_chunks and len(context_chunks) > 0:
            context_text = "\n\n".join([
                f"[Source: {chunk['metadata']['source']}]\n{chunk['text']}"
                for chunk in context_chunks[:5]  # Use up to top 5 chunks for context
            ])

        # Build strict RAG system message
        system_message = """You are an AI assistant for the 'Physical AI & Humanoid Robotics' textbook.

CRITICAL RULE: You must ONLY use the provided context below to answer the user's question.

If the provided context is empty or does not contain the answer, you MUST respond with the following EXACT phrase:
'I don't know the answer to that based on the Physical AI textbook content.'

Do not use any external or general knowledge. If you can answer, cite the source from the context, e.g., (Source: Chapter 1)."""

        # Build user message with context
        if context_text:
            user_message = f"""[CONTEXT START]
{context_text}
[CONTEXT END]

User Question: {query}"""
        else:
            user_message = f"""[CONTEXT START]
(No relevant context found in the textbook)
[CONTEXT END]

User Question: {query}"""

        # Generate response using Cohere Chat API
        response = cohere_client.chat(
            model=LLM_MODEL,
            message=user_message,
            preamble=system_message,
            temperature=0.3,  # Lower temperature for more factual responses
            max_tokens=500
        )

        return {
            "text": response.text.strip(),
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

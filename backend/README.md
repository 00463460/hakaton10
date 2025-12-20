# Physical AI Textbook RAG Backend

This is the backend API for the Physical AI & Humanoid Robotics textbook chatbot. It uses Retrieval-Augmented Generation (RAG) to answer questions based on textbook content.

## Tech Stack

- **FastAPI** - Python web framework for API
- **Cohere** - LLM for generation and embeddings
  - `command-light` - Text generation model
  - `embed-english-light-v3.0` - Embedding model (384 dimensions)
- **Qdrant Cloud** - Vector database for semantic search
- **Neon PostgreSQL** - Serverless database for structured data

## Setup

1. Install dependencies:
```bash
cd backend
python -m venv venv
venv/Scripts/activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (already done)
   - Fill in your API keys (already configured)

3. Verify setup:
```bash
python test_setup.py
```

## Indexing the Textbook

Before using the chatbot, you need to index the textbook content into Qdrant:

```bash
python index_textbook.py
```

This script will:
- Read all markdown files from the `../docs/` directory
- Chunk them intelligently by sections (H2 headings)
- Generate embeddings using Cohere's `embed-english-light-v3.0`
- Upload chunks to Qdrant with metadata (chapter, module, source)

**Output:**
```
======================================================================
Physical AI Textbook Indexing Script
======================================================================

Reading markdown files from: C:\Users\...\docs
Found 11 markdown files

Setting up Qdrant collection...
[OK] Collection 'textbook_content' created successfully

Processing files...
  - chapter-1.md... [OK] 4 chunks
  - chapter-2.md... [OK] 4 chunks
  ...

Total chunks created: 44

Generating embeddings with Cohere...
  [OK] Batch 1/1 completed
[OK] Generated 44 embeddings

Uploading to Qdrant...
[OK] Uploaded 44 chunks to Qdrant

Collection Info:
  - Name: textbook_content
  - Points: 44

======================================================================
SUCCESS! Textbook indexed successfully!
======================================================================
```

## Running the Backend

Start the FastAPI server:

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

## Testing the Chatbot

Test the search functionality:

```bash
python test_chatbot.py
```

This will run test queries like:
- "What is ROS 2?"
- "Explain humanoid robotics"
- "Tell me about computer vision"

## API Endpoints

### POST `/api/v1/chat`

Send a chat message and get an AI-generated response based on textbook content.

**Request Body:**
```json
{
  "query": "What is ROS 2?",
  "selected_text_context": null,
  "conversation_history": []
}
```

**Response:**
```json
{
  "answer": "ROS 2 (Robot Operating System 2) is...",
  "sources": [
    {
      "text": "...",
      "metadata": {
        "chapter": "Chapter 3: ROS 2 Fundamentals",
        "source": "docs/module-2/chapter-3.md"
      },
      "score": 0.494
    }
  ],
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### GET `/health`

Health check endpoint.

## How RAG Works

1. **User Query** → Frontend sends question to backend
2. **Embedding** → Convert query to vector using Cohere embeddings
3. **Search** → Find top 5 most similar chunks in Qdrant
4. **Context Building** → Combine relevant chunks as context
5. **Generation** → Use Cohere LLM with context to generate answer
6. **Response** → Return answer with source citations

## Configuration

Edit these values in `index_textbook.py` or `main.py`:

- `CHUNK_SIZE` - Characters per chunk (default: 800)
- `TOP_K_CHUNKS` - Number of chunks to retrieve (default: 5)
- `MAX_RESPONSE_TOKENS` - Max tokens in response (default: 500)
- `LLM_TEMPERATURE` - Creativity level (default: 0.3)

## Re-indexing

If you update textbook content:

1. Edit markdown files in `../docs/`
2. Run `python index_textbook.py` again
3. The script will recreate the collection with fresh content

## Troubleshooting

**Problem:** `COHERE_API_KEY not set` warning
- **Solution:** Make sure `.env` file exists and `load_dotenv()` is called in `main.py`

**Problem:** Chatbot returns 500 error
- **Solution:** Run `python index_textbook.py` to populate Qdrant database

**Problem:** No results found for queries
- **Solution:** Check Qdrant collection has documents: `python test_chatbot.py`

**Problem:** Encoding errors on Windows
- **Solution:** Script has been updated to remove emoji characters

## Production Deployment

Deploy to Render, Railway, or Fly.io:

1. Push backend code to repository
2. Set environment variables in deployment platform
3. Update `BACKEND_URL` in frontend `ChatWidget.js`
4. Run `python index_textbook.py` in production environment

## Files

- `main.py` - FastAPI application
- `index_textbook.py` - Textbook indexing script
- `test_setup.py` - Verify environment and API connections
- `test_chatbot.py` - Test search functionality
- `.env` - Environment variables (not in git)
- `requirements.txt` - Python dependencies

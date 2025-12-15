# Phase 1: Data Model Design
# Feature: Hackathon Base Deliverables (Textbook & RAG Chatbot)

**Created**: 2025-12-12
**Branch**: 001-hackathon-base-mvp
**Prerequisites**: research.md

---

## Entity 1: DocumentChunk (PostgreSQL + Qdrant)

**Description**: Represents a segmented piece of textbook content indexed for vector search. Each chunk exists in two places: plain text + metadata in Postgres, embedding vector in Qdrant.

**Postgres Schema** (`document_chunks` table):
```sql
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_title TEXT NOT NULL,
    section_title TEXT,
    url TEXT NOT NULL,
    vector_id UUID NOT NULL UNIQUE,  -- References Qdrant vector UUID
    text_preview TEXT,  -- First 200 chars of chunk (for debugging)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT url_format CHECK (url ~ '^https?://')
);

CREATE INDEX idx_chapter_title ON document_chunks(chapter_title);
CREATE INDEX idx_section_title ON document_chunks(section_title);
CREATE INDEX idx_vector_id ON document_chunks(vector_id);
```

**Qdrant Payload Schema** (stored with each vector):
```json
{
  "chunk_id": "uuid-string",
  "chapter_title": "Chapter 4: The Digital Twin",
  "section_title": "4.2 URDF File Structure",
  "url": "https://user.github.io/physical-ai-textbook/module-2/chapter-4#urdf-file-structure",
  "text": "full chunk content (plain text, ~500 words)"
}
```

**Pydantic Model** (`app/models/entities.py`):
```python
from pydantic import BaseModel, UUID4, HttpUrl, Field
from datetime import datetime
from typing import Optional

class DocumentChunk(BaseModel):
    chunk_id: UUID4
    chapter_title: str = Field(..., min_length=1, max_length=200)
    section_title: Optional[str] = Field(None, max_length=200)
    url: HttpUrl
    vector_id: UUID4
    text_preview: Optional[str] = Field(None, max_length=200)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # For ORM compatibility if needed
```

**Validation Rules**:
- `chunk_id`: Auto-generated UUID v4
- `chapter_title`: Required, max 200 chars (covers "Chapter 4: The Digital Twin (Gazebo & Unity)")
- `section_title`: Optional (root-level chunks without section), max 200 chars
- `url`: Valid HTTP/HTTPS URL with domain validation
- `vector_id`: Must match UUID of vector in Qdrant collection
- `text_preview`: First 200 chars of chunk for admin debugging (not used in retrieval)

**Relationships**:
- 1:1 with Qdrant vector (via `vector_id`)
- N:1 with Chapter (implicit via `chapter_title`, not enforced by FK)

**State Transitions**: N/A (immutable after creation; updates require re-indexing)

---

## Entity 2: ChatMessage (Ephemeral, Frontend-Only)

**Description**: Represents a single message in the chatbot UI. Not persisted to database (FR-031).

**TypeScript Interface** (`frontend/src/components/Chatbot/types.ts`):
```typescript
export interface ChatMessage {
  id: string;  // UUID generated client-side
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];  // Only for assistant messages
  timestamp: number;  // Unix epoch ms
}

export interface SourceCitation {
  chapter: string;
  section: string;
  url: string;
}
```

**Validation Rules**:
- `id`: UUIDv4 generated on message creation
- `role`: Enum, only "user" or "assistant"
- `content`: 1-500 chars for user messages (enforced by frontend), unlimited for assistant
- `sources`: Array of 0-5 citations (backend returns max 5 chunks)
- `timestamp`: Current time in milliseconds (for sorting/display)

**Lifecycle**:
1. User types message → create ChatMessage with role='user', content=input
2. Submit to backend → receive response
3. Parse response → create ChatMessage with role='assistant', content=answer, sources=citations
4. Append both messages to React state array
5. On page reload/refresh → messages cleared (sessionStorage persistence optional UX enhancement, not required)

**Storage**: React component state (`useState<ChatMessage[]>`) or sessionStorage (optional)

---

## Entity 3: Chapter (Logical, Not Stored)

**Description**: Represents a textbook chapter. Exists as MDX file in Docusaurus repo, not as database entity. Metadata extracted during indexing.

**Logical Attributes** (extracted from MDX frontmatter + filename):
```yaml
# From MDX frontmatter
title: "Chapter 4: The Digital Twin (Gazebo & Unity)"
sidebar_position: 4
sidebar_label: "Ch4: Digital Twin"
description: "Learn about URDF/SDF models, physics simulation in Gazebo, and sensor simulation for LiDAR and depth cameras."

# Derived from file path
module: "Module 2: ROS 2 Fundamentals & Simulation"
url: "https://user.github.io/physical-ai-textbook/module-2/chapter-4"
mdx_source: "docs/module-2/chapter-4.mdx"
```

**Relationships**:
- 1:N with DocumentChunk (one chapter → many chunks)
- N:1 with Module (many chapters → one module)

**No Database Table**: Chapters are not stored separately. Chunk metadata (`chapter_title`) provides linkage.

---

## Entity 4: IndexingJob (Optional, for Monitoring)

**Description**: Tracks indexing operations. Optional for MVP, useful for debugging.

**Postgres Schema** (optional table):
```sql
CREATE TABLE IF NOT EXISTS indexing_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('running', 'completed', 'failed')),
    total_chapters INT,
    total_chunks INT,
    error_message TEXT,
    created_by TEXT DEFAULT 'system'
);
```

**Pydantic Model**:
```python
from enum import Enum

class IndexingStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class IndexingJob(BaseModel):
    job_id: UUID4
    started_at: datetime
    completed_at: Optional[datetime]
    status: IndexingStatus
    total_chapters: int = 0
    total_chunks: int = 0
    error_message: Optional[str] = None
```

**Decision**: Deferred to post-MVP (not required for FR-023 basic indexing functionality)

---

## Data Flow Diagrams

### Indexing Flow (Story 4: Index Textbook Content)

```
1. POST /api/v1/index triggered
2. Fetch MDX files from GitHub Pages
3. For each MDX file:
   a. Parse with gray-matter (extract frontmatter)
   b. Strip Markdown → plain text
   c. Chunk text (500 words, 50-word overlap)
   d. For each chunk:
      i. Generate embedding (OpenAI text-embedding-3-small)
      ii. Upsert vector to Qdrant → get vector_id
      iii. Insert metadata to Postgres document_chunks table
4. Return IndexingResponse with stats
```

**Data Entities Created**:
- N DocumentChunk rows in Postgres (where N = total chunks)
- N vectors in Qdrant collection `textbook_chunks`

### Chat Query Flow (Story 2: General Query)

```
1. POST /api/v1/chat with { query: "What is URDF?", context: null }
2. Embed query → query_vector (OpenAI)
3. Search Qdrant collection with query_vector → top 5 results
4. Extract Qdrant payload (chunk text + metadata)
5. Join with Postgres document_chunks (optional, for verification)
6. Construct LLM prompt with chunks as context
7. Generate answer (OpenAI GPT-3.5-turbo)
8. Parse answer → format citations from chunk metadata
9. Return ChatResponse with answer + sources
```

**Data Entities Read**:
- 5 vectors from Qdrant (search results)
- 5 rows from Postgres document_chunks (for citation metadata)

### Selected Text Query Flow (Story 3: Contextual Query)

```
1. POST /api/v1/chat with { query: "Explain this", context: "selected paragraph text" }
2. Prepend context to query → combined_query = context + "\n\n" + query
3. Embed combined_query → query_vector
4. Search Qdrant (prioritizes chunks semantically similar to selected text)
5. Same as steps 4-9 in General Query flow
```

**Key Difference**: Combined query embedding gives higher weight to chunks discussing the selected text topic.

---

## Validation Rules Summary

**DocumentChunk**:
- ✅ `chunk_id` is valid UUID v4
- ✅ `chapter_title` not empty, ≤200 chars
- ✅ `url` is valid HTTPS URL (GitHub Pages domain)
- ✅ `vector_id` exists in Qdrant collection (enforced via application logic, not DB FK)

**ChatMessage (Frontend)**:
- ✅ `role` is "user" or "assistant"
- ✅ User message `content` is 1-500 chars (enforced by input field)
- ✅ `sources` array has 0-5 items (backend contract)

**API Requests** (see contracts/):
- ✅ `/api/v1/chat` request: query 1-500 chars, context 0-2000 chars (FR-017)
- ✅ `/api/v1/index` request: no parameters (triggers full re-index)

---

## Database Migration Strategy

**Initial Setup** (run on backend first deployment):
```sql
-- Run in Neon Postgres console or via asyncpg connection
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_title TEXT NOT NULL,
    section_title TEXT,
    url TEXT NOT NULL,
    vector_id UUID NOT NULL UNIQUE,
    text_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT url_format CHECK (url ~ '^https?://')
);

CREATE INDEX idx_chapter_title ON document_chunks(chapter_title);
CREATE INDEX idx_section_title ON document_chunks(section_title);
CREATE INDEX idx_vector_id ON document_chunks(vector_id);
```

**Qdrant Collection Setup** (run on backend first deployment):
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

client.recreate_collection(
    collection_name="textbook_chunks",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)
```

**Migration on Schema Changes**:
- For MVP: No automated migrations (manual SQL updates)
- Post-MVP: Consider Alembic for Postgres schema versioning

---

## Data Model Complete

**Entities Defined**: 4 (DocumentChunk, ChatMessage, Chapter, IndexingJob)
**Database Tables**: 1 required (document_chunks), 1 optional (indexing_jobs)
**Qdrant Collection**: 1 (textbook_chunks, 1536-dim cosine)
**Validation Rules**: Documented per entity
**Data Flows**: 3 scenarios (indexing, general query, contextual query)

**Next Phase**: Generate API contracts (OpenAPI specs).

# Phase 0: Research & Technical Decisions
# Feature: Hackathon Base Deliverables (Textbook & RAG Chatbot)

**Created**: 2025-12-12
**Branch**: 001-hackathon-base-mvp
**Prerequisites**: spec.md, constitution.md

## Research Overview

This document consolidates technical research for implementing the Physical AI textbook with integrated RAG chatbot. All decisions align with Constitution Principle II (Free-Tier Architecture) and Principle III (RAG Security and Accuracy).

---

## R1: Docusaurus v3 Project Structure

**Decision**: Use `@docusaurus/preset-classic` with custom sidebar configuration and React component swizzling for chatbot integration.

**Rationale**:
- Docusaurus v3 provides built-in MDX 2 support (required for FR-004: LaTeX via remark-math/rehype-katex)
- Classic preset includes essential plugins (docs, blog, pages) without bloat
- Swizzling `DocItem/Layout/*` components allows persistent chatbot injection across all pages
- GitHub Pages deployment native via `docusaurus deploy` or GitHub Actions

**Alternatives Considered**:
- **Nextra (Next.js-based)**: Rejected - requires Vercel deployment or complex static export; GitHub Pages support less mature
- **VitePress**: Rejected - Vue-based, team familiar with React; MDX support requires plugins
- **MkDocs Material**: Rejected - Python-based, less flexible for custom React components

**Best Practices**:
- Install with `npx create-docusaurus@latest physical-ai-textbook classic --typescript`
- Enable math support via `remark-math` and `rehype-katex` plugins in `docusaurus.config.js`
- Use `src/components/` for custom React components (Chatbot.tsx)
- Configure `sidebars.js` with 4-module structure matching spec.md FR-001

**References**:
- Docusaurus v3 docs: https://docusaurus.io/docs
- Math equations plugin: https://docusaurus.io/docs/markdown-features/math-equations
- Swizzling guide: https://docusaurus.io/docs/swizzling

---

## R2: FastAPI Project Structure for RAG Backend

**Decision**: Use layered architecture with separate modules for routing, services, database clients, and data models.

**Rationale**:
- Clean separation of concerns enables independent testing (Constitution Principle VI)
- Service layer isolates business logic from HTTP layer (easier to swap frameworks if needed)
- Modular design supports incremental development (Story 4 indexing → Story 2 chatbot → Story 3 selected text)

**Project Structure**:
```
backend/
├── main.py                 # FastAPI app initialization, CORS, middleware
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container for deployment
├── .env.example           # Environment variable template
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── chat.py      # POST /api/v1/chat
│   │   │   │   ├── index.py     # POST /api/v1/index
│   │   │   │   └── health.py    # GET /api/v1/health
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py      # Pydantic settings (env vars)
│   │   └── security.py    # CORS, future auth
│   ├── services/
│   │   ├── __init__.py
│   │   ├── rag_service.py       # RAG logic (embed, retrieve, generate)
│   │   ├── indexing_service.py  # Chunking, embedding, storage
│   │   └── citation_service.py  # Format source citations
│   ├── db/
│   │   ├── __init__.py
│   │   ├── qdrant_client.py     # Qdrant connection, vector ops
│   │   └── postgres_client.py   # Neon Postgres connection, metadata ops
│   ├── models/
│   │   ├── __init__.py
│   │   ├── requests.py    # Pydantic request models (ChatRequest, IndexRequest)
│   │   ├── responses.py   # Pydantic response models (ChatResponse, SourceCitation)
│   │   └── entities.py    # Database entities (DocumentChunk)
│   └── utils/
│       ├── __init__.py
│       ├── text_chunker.py      # Split text into ~500-word chunks
│       └── mdx_parser.py        # Parse MDX, strip frontmatter/HTML
└── tests/
    ├── test_rag_service.py
    ├── test_indexing_service.py
    └── test_endpoints.py
```

**Alternatives Considered**:
- **Monolithic main.py**: Rejected - violates Constitution Principle VI (testability)
- **Django REST Framework**: Rejected - heavier framework, async support less mature than FastAPI
- **Flask + extensions**: Rejected - FastAPI provides automatic OpenAPI docs (FR-027 implicit), better async

**Best Practices**:
- Use Pydantic Settings for environment variables (Qdrant URL, Neon connection string, OpenAI API key)
- Implement dependency injection for database clients (easier testing)
- Use async/await throughout (FastAPI + Qdrant + Neon all support async)
- Type hints mandatory (mypy validation in CI)

**References**:
- FastAPI best practices: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Pydantic Settings: https://docs.pydantic.dev/latest/concepts/pydantic_settings/

---

## R3: Qdrant Cloud Integration (Free Tier)

**Decision**: Use `qdrant-client` Python library with HTTP API endpoint from Qdrant Cloud dashboard.

**Rationale**:
- Free Tier: 1GB storage, 100k vectors, no credit card required (Constitution Principle II)
- Managed service eliminates self-hosting complexity
- HTTP API allows usage from both backend (indexing) and future edge functions if needed
- Client library provides high-level abstractions (`upsert`, `search`) over raw HTTP

**Configuration**:
- **Collection Name**: `textbook_chunks` (FR-029)
- **Vector Dimension**: 1536 (OpenAI text-embedding-3-small)
- **Distance Metric**: Cosine similarity (standard for semantic search)
- **Payload Schema**: `{ "chunk_id": str, "chapter_title": str, "section_title": str, "url": str, "text": str }`

**Indexing Flow**:
1. Initialize Qdrant client with URL + API key (from env vars)
2. Create collection if not exists (idempotent)
3. For each chunk: generate embedding → upsert vector with payload
4. Store vector UUID in Neon Postgres for metadata linkage

**Retrieval Flow** (FR-018):
1. Embed user query using same OpenAI model
2. Search Qdrant collection with query vector, limit=5, score_threshold=0.7 (configurable)
3. Extract payload from top results
4. Return chunks with scores for LLM context

**Alternatives Considered**:
- **Pinecone**: Rejected - free tier requires credit card, 1-pod limit less flexible than Qdrant
- **Weaviate**: Rejected - self-hosted or paid cloud; Qdrant free tier more generous
- **Chroma**: Rejected - primarily local/embedded; cloud offering less mature

**Best Practices**:
- Use batch upserts (50-100 vectors at a time) during indexing to reduce API calls
- Implement retry logic with exponential backoff (Qdrant Cloud has rate limits)
- Monitor collection size via `client.get_collection_info()` to avoid exceeding 1GB (FR-025 requirement)

**References**:
- Qdrant Cloud: https://cloud.qdrant.io/
- Python client: https://qdrant-client.readthedocs.io/
- Qdrant free tier limits: https://qdrant.io/pricing/

---

## R4: Neon Serverless Postgres Integration

**Decision**: Use `asyncpg` for async database operations with connection pooling.

**Rationale**:
- Free Tier: 0.5GB storage, 100 compute-hours/month, no credit card (Constitution Principle II)
- Serverless auto-pause reduces compute usage when idle
- asyncpg is fastest async Postgres driver for Python (better than psycopg3 async for simple queries)
- Connection pooling via `asyncpg.create_pool()` reduces overhead

**Database Schema** (FR-026):
```sql
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_title TEXT NOT NULL,
    section_title TEXT,
    url TEXT NOT NULL,
    vector_id UUID NOT NULL,  -- References Qdrant vector UUID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chapter_title ON document_chunks(chapter_title);
CREATE INDEX idx_vector_id ON document_chunks(vector_id);
```

**Usage Pattern**:
- **Indexing**: After upserting vector to Qdrant, insert metadata row with vector UUID
- **Retrieval**: Join Qdrant results (vector UUIDs) with Postgres rows to get chapter/section titles for citations
- **Health Check**: `SELECT 1` query to verify connection

**Alternatives Considered**:
- **Supabase Postgres**: Rejected - free tier pauses after 1 week inactivity, less generous than Neon
- **PlanetScale**: Rejected - MySQL, not PostgreSQL; incompatible with asyncpg
- **SQLite (local)**: Rejected - no cloud persistence, defeats free-tier cloud architecture

**Best Practices**:
- Use connection pool (max 5 connections to stay within Neon free tier limits)
- Implement automatic migration on startup (`CREATE TABLE IF NOT EXISTS`)
- Use parameterized queries to prevent SQL injection (even though admin-only endpoint)

**References**:
- Neon docs: https://neon.tech/docs/introduction
- asyncpg: https://magicstack.github.io/asyncpg/

---

## R5: OpenAI Embeddings & LLM API

**Decision**: Use `openai` Python library v1.x with `text-embedding-3-small` for embeddings and `gpt-3.5-turbo` for generation (cost optimization).

**Rationale**:
- **Embeddings**: text-embedding-3-small is 5x cheaper than ada-002, 1536 dims (same as ada-002), better performance
- **LLM**: gpt-3.5-turbo-0125 is 10x cheaper than gpt-4, sufficient for grounded QA with context (FR-020)
- Cost estimate (assumption A-001 <$10/month):
  - Indexing: 50 chapters × 200 chunks = 10k chunks × $0.00002/1k tokens ≈ $0.20 (one-time)
  - Chat queries: 1000 queries/month × (5 chunks × 500 words context + generation) ≈ $5-8/month
- OpenAI library v1.x uses async by default, compatible with FastAPI

**Configuration**:
- **Embedding Model**: `text-embedding-3-small` (1536 dims, $0.00002/1k tokens)
- **LLM Model**: `gpt-3.5-turbo-0125` (context window 16k tokens, $0.0005/1k input, $0.0015/1k output)
- **Temperature**: 0.3 (low variance for factual responses)
- **Max Tokens**: 500 (constrain response length for cost control)

**Prompt Template** (FR-020 - answer exclusively from context):
```
You are a helpful AI assistant for a Physical AI and Humanoid Robotics textbook.

Context from textbook:
{retrieved_chunks}

User question: {query}

Instructions:
- Answer the question using ONLY the information from the provided context.
- If the context doesn't contain enough information to answer, say "I don't have enough information in the textbook to answer that question."
- Include specific references to chapters/sections when citing information.
- Do not use external knowledge or make assumptions beyond the provided context.

Answer:
```

**Alternatives Considered**:
- **GPT-4**: Rejected for MVP - 10x more expensive, overkill for grounded QA
- **Anthropic Claude**: Rejected - no free tier, API costs similar to GPT-4
- **Open-source (Llama 3, Mistral)**: Rejected - requires self-hosting (violates free-tier principle) or paid inference API

**Best Practices**:
- Cache embeddings for identical queries (use Redis or in-memory LRU cache if budget allows)
- Implement token counting before API calls to avoid surprises
- Set `max_retries=3` for transient API errors

**References**:
- OpenAI embeddings: https://platform.openai.com/docs/guides/embeddings
- OpenAI pricing: https://openai.com/api/pricing/

---

## R6: Text Chunking Strategy

**Decision**: Use recursive character splitter with ~500-word target and 50-word overlap.

**Rationale**:
- **500 words (~750 tokens)**: Balances context window usage (5 chunks = ~3750 tokens, leaves room for query + response in gpt-3.5-turbo's 16k window)
- **50-word overlap**: Prevents splitting related concepts across chunks (e.g., equation and its explanation)
- **Recursive splitting**: Respects Markdown structure (split on `\n\n` paragraph breaks first, then sentences, then words)

**Implementation**:
```python
def chunk_text(text: str, target_words: int = 500, overlap_words: int = 50) -> List[str]:
    # 1. Split by paragraphs (double newline)
    # 2. Accumulate paragraphs until ~target_words
    # 3. If single paragraph > target_words, split by sentences
    # 4. Add overlap_words from previous chunk
    # 5. Return list of chunks with metadata (start_idx, end_idx for citation)
```

**Metadata per Chunk** (for citations FR-021):
- `chunk_id`: UUID
- `chapter_title`: "Chapter 4: The Digital Twin"
- `section_title`: "4.2 URDF File Structure" (extracted from MDX headings)
- `url`: "https://<user>.github.io/physical-ai-textbook/module-2/chapter-4#urdf-file-structure"
- `text`: Actual chunk content (plain text, stripped Markdown syntax for embeddings)

**Alternatives Considered**:
- **Fixed 512-token chunks**: Rejected - rigid, may split mid-sentence
- **Sentence-based chunks**: Rejected - variable size, may be too small/large for context
- **Semantic chunking (topic modeling)**: Rejected - adds complexity, diminishing returns for technical content

**Best Practices**:
- Preserve code blocks intact (don't split mid-code)
- Preserve equations intact (split on `$$` delimiters)
- Strip Markdown syntax (bold, links, images) before embedding (reduces noise in vector space)

**References**:
- LangChain text splitter patterns: https://python.langchain.com/docs/modules/data_connection/document_transformers/

---

## R7: React Chatbot Component Architecture

**Decision**: Build custom React component with local state management (useState), no external state library.

**Rationale**:
- Chatbot is self-contained (no cross-component state sharing needed)
- Avoids dependency bloat (Redux, Zustand unnecessary for simple UI)
- Docusaurus uses React 18 (supports concurrent features if needed later)

**Component Structure**:
```typescript
// src/components/Chatbot/index.tsx
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle text selection (listen to 'mouseup' event on document)
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()?.toString();
      if (selection && selection.length > 0 && selection.length <= 2000) {
        setSelectedText(selection);
        // Show "Ask AI about this" button
      }
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // Submit query to backend
  const handleSubmit = async () => {
    setIsLoading(true);
    const response = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input, context: selectedText })
    });
    const data = await response.json();
    setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: data.answer, sources: data.sources }]);
    setIsLoading(false);
    setSelectedText(null); // Clear context after submission
  };

  return (
    <>
      {!isOpen && <FloatingToggleButton onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <ChatPanel>
          <MessageList messages={messages} />
          {selectedText && <ContextBadge text={selectedText} onClear={() => setSelectedText(null)} />}
          <InputField value={input} onChange={setInput} onSubmit={handleSubmit} maxLength={500} />
          {isLoading && <LoadingIndicator />}
        </ChatPanel>
      )}
    </>
  );
}
```

**Integration with Docusaurus** (FR-008 - persistent across all pages):
- Swizzle `@theme/Layout` component
- Inject `<Chatbot />` at bottom of layout (renders on every page)
- Use CSS `position: fixed` for floating toggle button and panel

**Styling**:
- Use Docusaurus Infima CSS variables for theme consistency
- Custom CSS module for chatbot-specific styles (panel, messages, input)
- Mobile-responsive breakpoints (collapse panel width on <768px)

**Alternatives Considered**:
- **Third-party chat UI library (react-chatbot-kit)**: Rejected - adds dependency, less control over styling
- **iFrame embed**: Rejected - CORS complexity, poor UX for text selection

**Best Practices**:
- Debounce input (300ms) to reduce unnecessary re-renders
- Auto-scroll message list to bottom on new message
- Persist messages in sessionStorage (FR-031 says no persistence, but session-level UX improvement acceptable)

**References**:
- Docusaurus swizzling: https://docusaurus.io/docs/swizzling
- React hooks best practices: https://react.dev/reference/react

---

## R8: Deployment Strategies

### Frontend (Docusaurus → GitHub Pages)

**Decision**: Use GitHub Actions workflow with `docusaurus deploy` command.

**Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy Docusaurus to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

**Configuration** (`docusaurus.config.js`):
```js
module.exports = {
  url: 'https://<username>.github.io',
  baseUrl: '/physical-ai-textbook/',
  organizationName: '<username>',
  projectName: 'physical-ai-textbook',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
};
```

**Rationale**:
- No manual deployment steps (FR-006 automated CI/CD)
- GitHub Actions free for public repos
- `gh-pages` branch auto-created by action

### Backend (FastAPI → Render Free Tier)

**Decision**: Deploy FastAPI to Render Free Tier (alternative: Railway, Fly.io).

**Rationale**:
- Render Free Tier: 750 compute hours/month, auto-sleep after 15min inactivity (acceptable for hackathon demo)
- No credit card required (aligns with Constitution Principle II)
- Built-in Docker support (use Dockerfile)
- HTTPS included (required for GitHub Pages CORS)

**Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Render Configuration** (`render.yaml`):
```yaml
services:
  - type: web
    name: physical-ai-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: QDRANT_URL
        sync: false
      - key: QDRANT_API_KEY
        sync: false
      - key: NEON_CONNECTION_STRING
        sync: false
      - key: OPENAI_API_KEY
        sync: false
```

**Alternatives Considered**:
- **Vercel Serverless Functions**: Rejected - cold start latency (3-5s) unacceptable for FR-017 (3s p90 latency)
- **AWS Lambda (free tier)**: Rejected - requires AWS account setup, more complex than Render
- **Self-hosted on free VM (Oracle Cloud)**: Rejected - maintenance burden, not aligned with "zero recurring costs" principle

**Best Practices**:
- Set environment variables in Render dashboard (do not commit secrets)
- Enable auto-deploy on Git push to main branch
- Monitor cold start times (if >5s, consider Railway paid tier for persistent instances)

**References**:
- Render free tier: https://render.com/pricing
- FastAPI deployment guide: https://fastapi.tiangolo.com/deployment/

---

## R9: MDX Parsing for Indexing

**Decision**: Use `gray-matter` (frontmatter parsing) + custom Markdown-to-plain-text function.

**Rationale**:
- MDX files include frontmatter (YAML metadata) that should not be embedded
- Need to extract chapter/section titles from Markdown headings (`## Section Title`)
- Strip Markdown syntax (bold, links, code fences) to get clean text for embeddings

**Parsing Flow**:
1. Fetch MDX file from GitHub Pages URL (e.g., `https://<user>.github.io/physical-ai-textbook/module-2/chapter-4.mdx`)
2. Parse frontmatter with `gray-matter` → extract `title`, `sidebar_position`
3. Remove frontmatter from content
4. Extract headings (`## 4.2 URDF File Structure`) → section titles
5. Strip Markdown syntax:
   - Remove code blocks (keep content, discard backticks)
   - Remove links (keep link text, discard URLs)
   - Remove bold/italic markers
6. Chunk plain text with overlap (see R6)
7. For each chunk, attach metadata (chapter title from frontmatter, section title from nearest heading, URL with hash anchor)

**Implementation**:
```python
import re
from typing import List, Tuple

def parse_mdx(mdx_content: str) -> Tuple[str, List[Dict]]:
    # Extract frontmatter (YAML between --- delimiters)
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n', mdx_content, re.DOTALL)
    frontmatter = yaml.safe_load(frontmatter_match.group(1)) if frontmatter_match else {}
    content = mdx_content[frontmatter_match.end():] if frontmatter_match else mdx_content

    # Extract sections (## Heading) with start positions
    sections = []
    for match in re.finditer(r'^##\s+(.+)$', content, re.MULTILINE):
        sections.append({'title': match.group(1), 'start': match.start()})

    # Strip Markdown syntax
    plain_text = re.sub(r'```[a-z]*\n(.*?)\n```', r'\1', content, flags=re.DOTALL)  # Code blocks
    plain_text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', plain_text)  # Links
    plain_text = re.sub(r'[*_]{1,2}([^*_]+)[*_]{1,2}', r'\1', plain_text)  # Bold/italic

    return frontmatter.get('title', 'Untitled'), sections, plain_text
```

**Alternatives Considered**:
- **remark/rehype AST parsing**: Rejected - overcomplicated for plain-text extraction
- **Pandoc (external tool)**: Rejected - adds system dependency, harder to containerize

**Best Practices**:
- Validate MDX syntax before parsing (report errors to indexing logs)
- Preserve LaTeX equations in plain text (strip `$$` delimiters but keep equation content for context)

**References**:
- gray-matter: https://www.npmjs.com/package/gray-matter

---

## R10: Citation Formatting & Hyperlink Generation

**Decision**: Generate citations with chapter + section + URL hash anchor linking to exact section.

**Format** (FR-021):
```json
{
  "sources": [
    {
      "chapter": "Chapter 4: The Digital Twin",
      "section": "4.2 URDF File Structure",
      "url": "https://<user>.github.io/physical-ai-textbook/module-2/chapter-4#urdf-file-structure"
    }
  ]
}
```

**Hash Anchor Generation**:
- Docusaurus auto-generates anchors from headings: "## 4.2 URDF File Structure" → `#urdf-file-structure` (lowercase, spaces to hyphens, numbers removed)
- Match this logic in backend citation service

**Frontend Rendering**:
- Display citation as clickable link: `[Chapter 4, Section 4.2](url)`
- On click, navigate to URL and scroll to anchor (browser default behavior)
- Optional: highlight anchor target with CSS (`:target` pseudo-class)

**Rationale**:
- Provides verifiable source attribution (Constitution Principle III - RAG Security)
- Enables users to trace answers to textbook passages (FR-014)

**Alternatives Considered**:
- **Paragraph-level citations**: Rejected - too granular, overwhelming for users
- **Chapter-only citations**: Rejected - too vague, users can't verify specific claims

**Best Practices**:
- De-duplicate sources (if multiple chunks from same section, show section once)
- Sort sources by relevance score (highest similarity first)

---

## Phase 0 Summary

**All Research Complete**: 10 research items documented (R1-R10)

**Key Decisions**:
1. Docusaurus v3 with classic preset + math plugins
2. FastAPI layered architecture with async database clients
3. Qdrant Cloud Free Tier (1GB, cosine similarity)
4. Neon Serverless Postgres (asyncpg, document_chunks table)
5. OpenAI text-embedding-3-small + gpt-3.5-turbo (cost-optimized)
6. 500-word chunks with 50-word overlap
7. Custom React chatbot with local state
8. GitHub Actions (frontend) + Render Free Tier (backend)
9. gray-matter + custom MDX parser
10. Chapter + section + hash anchor citations

**No NEEDS CLARIFICATION markers remain** - all technical decisions resolved.

**Next Phase**: Design data models and API contracts (Phase 1).

# Implementation Plan: Hackathon Base Deliverables (Textbook & RAG Chatbot)

**Branch**: `001-hackathon-base-mvp` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-hackathon-base-mvp/spec.md`

---

## Summary

Build a professional AI-native textbook for Physical AI and Humanoid Robotics using Docusaurus v3, integrated with a RAG chatbot powered by FastAPI, Qdrant Cloud, and Neon Postgres. Deliver hackathon base requirements (100pts): textbook with Chapter 4 content + functional chatbot supporting general queries and selected-text context queries.

**Milestones**:
1. **Book Setup & Content** (Docusaurus project, Chapter 4 MDX, GitHub Pages deployment)
2. **RAG Backend & Indexing** (FastAPI service, Qdrant + Neon integration, indexing pipeline)
3. **Frontend Integration & Testing** (Chatbot React component, API integration, E2E testing)

---

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**:
- Frontend: Docusaurus v3, React 18, MDX 2, remark-math/rehype-katex (LaTeX support)
- Backend: FastAPI 0.108+, qdrant-client 1.7+, asyncpg 0.29+, openai 1.6+, pydantic-settings 2.1+

**Storage**:
- Vector Database: Qdrant Cloud Free Tier (1GB, 100k vectors, collection: `textbook_chunks`)
- Relational Database: Neon Serverless Postgres Free Tier (0.5GB, table: `document_chunks`)

**Testing**:
- Frontend: Vitest (unit tests), Playwright (E2E for chatbot UI)
- Backend: pytest + pytest-asyncio (unit/integration tests), httpx (API test client)

**Target Platform**:
- Frontend: GitHub Pages (static site, HTTPS, CDN)
- Backend: Render Free Tier (containerized FastAPI, auto-sleep after 15min inactivity)

**Project Type**: Web application (separate frontend + backend)

**Performance Goals**:
- Lighthouse Performance ≥90 (FR-007)
- Chatbot p90 latency <3s (SC-004)
- Indexing completes <10min for 50 chapters (SC-007)

**Constraints**:
- Free-tier only (Qdrant <1GB, Neon <0.5GB, GitHub Pages free) - Constitution Principle II
- RAG answers only from textbook context (no hallucination) - Constitution Principle III
- 80% test coverage (backend) - Constitution Principle VI

**Scale/Scope**:
- 4 modules, ~50 chapters total (MVP: Chapter 4 complete, others stubbed)
- ~10k chunks indexed (50 chapters × 200 chunks/chapter)
- Estimated 1000 users/month (hackathon demo + judging traffic)

---

## Constitution Check

**GATE 1: Pre-Research Validation**

✅ **Principle I (Specification Primacy)**: Complete spec.md with 4 user stories, 31 functional requirements, 10 success criteria
✅ **Principle II (Free-Tier Architecture)**: Qdrant Cloud Free, Neon Postgres Free, GitHub Pages, Render Free Tier
✅ **Principle III (RAG Security and Accuracy)**: FR-020 enforces context-only answers, SC-006 validates fallback
✅ **Principle IV (High-Performance UX)**: FR-007 (Lighthouse ≥90), SC-002 (FCP <1.5s, TTI <2.5s)
✅ **Principle V (Technical Precision)**: FR-003 to FR-005 (executable code, LaTeX, diagrams)
✅ **Principle VI (Test-First for Code)**: Backend TDD mandatory, 80% coverage target
✅ **Principle VII (Modular Content Architecture)**: 4-module structure, Chapter 4 demonstration
⚠️ **Principle VIII (Reusable Intelligence)**: Subagents to be used during implementation (Content Subagent for Chapter 4 MDX, Code Subagent for FastAPI endpoints, Utility Subagent for deployment scripts)

**GATE 2: Post-Design Validation** (after Phase 1)

✅ **Data Model Alignment**: `document_chunks` table schema matches FR-026, Qdrant collection config matches FR-029
✅ **API Contracts**: OpenAPI spec defines 3 endpoints (chat, index, health) matching FR-016 to FR-027
✅ **No Complexity Violations**: Layered architecture (routing → services → DB clients) justified by testability (Principle VI), no unnecessary abstractions

**All Gates Passed**: Proceed to implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-hackathon-base-mvp/
├── plan.md                    # This file (/sp.plan output)
├── spec.md                    # Feature specification
├── research.md                # Phase 0 output (technical decisions)
├── data-model.md              # Phase 1 output (entity schemas)
├── quickstart.md              # Phase 1 output (developer onboarding)
├── contracts/
│   └── api-v1-openapi.yaml    # Phase 1 output (API contracts)
└── checklists/
    └── requirements.md        # Spec quality validation
```

### Source Code (repository root)

```text
physical-ai-textbook/  # Repository root
├── docs/                          # Docusaurus content (MDX files)
│   ├── intro.md                  # Homepage
│   ├── module-1/
│   │   ├── _category_.json       # Sidebar metadata
│   │   └── chapter-1.mdx         # Stub (title only for MVP)
│   ├── module-2/
│   │   ├── _category_.json
│   │   ├── chapter-3.mdx         # Stub
│   │   ├── chapter-4.mdx         # COMPLETE (Digital Twin)
│   │   └── chapter-5.mdx         # Stub
│   ├── module-3/                 # Stubs
│   └── module-4/                 # Stubs
├── src/
│   ├── components/
│   │   └── Chatbot/
│   │       ├── index.tsx         # Main chatbot component
│   │       ├── FloatingButton.tsx
│   │       ├── MessageList.tsx
│   │       ├── InputField.tsx
│   │       ├── ContextBadge.tsx  # Selected text display
│   │       ├── styles.module.css
│   │       └── types.ts          # TypeScript interfaces
│   ├── theme/
│   │   └── Layout/               # Swizzled layout (inject chatbot)
│   │       └── index.tsx
│   └── css/
│       └── custom.css
├── backend/
│   ├── main.py                   # FastAPI app initialization
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example              # Environment variable template
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── chat.py        # POST /api/v1/chat
│   │   │           ├── index.py       # POST /api/v1/index
│   │   │           └── health.py      # GET /api/v1/health
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # Pydantic Settings (env vars)
│   │   │   └── security.py       # CORS middleware
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── rag_service.py          # Embed, retrieve, generate
│   │   │   ├── indexing_service.py     # Chunking, embedding, storage
│   │   │   └── citation_service.py     # Format source citations
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── qdrant_client.py        # Qdrant connection, vector ops
│   │   │   └── postgres_client.py      # Neon Postgres connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── requests.py       # ChatRequest, IndexRequest
│   │   │   ├── responses.py      # ChatResponse, HealthResponse
│   │   │   └── entities.py       # DocumentChunk
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── text_chunker.py         # Split text (~500 words)
│   │       └── mdx_parser.py           # Parse MDX, strip Markdown
│   └── tests/
│       ├── __init__.py
│       ├── test_rag_service.py
│       ├── test_indexing_service.py
│       ├── test_chat_endpoint.py
│       └── test_health_endpoint.py
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml       # GitHub Pages deployment
│       └── test-backend.yml          # Backend CI (pytest)
├── docusaurus.config.js              # Docusaurus configuration
├── sidebars.js                       # Sidebar navigation
├── package.json
└── README.md
```

**Structure Decision**: Web application pattern (Option 2 from template) with separate `docs/` (content), `src/` (frontend React components), and `backend/` (FastAPI service). This aligns with Docusaurus project structure while isolating backend code for independent deployment.

---

## Complexity Tracking

No constitutional violations requiring justification. All architectural choices (layered backend, component-based frontend, free-tier services) align with principles.

---

## Phase 0: Research (Complete)

**Status**: ✅ Complete (see `research.md`)

**Key Decisions**:
1. Docusaurus v3 classic preset + math plugins (remark-math, rehype-katex)
2. FastAPI layered architecture (routing → services → DB clients)
3. Qdrant Cloud Free Tier (1536-dim vectors, cosine similarity)
4. Neon Postgres Free Tier (asyncpg driver, document_chunks table)
5. OpenAI text-embedding-3-small + gpt-3.5-turbo (cost-optimized)
6. Recursive text chunking (500 words, 50-word overlap)
7. Custom React chatbot (useState, no external state library)
8. GitHub Actions (frontend) + Render Free Tier (backend)
9. gray-matter + custom MDX parser
10. Chapter + section + hash anchor citations

**No Open Questions**: All technical decisions resolved.

---

## Phase 1: Design & Contracts (Complete)

**Status**: ✅ Complete

**Deliverables**:
- ✅ `data-model.md`: 4 entities (DocumentChunk, ChatMessage, Chapter, IndexingJob), Postgres schema, Qdrant collection config
- ✅ `contracts/api-v1-openapi.yaml`: OpenAPI 3.1 spec for 3 endpoints (chat, index, health)
- ✅ `quickstart.md`: Developer onboarding guide

**Database Schema**:
```sql
CREATE TABLE document_chunks (
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
```

**Qdrant Collection**:
- Collection: `textbook_chunks`
- Vectors: 1536-dimensional (OpenAI text-embedding-3-small)
- Distance: Cosine similarity
- Payload: `{chunk_id, chapter_title, section_title, url, text}`

**API Endpoints**:
1. `POST /api/v1/chat`: Query chatbot (with optional selected text context)
2. `POST /api/v1/index`: Trigger content re-indexing
3. `GET /api/v1/health`: Health check (Qdrant + Postgres status)

---

## Implementation Milestones

### Milestone 1: Book Setup & Content Generation (Days 1-3)

**Objective**: Deploy functional Docusaurus site to GitHub Pages with Chapter 4 complete.

**Tasks**:
1. ✅ Initialize Docusaurus project
   ```bash
   npx create-docusaurus@latest physical-ai-textbook classic --typescript
   ```
2. Configure math support (install remark-math, rehype-katex, update docusaurus.config.js)
3. Create 4-module sidebar structure (update sidebars.js with module categories)
4. **Use Content Subagent**: Generate Chapter 4 MDX content
   - Sections: 4.1 Introduction to Digital Twins, 4.2 URDF File Structure, 4.3 SDF Models, 4.4 Physics Simulation in Gazebo, 4.5 Sensor Simulation (LiDAR, Depth Cameras)
   - Include: 5 code examples (Python ROS 2 nodes, URDF XML), 3 LaTeX equations (kinematic transforms, sensor noise models), 3 diagram placeholders with alt text
5. Create stub MDX files for other chapters (title + placeholder content)
6. Configure GitHub Pages deployment (update docusaurus.config.js with repo URL, baseUrl)
7. Set up GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`)
8. Test locally (`npm start`), verify LaTeX rendering, code highlighting
9. Deploy to GitHub Pages (push to main → auto-deploy)

**Acceptance Criteria** (Story 1):
- ✅ Chapter 4 accessible at `https://<user>.github.io/physical-ai-textbook/module-2/chapter-4`
- ✅ LaTeX equations render correctly (KaTeX)
- ✅ Code examples have syntax highlighting and copy buttons
- ✅ Lighthouse Performance score ≥90
- ✅ Mobile-responsive (readable at 320px width)

**Deliverables**:
- Deployed Docusaurus site on GitHub Pages
- Chapter 4 MDX file (~1500 words, 5 code blocks, 3 equations, 3 diagrams)
- GitHub Actions workflow file

---

### Milestone 2: RAG Backend & Indexing Setup (Days 4-7)

**Objective**: Deploy FastAPI backend to Render with functional indexing and chat endpoints.

**Tasks**:
1. Initialize Python project (create `backend/` directory, `requirements.txt`, virtual environment)
2. Install dependencies:
   ```
   fastapi[all]==0.108.0
   qdrant-client==1.7.0
   asyncpg==0.29.0
   openai==1.6.0
   pydantic-settings==2.1.0
   python-dotenv==1.0.0
   httpx==0.25.2  # For fetching MDX files
   PyYAML==6.0.1  # For gray-matter frontmatter parsing
   ```
3. **Use Code Subagent**: Implement FastAPI project structure
   - Create `main.py` (app initialization, CORS middleware)
   - Create `app/core/config.py` (Pydantic Settings for env vars)
   - Create `app/models/` (Pydantic request/response schemas)
4. **Use Code Subagent**: Implement Qdrant client
   - Create `app/db/qdrant_client.py`
   - Initialize collection on startup (create if not exists)
   - Implement `upsert_vectors()`, `search_vectors()` methods
5. **Use Code Subagent**: Implement Neon Postgres client
   - Create `app/db/postgres_client.py`
   - Run schema migration on startup (`CREATE TABLE IF NOT EXISTS document_chunks`)
   - Implement `insert_chunk_metadata()`, `get_chunk_by_vector_id()` methods
6. **Use Code Subagent**: Implement indexing service
   - Create `app/utils/mdx_parser.py` (parse frontmatter, extract sections, strip Markdown)
   - Create `app/utils/text_chunker.py` (recursive chunking, 500 words + 50-word overlap)
   - Create `app/services/indexing_service.py`
     - Fetch MDX files from GitHub Pages (`httpx.get(f"{base_url}/module-2/chapter-4.mdx")`)
     - Chunk text → generate embeddings (OpenAI) → upsert to Qdrant → insert metadata to Postgres
7. **Use Code Subagent**: Implement chat endpoint
   - Create `app/services/rag_service.py` (embed query, retrieve chunks, generate answer)
   - Create `app/services/citation_service.py` (format sources, generate hash anchors)
   - Create `app/api/v1/endpoints/chat.py` (FastAPI route handler)
8. Implement health endpoint (`app/api/v1/endpoints/health.py`)
9. Create Dockerfile for deployment
10. Configure environment variables (create `.env.example`)
11. Write tests (pytest for services and endpoints, aim for 80% coverage)
12. Deploy to Render Free Tier
    - Create `render.yaml` (service configuration)
    - Add env vars in Render dashboard (QDRANT_URL, NEON_CONNECTION_STRING, OPENAI_API_KEY)
    - Deploy via Git push
13. Test deployed endpoints:
    ```bash
    curl https://physical-ai-backend.onrender.com/api/v1/health
    curl -X POST https://physical-ai-backend.onrender.com/api/v1/index
    ```

**Acceptance Criteria** (Story 4 + Story 2 backend):
- ✅ `/api/v1/health` returns `{"status": "ok", "qdrant_connected": true, "postgres_connected": true}`
- ✅ `/api/v1/index` completes in <10 minutes, indexes Chapter 4 (~200 chunks)
- ✅ `/api/v1/chat` responds with answer + citations for query "What is URDF?"
- ✅ Qdrant collection contains ~200 vectors (verify in Qdrant Cloud dashboard)
- ✅ Postgres table has ~200 rows (verify in Neon SQL editor)
- ✅ Backend tests achieve 80% coverage (`pytest --cov=app`)

**Deliverables**:
- Deployed FastAPI backend on Render
- 3 API endpoints functional (chat, index, health)
- Postgres schema created (document_chunks table)
- Qdrant collection created (textbook_chunks)
- Backend test suite (pytest)

---

### Milestone 3: Frontend Integration & Testing (Days 8-10)

**Objective**: Integrate chatbot React component into Docusaurus, implement selected text feature, conduct E2E testing.

**Tasks**:
1. **Use Code Subagent**: Create chatbot React component
   - Create `src/components/Chatbot/index.tsx` (main component)
   - Implement `useState` for messages, input, selectedText, isOpen, isLoading
   - Implement text selection listener (`mouseup` event, extract `window.getSelection()`)
   - Implement "Ask AI about this" button on text selection
2. Create chatbot sub-components:
   - `FloatingButton.tsx` (60px circle, bottom-right corner, toggle chatbot)
   - `MessageList.tsx` (scrollable message history, user/assistant styling)
   - `InputField.tsx` (500-char limit, character counter, submit on Enter)
   - `ContextBadge.tsx` (display selected text, clear button)
3. **Use Utility Subagent**: Implement API integration
   - Fetch call to `POST /api/v1/chat` with `{query, context}`
   - Handle loading state (spinner/skeleton)
   - Parse response → update messages state
   - Error handling (display error message in chat)
4. Style chatbot (create `src/components/Chatbot/styles.module.css`)
   - Use Infima CSS variables for theme consistency
   - Mobile-responsive (collapse panel width on <768px)
   - Smooth slide-in animation for panel
5. Swizzle Docusaurus layout
   ```bash
   npm run swizzle @docusaurus/theme-classic Layout -- --wrap
   ```
   - Inject `<Chatbot />` component at bottom of layout
6. Update backend URL in chatbot component
   - Development: `http://localhost:8000`
   - Production: `https://physical-ai-backend.onrender.com` (use env var or build-time config)
7. Test chatbot locally
   - Start backend (`uvicorn main:app --reload`)
   - Start frontend (`npm start`)
   - Test general query (Story 2)
   - Test selected text query (Story 3)
8. Write E2E tests (Playwright)
   - Test: Open chatbot, submit query, verify response with citations
   - Test: Highlight text, click "Ask AI", verify context passed to backend
   - Test: Click citation link, verify navigation to chapter section
9. Deploy updated frontend to GitHub Pages (push to main)
10. Smoke test production deployment
    - Open `https://<user>.github.io/physical-ai-textbook`
    - Test chatbot end-to-end on production backend

**Acceptance Criteria** (Story 2 + Story 3 frontend):
- ✅ Chatbot accessible on all pages (floating button visible)
- ✅ General query returns answer with citations in <3 seconds (p90)
- ✅ Selected text query passes context to backend, response references selected text
- ✅ Citation links navigate to correct chapter section with hash anchor
- ✅ Chatbot UI responsive on mobile (320px width)
- ✅ E2E tests pass (Playwright)

**Deliverables**:
- Chatbot React component integrated into Docusaurus
- Selected text feature functional
- E2E test suite (Playwright)
- Production deployment tested

---

## Dependencies & Execution Order

### Milestone Dependencies

- **Milestone 1 (Book Setup)**: No dependencies, can start immediately
- **Milestone 2 (Backend)**: Requires Milestone 1 complete (GitHub Pages deployment provides base URL for indexing)
- **Milestone 3 (Frontend Integration)**: Requires Milestone 2 complete (backend endpoints must be functional)

### Critical Path

1. Milestone 1 → Milestone 2 → Milestone 3 (sequential)
2. Total estimated time: 10 days (3 days + 4 days + 3 days)

### Parallel Opportunities

- **During Milestone 1**: Can start backend project structure (Milestone 2, tasks 1-3) while waiting for GitHub Pages deployment
- **During Milestone 2**: Can design chatbot UI mockups (Milestone 3, task 2) while backend deploys to Render

---

## Risk Mitigation

### Risk 1: Qdrant Storage Limit Exceeded (HIGH)

**Mitigation**:
- Implement storage estimation before indexing (calculate: chunk_count × 6KB/vector)
- Fail early if projected size >900MB (90% of 1GB limit)
- Prioritize Chapter 4 indexing first to ensure demo readiness

**Contingency**:
- Reduce chunk size from 500 to 300 words (reduces vector count by ~40%)
- Index only Module 2 chapters for MVP (defer other modules)

### Risk 2: OpenAI API Cost Overrun (MEDIUM)

**Mitigation**:
- Set OpenAI usage alerts at $5/month threshold
- Use gpt-3.5-turbo instead of gpt-4 (10x cheaper)
- Cache embeddings for identical queries (LRU cache, 100 entries max)

**Contingency**:
- Switch to Hugging Face Inference API (free tier, lower quality but functional)
- Reduce max_tokens in LLM generation from 500 to 300

### Risk 3: Render Free Tier Cold Start Latency (MEDIUM)

**Mitigation**:
- Display "warming up backend..." message in chatbot if first query >5s
- Implement retry logic with exponential backoff (3 attempts max)

**Contingency**:
- Upgrade to Render Starter plan ($7/month, no auto-sleep) if latency unacceptable
- Deploy to Railway Free Tier (500 hours/month, less aggressive auto-sleep)

### Risk 4: GitHub Pages Deployment Failure (LOW)

**Mitigation**:
- Test deployment locally (`npm run build && npm run serve`)
- Use Docusaurus's built-in `docusaurus deploy` command (idempotent)

**Contingency**:
- Manual deployment via `gh-pages` npm package
- Deploy to Vercel/Netlify as fallback (free tier, auto-deploy from Git)

---

## Architectural Decision Records (ADR) - To Be Created

Based on research.md findings, suggest creating ADRs for:

1. **ADR-001: Choice of Qdrant over Pinecone for Vector Database**
   - Decision: Use Qdrant Cloud Free Tier
   - Rationale: No credit card required, 1GB storage vs Pinecone 1-pod limit, better free tier terms
   - Alternatives: Pinecone (rejected - credit card required), Weaviate (rejected - self-hosted or paid cloud), Chroma (rejected - cloud offering less mature)

2. **ADR-002: OpenAI Embeddings vs Open-Source Alternatives**
   - Decision: Use OpenAI text-embedding-3-small
   - Rationale: Best quality/cost ratio ($0.00002/1k tokens), managed API (no self-hosting), 1536 dims compatible with Qdrant
   - Alternatives: Sentence-Transformers (rejected - requires self-hosting, violates free-tier principle), Cohere Embeddings (rejected - similar cost, less mature)

3. **ADR-003: Text Chunking Strategy (500 words, 50-word overlap)**
   - Decision: Recursive character splitter with ~500-word target and 50-word overlap
   - Rationale: Balances context window usage (5 chunks fit in gpt-3.5-turbo), prevents concept splitting, respects Markdown structure
   - Alternatives: Fixed 512-token chunks (rejected - rigid), Semantic chunking (rejected - adds complexity)

Run `/sp.adr <title>` after completing implementation to document these decisions if architecturally significant during development.

---

## Next Steps

1. **Run `/sp.tasks`** to generate detailed task breakdown for implementation (will create `tasks.md`)
2. **Create ADRs** for key decisions (optional, recommended post-MVP)
3. **Begin Milestone 1**: Initialize Docusaurus project, generate Chapter 4 content using Content Subagent

---

**Plan Status**: ✅ COMPLETE

**Phase 0**: ✅ Research complete (research.md)
**Phase 1**: ✅ Design complete (data-model.md, contracts/api-v1-openapi.yaml, quickstart.md)
**Phase 2**: Ready for `/sp.tasks` to generate implementation tasks

**Constitutional Compliance**: All principles validated (see Constitution Check section)
**Complexity**: No violations, all architectural choices justified
**Risks**: 4 identified with mitigations (Qdrant storage, OpenAI cost, cold start, deployment)
**ADRs**: 3 suggested for post-MVP documentation

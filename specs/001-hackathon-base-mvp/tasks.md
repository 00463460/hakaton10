# Tasks: Hackathon Base Deliverables (Textbook & RAG Chatbot)

**Input**: Design documents from `/specs/001-hackathon-base-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api-v1-openapi.yaml

**Tests**: Backend TDD mandatory (tests before implementation), 80% coverage target

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: Repository root (`docs/`, `src/`, `docusaurus.config.js`, `sidebars.js`)
- **Backend**: `backend/` directory (`backend/app/`, `backend/tests/`, `backend/main.py`)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create repository structure with frontend and backend directories
- [ ] T002 [P] Initialize Docusaurus v3 TypeScript project with classic preset in repository root
- [ ] T003 [P] Initialize Python 3.11 virtual environment and create `backend/requirements.txt` with dependencies (fastapi[all]==0.108.0, qdrant-client==1.7.0, asyncpg==0.29.0, openai==1.6.0, pydantic-settings==2.1.0, python-dotenv==1.0.0, httpx==0.25.2, PyYAML==6.0.1)
- [ ] T004 [P] Configure linting tools (create `.eslintrc.js` for frontend, add ruff configuration for backend in `pyproject.toml`)
- [ ] T005 Create `.env.example` files for both frontend and backend with required environment variables

**Checkpoint**: Project structure initialized, dependencies installable

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Install and configure math support plugins (remark-math, rehype-katex) in `docusaurus.config.js`
- [ ] T007 [P] Create 4-module sidebar structure in `sidebars.js` (Module 1: Introduction, Module 2: ROS 2 & Simulation, Module 3: VLA Models, Module 4: Advanced Topics)
- [ ] T008 [P] Create backend FastAPI app structure: `backend/main.py`, `backend/app/__init__.py`, `backend/app/core/`, `backend/app/api/`, `backend/app/services/`, `backend/app/db/`, `backend/app/models/`, `backend/app/utils/`
- [ ] T009 [P] Implement Pydantic Settings configuration in `backend/app/core/config.py` (QDRANT_URL, QDRANT_API_KEY, NEON_CONNECTION_STRING, OPENAI_API_KEY, GITHUB_PAGES_BASE_URL)
- [ ] T010 [P] Configure CORS middleware in `backend/app/core/security.py` (allow GitHub Pages origin)
- [ ] T011 [P] Create Pydantic request/response models in `backend/app/models/requests.py` and `backend/app/models/responses.py` (ChatRequest, ChatResponse, IndexRequest, IndexResponse, HealthResponse, SourceCitation)
- [ ] T012 Implement Qdrant client initialization in `backend/app/db/qdrant_client.py` (create collection `textbook_chunks` with 1536-dim vectors, cosine distance)
- [ ] T013 Implement Neon Postgres client in `backend/app/db/postgres_client.py` (create connection pool, run schema migration for `document_chunks` table)
- [ ] T014 Create GitHub Actions workflow file `.github/workflows/deploy-frontend.yml` for Docusaurus deployment to GitHub Pages
- [ ] T015 Create Dockerfile for backend deployment in `backend/Dockerfile`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Read Physical AI Textbook Content (Priority: P1) 🎯 MVP

**Goal**: Deploy Docusaurus site with Chapter 4 complete, LaTeX rendering, GitHub Pages deployment

**Independent Test**: Navigate to deployed GitHub Pages site, browse to Chapter 4 (Digital Twin), verify content renders with LaTeX equations, code blocks syntax-highlighted, diagrams display correctly. Content readable on mobile (320px) and desktop (1920px).

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create module category files: `docs/module-1/_category_.json`, `docs/module-2/_category_.json`, `docs/module-3/_category_.json`, `docs/module-4/_category_.json` with sidebar metadata (position, label)
- [ ] T017 [P] [US1] Create stub MDX files for Module 1 chapters in `docs/module-1/` (chapter-1.mdx with title and placeholder content)
- [ ] T018 [P] [US1] Create stub MDX files for Module 2 chapters 3 and 5 in `docs/module-2/` (chapter-3.mdx, chapter-5.mdx with titles and placeholders)
- [ ] T019 [P] [US1] Create stub MDX files for Module 3 chapters in `docs/module-3/` (2-3 stub chapters with titles)
- [ ] T020 [P] [US1] Create stub MDX files for Module 4 chapters in `docs/module-4/` (2-3 stub chapters with titles)
- [ ] T021 [US1] **Use Content Subagent**: Generate complete Chapter 4 MDX content in `docs/module-2/chapter-4.mdx` with:
  - Frontmatter (title: "Chapter 4: The Digital Twin (Gazebo & Unity)", sidebar_position: 4)
  - Section 4.1: Introduction to Digital Twins (~300 words)
  - Section 4.2: URDF File Structure (~400 words + 1 Python code example + 1 URDF XML example + 1 LaTeX equation for coordinate transform)
  - Section 4.3: SDF Models (~300 words + 1 SDF XML example)
  - Section 4.4: Physics Simulation in Gazebo (~400 words + 1 Python ROS 2 node example + 1 LaTeX equation for physics simulation)
  - Section 4.5: Sensor Simulation (LiDAR, Depth Cameras) (~400 words + 1 Python sensor subscription example + 1 LaTeX equation for sensor noise model + 3 diagram placeholders with alt text)
- [ ] T022 [US1] Create homepage intro in `docs/intro.md` with course overview and navigation guide
- [ ] T023 [US1] Configure `docusaurus.config.js` with GitHub Pages settings (url: `https://<username>.github.io`, baseUrl: `/physical-ai-textbook/`, organizationName, projectName, deploymentBranch: `gh-pages`)
- [ ] T024 [US1] Add KaTeX stylesheet to `docusaurus.config.js` stylesheets array for LaTeX rendering
- [ ] T025 [US1] Test local build (`npm run build && npm run serve`) and verify LaTeX equations render, code blocks have syntax highlighting
- [ ] T026 [US1] Deploy to GitHub Pages (push to main branch → GitHub Actions auto-deploys)
- [ ] T027 [US1] Run Lighthouse audit on deployed Chapter 4 page, verify Performance score ≥90 (fix any issues found)

**Checkpoint**: User Story 1 complete - textbook deployed with Chapter 4 accessible, LaTeX rendering, mobile-responsive

---

## Phase 4: User Story 4 - Index Textbook Content for RAG (Priority: P1)

**Goal**: Implement indexing pipeline that fetches MDX files, chunks text, generates embeddings, stores in Qdrant + Neon

**Independent Test**: Deploy textbook to GitHub Pages, call `POST /api/v1/index` endpoint, verify logs show successful chunking of Chapter 4, check Qdrant dashboard for vector count increase (~200 vectors), query Neon Postgres to confirm metadata rows with Chapter 4 title and URLs.

### Implementation for User Story 4

- [ ] T028 [P] [US4] Implement MDX parser utility in `backend/app/utils/mdx_parser.py` (parse frontmatter with PyYAML, extract sections from `##` headings, strip Markdown syntax to plain text, preserve LaTeX equations)
- [ ] T029 [P] [US4] Implement text chunker utility in `backend/app/utils/text_chunker.py` (recursive character splitter: target 500 words, 50-word overlap, respect paragraph boundaries, preserve code blocks intact)
- [ ] T030 [US4] Implement indexing service in `backend/app/services/indexing_service.py`:
  - Fetch MDX files from GitHub Pages base URL using httpx
  - Parse each MDX file with mdx_parser
  - Chunk text with text_chunker
  - For each chunk: generate OpenAI embedding (text-embedding-3-small) → upsert to Qdrant → insert metadata to Postgres
  - Implement storage estimation (chunk_count × 6KB/vector, fail if >900MB)
  - Return IndexResponse with total_chunks_indexed, total_chapters_processed, indexing_duration_seconds
- [ ] T031 [US4] Implement `/api/v1/index` endpoint in `backend/app/api/v1/endpoints/index.py` (POST handler, call indexing_service, return 200 on success or 500 with error details)
- [ ] T032 [P] [US4] Write integration test in `backend/tests/test_indexing_service.py` (mock httpx.get for MDX fetch, test chunking logic, verify Qdrant upsert called, verify Postgres insert called)
- [ ] T033 [P] [US4] Write endpoint test in `backend/tests/test_index_endpoint.py` (use httpx.AsyncClient, call POST /api/v1/index, assert 200 status, verify response schema matches IndexResponse)
- [ ] T034 [US4] Deploy backend to Render Free Tier (create `backend/render.yaml`, configure environment variables in Render dashboard, deploy via Git push)
- [ ] T035 [US4] Trigger indexing on deployed backend (`curl -X POST https://physical-ai-backend.onrender.com/api/v1/index`), monitor logs for completion (<10 min)
- [ ] T036 [US4] Verify Qdrant collection in Qdrant Cloud dashboard (collection: `textbook_chunks`, vector count ~200, size <50MB)
- [ ] T037 [US4] Verify Postgres metadata in Neon SQL editor (`SELECT COUNT(*) FROM document_chunks` should return ~200 rows for Chapter 4)

**Checkpoint**: User Story 4 complete - indexing pipeline functional, Chapter 4 content indexed in Qdrant + Neon

---

## Phase 5: User Story 2 - Ask General Questions via RAG Chatbot (Priority: P2)

**Goal**: Implement RAG service, chat endpoint, and basic chatbot UI (no selected text feature yet)

**Independent Test**: Open chatbot, type "What is URDF in ROS 2?", submit query. Verify response contains textbook-based answer with citation like "[Chapter 4, Section 4.2]" and hyperlink to that section. Test with question outside textbook scope ("What's the weather today?") to confirm fallback response.

### Implementation for User Story 2

- [ ] T038 [P] [US2] Implement citation service in `backend/app/services/citation_service.py` (format SourceCitation objects from chunk metadata, generate hash anchors matching Docusaurus URL structure: "##-4.2-urdf-file-structure" → "#urdf-file-structure")
- [ ] T039 [US2] Implement RAG service in `backend/app/services/rag_service.py`:
  - Embed query using OpenAI text-embedding-3-small
  - Search Qdrant collection with query vector, limit=5, score_threshold=0.7
  - Retrieve chunk metadata from Postgres using vector UUIDs
  - Construct LLM prompt with retrieved chunks as context (use template from research.md R5)
  - Generate answer with OpenAI gpt-3.5-turbo (temperature=0.3, max_tokens=500)
  - Format citations with citation_service
  - Return ChatResponse with answer, sources, confidence (average similarity score)
- [ ] T040 [US2] Implement `/api/v1/chat` endpoint in `backend/app/api/v1/endpoints/chat.py` (POST handler, validate ChatRequest: query 1-500 chars, context 0-2000 chars, call rag_service, return 200 with ChatResponse or 400 on validation error)
- [ ] T041 [P] [US2] Implement `/api/v1/health` endpoint in `backend/app/api/v1/endpoints/health.py` (GET handler, check Qdrant connection with client.get_collection(), check Postgres with SELECT 1, return HealthResponse with status, qdrant_connected, postgres_connected, timestamp)
- [ ] T042 [P] [US2] Write unit tests in `backend/tests/test_rag_service.py` (mock OpenAI API calls, test embedding generation, test chunk retrieval, test prompt construction, test fallback for out-of-scope queries)
- [ ] T043 [P] [US2] Write endpoint test in `backend/tests/test_chat_endpoint.py` (call POST /api/v1/chat with valid query, assert 200 status, verify ChatResponse schema, test 400 on invalid input)
- [ ] T044 [US2] Deploy updated backend to Render (git push → auto-deploy)
- [ ] T045 [US2] Test deployed chat endpoint (`curl -X POST https://physical-ai-backend.onrender.com/api/v1/chat -d '{"query": "What is URDF?"}'`), verify response with citations
- [ ] T046 [P] [US2] **Use Code Subagent**: Create chatbot FloatingButton component in `src/components/Chatbot/FloatingButton.tsx` (60px diameter circle, bottom-right corner, z-index 1000, onClick toggles chatbot, icon: chat bubble SVG)
- [ ] T047 [P] [US2] **Use Code Subagent**: Create MessageList component in `src/components/Chatbot/MessageList.tsx` (scrollable div, display ChatMessage[] with user/assistant styling, auto-scroll to bottom on new message)
- [ ] T048 [P] [US2] **Use Code Subagent**: Create InputField component in `src/components/Chatbot/InputField.tsx` (textarea with 500-char limit, character counter, submit on Enter, disable when loading)
- [ ] T049 [US2] **Use Code Subagent**: Create main Chatbot component in `src/components/Chatbot/index.tsx`:
  - useState for isOpen, messages, input, isLoading
  - handleSubmit: fetch POST /api/v1/chat with {query: input, context: null}, parse ChatResponse, append to messages
  - Render FloatingButton when closed, render chat panel (MessageList + InputField) when open
  - Loading indicator (spinner) when isLoading=true
- [ ] T050 [US2] Create chatbot styles in `src/components/Chatbot/styles.module.css` (panel width 400px on desktop, 100% on mobile <768px, slide-in animation, Infima CSS variables for colors)
- [ ] T051 [US2] Create TypeScript interfaces in `src/components/Chatbot/types.ts` (ChatMessage, SourceCitation matching backend schemas)
- [ ] T052 [US2] Swizzle Docusaurus Layout theme (`npm run swizzle @docusaurus/theme-classic Layout -- --wrap`), inject `<Chatbot />` component at bottom of `src/theme/Layout/index.tsx`
- [ ] T053 [US2] Configure backend URL in chatbot component (use environment variable or build-time config: dev `http://localhost:8000`, prod `https://physical-ai-backend.onrender.com`)
- [ ] T054 [US2] Test chatbot locally (start backend uvicorn, start frontend npm start, open chatbot, submit query "What is URDF?", verify response with citations)
- [ ] T055 [US2] Deploy updated frontend to GitHub Pages (git push → auto-deploy)
- [ ] T056 [US2] Smoke test production chatbot (open deployed site, test general query, verify citations navigate to chapter sections)

**Checkpoint**: User Story 2 complete - chatbot functional with general queries, source citations, hyperlinks to sections

---

## Phase 6: User Story 3 - Ask Questions About Selected Text (Priority: P3)

**Goal**: Implement text selection listener, "Ask AI about this" button, contextual queries

**Independent Test**: Highlight a paragraph in Chapter 4 about sensor simulation, click "Ask AI about this" button (appears on text selection), type question "Why is LiDAR used instead of cameras?", verify response uses selected text as context and cites the same chapter section.

### Implementation for User Story 3

- [ ] T057 [P] [US3] **Use Code Subagent**: Create ContextBadge component in `src/components/Chatbot/ContextBadge.tsx` (display selected text preview (first 100 chars), clear button, renders above InputField when selectedText not null)
- [ ] T058 [US3] Update Chatbot component in `src/components/Chatbot/index.tsx`:
  - Add useState for selectedText (string | null)
  - Add useEffect with mouseup event listener on document
  - On mouseup: get window.getSelection(), if text length 1-2000 chars → show "Ask AI about this" floating button at selection position
  - On "Ask AI about this" click: setSelectedText(selection), setIsOpen(true), clear selection
  - Update handleSubmit: pass selectedText as context parameter in ChatRequest
  - Clear selectedText after successful submission
- [ ] T059 [US3] Create floating "Ask AI about this" button in `src/components/Chatbot/AskAIButton.tsx` (positioned at mouse cursor, z-index 1001, onClick handler prop)
- [ ] T060 [US3] Update chatbot styles in `src/components/Chatbot/styles.module.css` (add styles for ContextBadge, AskAIButton, floating tooltip positioning)
- [ ] T061 [US3] Test selected text feature locally (highlight text in Chapter 4, click "Ask AI", verify selected text appears in chatbot, submit query, verify backend receives context parameter)
- [ ] T062 [US3] Deploy updated frontend to GitHub Pages
- [ ] T063 [US3] Smoke test selected text on production (highlight text, submit contextual query, verify response references selected passage)

**Checkpoint**: User Story 3 complete - selected text feature functional, contextual queries working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T064 [P] Write Playwright E2E test in `tests/e2e/chatbot.spec.ts` (open chatbot, submit query, verify response with citations, click citation link, verify navigation to chapter section)
- [ ] T065 [P] Write Playwright E2E test in `tests/e2e/selected-text.spec.ts` (highlight text, click "Ask AI", submit query, verify context passed to backend)
- [ ] T066 [P] Add loading skeleton UI to MessageList for better UX during backend response
- [ ] T067 [P] Update README.md in repository root with project overview, quickstart instructions, architecture diagram
- [ ] T068 [P] Create GitHub Actions workflow for backend CI in `.github/workflows/test-backend.yml` (run pytest on PR, enforce 80% coverage)
- [ ] T069 Run backend test suite (`pytest --cov=app --cov-report=html`), verify 80% coverage achieved
- [ ] T070 Run frontend Lighthouse audit on all pages (homepage, Chapter 4, module pages), verify Performance ≥90
- [ ] T071 Test mobile responsiveness (Chrome DevTools device emulation, 320px width, verify no horizontal scrolling)
- [ ] T072 Run accessibility scan (axe DevTools or WAVE), fix any WCAG 2.1 Level AA violations
- [ ] T073 Test chatbot with out-of-scope question ("What's the weather today?"), verify fallback response ("I can only answer questions about Physical AI and Humanoid Robotics based on this textbook")
- [ ] T074 Run full E2E test suite (`npx playwright test`), verify all tests pass
- [ ] T075 Create `.env.example` documentation with all required environment variables and instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 4 (Phase 4)**: Depends on User Story 1 (Phase 3) - needs GitHub Pages deployment for indexing
- **User Story 2 (Phase 5)**: Depends on User Story 4 (Phase 4) - needs indexed content for chatbot
- **User Story 3 (Phase 6)**: Depends on User Story 2 (Phase 5) - extends chatbot with selected text
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Depends on User Story 1 (needs deployed site URL for MDX fetching)
- **User Story 2 (P2)**: Depends on User Story 4 (needs indexed vectors for RAG)
- **User Story 3 (P3)**: Depends on User Story 2 (extends existing chatbot component)

### Within Each User Story

- **User Story 1**: Tasks T016-T020 (stub files) can run in parallel, T021 (Chapter 4 content) blocks T022-T027 (deployment + testing)
- **User Story 4**: Tasks T028-T029 (utilities) can run in parallel, both block T030 (indexing service), tests T032-T033 can run in parallel after T030-T031
- **User Story 2**: Tasks T038 (citations) and backend tasks T039-T041 sequential, frontend components T046-T048 can run in parallel, T049 (main chatbot) depends on T046-T048
- **User Story 3**: Tasks T057 (ContextBadge), T059 (AskAIButton) can run in parallel, T058 (update main chatbot) depends on both

### Parallel Opportunities

- **Phase 1 (Setup)**: T002 (Docusaurus init) and T003 (Python init) can run in parallel, T004 (linting) can run in parallel
- **Phase 2 (Foundational)**: T007 (sidebar), T008-T011 (backend structure), T014-T015 (deployment files) can all run in parallel
- **Phase 3 (US1)**: T016-T020 (stub files) all parallel
- **Phase 4 (US4)**: T028 (parser) and T029 (chunker) parallel, T032-T033 (tests) parallel
- **Phase 5 (US2)**: T042-T043 (tests) parallel, T046-T048 (React components) parallel
- **Phase 7 (Polish)**: T064-T065 (E2E tests), T066-T068 (documentation/CI), T069-T074 (testing/audits) can overlap

---

## Parallel Example: User Story 2 (Backend + Frontend)

```bash
# Launch all React components for chatbot together:
Task T046: "Create FloatingButton component in src/components/Chatbot/FloatingButton.tsx"
Task T047: "Create MessageList component in src/components/Chatbot/MessageList.tsx"
Task T048: "Create InputField component in src/components/Chatbot/InputField.tsx"

# While components build, write backend tests in parallel:
Task T042: "Write RAG service tests in backend/tests/test_rag_service.py"
Task T043: "Write chat endpoint tests in backend/tests/test_chat_endpoint.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 4 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (textbook with Chapter 4)
4. Complete Phase 4: User Story 4 (indexing pipeline)
5. Complete Phase 5: User Story 2 (basic chatbot without selected text)
6. **STOP and VALIDATE**: Test chatbot with general queries, verify citations work
7. Deploy/demo (meets 100pts base requirement)

### Incremental Delivery

1. Foundation ready → User Story 1 → Deploy textbook (demo textbook alone)
2. Add User Story 4 → Index content (verify Qdrant + Neon working)
3. Add User Story 2 → Deploy chatbot (demo general queries) - MVP COMPLETE
4. Add User Story 3 → Deploy selected text feature (bonus feature)
5. Add Phase 7 → Polish + E2E tests (production-ready)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (textbook content) → T016-T027
   - **Developer B**: User Story 4 (backend indexing) → T028-T037 (starts after US1 deploys)
   - **Developer C**: User Story 2 (frontend chatbot) → T046-T056 (starts after US4 completes)
3. User Story 3 (selected text) can be done by Developer C after US2
4. Polish phase done by all developers in parallel on different tasks

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story should be independently completable and testable
- Test-driven workflow: Write tests before implementation for backend tasks (Principle VI)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Use Subagents** where marked to maximize Constitution Principle VIII bonus points
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

**Total Tasks**: 75 (Setup: 5, Foundational: 10, US1: 12, US4: 10, US2: 19, US3: 7, Polish: 12)
**Estimated Timeline**: 10 days (3 days US1, 4 days US4+US2, 2 days US3, 1 day Polish)
**Critical Path**: Setup → Foundational → US1 → US4 → US2 → US3 → Polish
**Parallel Opportunities**: 30+ tasks marked [P] can run in parallel when prerequisites met

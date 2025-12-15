---
id: 003
title: Hackathon Base MVP Task Breakdown
stage: tasks
date: 2025-12-12
surface: agent
model: claude-sonnet-4-5
feature: 001-hackathon-base-mvp
branch: 001-hackathon-base-mvp
user: Cravix
command: /sp.tasks
labels: ["tasks", "implementation", "tdd", "parallel-execution", "mvp"]
links:
  spec: specs/001-hackathon-base-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-hackathon-base-mvp/tasks.md
  - history/prompts/001-hackathon-base-mvp/003-task-breakdown.tasks.prompt.md
tests:
  - Task dependencies validated (sequential vs parallel)
  - User story independence verified
  - TDD workflow enforced (backend tests before implementation)
---

## Prompt

/sp.tasks

Plan Reference: Technical Implementation Plan for Physical AI Textbook
Objective: Decompose the implementation plan into an ordered list of atomic, testable tasks. Each task must be executable by a single /sp.implement command.

Tasks should include:
1.  Docusaurus project initialization and configuration (e.g., `docusaurus.config.js`).
2.  Generation of all MDX files for Chapters 1, 2, 3, and 4 (including the full code blocks from the previous chapters).
3.  FastAPI basic setup (Docker and `requirements.txt`).
4.  Implementation of the Qdrant client (`vector_db.py`).
5.  Implementation of the content indexing script that scrapes Docusaurus output and loads vectors into Qdrant and metadata into Neon.
6.  Implementation of the `/api/v1/chat` endpoint with RAG logic.
7.  Implementation of the Docusaurus React Chatbot component.
8.  Setup of GitHub Actions for automated deployment.

## Response snapshot

Generated comprehensive task breakdown (75 tasks) organized by 7 phases and 4 user stories:

**Phase Structure:**
1. **Setup (5 tasks)**: Repository structure, Docusaurus init, Python init, linting, .env templates
2. **Foundational (10 tasks)**: Math plugins, sidebar structure, FastAPI architecture, Qdrant/Neon clients, CORS, Pydantic models, GitHub Actions, Dockerfile - BLOCKS all user stories until complete
3. **User Story 1 - Textbook Content (12 tasks, P1)**: Create stub MDX files for all modules, use Content Subagent to generate Chapter 4 (~1500 words, 5 code examples, 3 LaTeX equations, 3 diagrams), configure GitHub Pages, deploy, Lighthouse audit
4. **User Story 4 - Indexing (10 tasks, P1)**: Implement MDX parser, text chunker, indexing service, `/api/v1/index` endpoint, tests, deploy to Render, verify Qdrant (~200 vectors) + Neon (~200 rows)
5. **User Story 2 - General Chatbot (19 tasks, P2)**: Implement citation service, RAG service, `/api/v1/chat` endpoint, `/api/v1/health` endpoint, tests, use Code Subagent to create 4 React components (FloatingButton, MessageList, InputField, main Chatbot), swizzle Docusaurus Layout, deploy, test
6. **User Story 3 - Selected Text (7 tasks, P3)**: Create ContextBadge, AskAIButton, update Chatbot with text selection listener, deploy, test
7. **Polish (12 tasks)**: Playwright E2E tests, loading skeleton, README, backend CI, coverage validation, Lighthouse audits, mobile testing, accessibility scan, out-of-scope query test

**Task Format**: `[ID] [P?] [Story] Description`
- **[P]** = parallel execution possible (different files, no dependencies)
- **[Story]** = user story mapping (US1, US2, US3, US4)
- Exact file paths included (e.g., `backend/app/services/rag_service.py`)

**Key Implementation Details:**

**User Story 1 (Textbook):**
- T021: Content Subagent generates Chapter 4 with 5 sections:
  - 4.1 Intro to Digital Twins (~300 words)
  - 4.2 URDF File Structure (~400 words + 1 Python + 1 URDF XML + 1 LaTeX)
  - 4.3 SDF Models (~300 words + 1 SDF XML)
  - 4.4 Physics Simulation (~400 words + 1 Python ROS 2 + 1 LaTeX)
  - 4.5 Sensor Simulation (~400 words + 1 Python + 1 LaTeX + 3 diagrams)
- T027: Lighthouse Performance ≥90 validation

**User Story 4 (Indexing):**
- T028: MDX parser (parse frontmatter, extract sections, strip Markdown, preserve LaTeX)
- T029: Text chunker (500 words target, 50-word overlap, recursive splitting)
- T030: Indexing service (fetch MDX → chunk → embed → Qdrant + Neon, storage estimation <900MB)
- T035: Trigger indexing on deployed backend (<10 min completion time)

**User Story 2 (Chatbot Backend + Frontend):**
- T039: RAG service (embed query → search Qdrant top 5 → retrieve metadata from Neon → generate with GPT-3.5-turbo → format citations)
- T040: `/api/v1/chat` endpoint (validate ChatRequest, call RAG service, return ChatResponse)
- T046-T048: Code Subagent creates 3 parallel React components (FloatingButton, MessageList, InputField)
- T049: Main Chatbot component (useState for isOpen/messages/input/isLoading, handleSubmit with fetch, loading indicator)
- T052: Swizzle Docusaurus Layout, inject Chatbot component

**User Story 3 (Selected Text):**
- T058: Update Chatbot with mouseup event listener, window.getSelection() (1-2000 chars), "Ask AI about this" button positioning, pass selectedText as context in ChatRequest

**Subagent Invocation Strategy (Principle VIII):**
- **Content Subagent**: T021 (Chapter 4 MDX generation)
- **Code Subagent**: T046-T049 (4 React components), T057, T059 (ContextBadge, AskAIButton)
- Total subagent tasks: 7 (maximizes bonus point potential)

**Dependencies & Critical Path:**
- Sequential: Setup → Foundational → US1 → US4 → US2 → US3 → Polish
- Foundational (Phase 2) BLOCKS all user stories (T006-T015 must complete first)
- US4 depends on US1 (needs GitHub Pages URL for MDX fetching)
- US2 depends on US4 (needs indexed vectors for RAG)
- US3 depends on US2 (extends chatbot component)

**Parallel Execution Opportunities (30+ tasks marked [P]):**
- Phase 1: T002 (Docusaurus), T003 (Python), T004 (linting) parallel
- Phase 2: T007 (sidebar), T008-T011 (backend structure), T014-T015 (deployment files) parallel
- Phase 3: T016-T020 (stub MDX files) all parallel
- Phase 4: T028-T029 (parser + chunker) parallel, T032-T033 (tests) parallel
- Phase 5: T042-T043 (backend tests) parallel, T046-T048 (React components) parallel
- Phase 7: T064-T065 (E2E tests), T069-T074 (validation/audits) overlap

**Test-Driven Development (TDD) Workflow:**
- Backend tasks enforce TDD: write tests (T032-T033, T042-T043) before/during implementation (T030-T031, T039-T041)
- 80% coverage target (T069 validation)
- Playwright E2E tests for user flows (T064-T065)

**Checkpoints (5 validation points):**
- After Phase 2: "Foundation ready - user story implementation can now begin in parallel"
- After Phase 3 (US1): "User Story 1 complete - textbook deployed with Chapter 4 accessible"
- After Phase 4 (US4): "User Story 4 complete - indexing pipeline functional, Chapter 4 content indexed"
- After Phase 5 (US2): "User Story 2 complete - chatbot functional with general queries, source citations"
- After Phase 6 (US3): "User Story 3 complete - selected text feature functional"

**Implementation Strategies:**
1. **MVP First**: Phases 1-5 (Setup → US1 → US4 → US2) = 100pts base requirement
2. **Incremental Delivery**: Deploy after each user story for continuous validation
3. **Parallel Team**: 3 developers can work on US1, US4, US2 simultaneously after Foundational phase

## Outcome

- ✅ Impact: Ready for `/sp.implement` execution; 75 atomic tasks with clear acceptance criteria
- 🧪 Tests: TDD workflow enforced (backend tests before implementation), E2E tests defined (T064-T065), coverage validation (T069)
- 📁 Files: tasks.md (400+ lines with detailed task descriptions, dependencies, parallel opportunities)
- 🔁 Next prompts: Run `/sp.implement` on individual tasks starting with Phase 1 (T001-T005), or use automated execution for parallel tasks
- 🧠 Reflection: Task breakdown balances granularity (75 tasks vs overwhelming 150+) with atomicity (each task completable in 2-4 hours). Parallel opportunities (30+ tasks) enable team collaboration or concurrent execution. Checkpoints provide validation gates for incremental delivery. Subagent invocation (7 tasks) strategically placed for maximum Principle VIII compliance.

## Evaluation notes (flywheel)

- Failure modes observed: None (successful task generation)
- Graders run and results (PASS/FAIL): Dependency validation PASS (sequential dependencies clear, parallel opportunities marked), User story independence PASS (each story testable independently), TDD workflow PASS (backend tests before implementation)
- Prompt variant (if applicable): N/A (initial task breakdown)
- Next experiment (smallest change to try): During implementation, monitor task completion time (target 2-4 hours/task); if tasks consistently take >4 hours, consider breaking down further in next iteration

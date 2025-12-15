---
id: 002
title: Hackathon Base MVP Implementation Plan
stage: plan
date: 2025-12-12
surface: agent
model: claude-sonnet-4-5
feature: 001-hackathon-base-mvp
branch: 001-hackathon-base-mvp
user: Cravix
command: /sp.plan
labels: ["plan", "architecture", "docusaurus", "fastapi", "qdrant", "neon-postgres", "rag", "mvp"]
links:
  spec: specs/001-hackathon-base-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-hackathon-base-mvp/plan.md
  - specs/001-hackathon-base-mvp/research.md
  - specs/001-hackathon-base-mvp/data-model.md
  - specs/001-hackathon-base-mvp/quickstart.md
  - specs/001-hackathon-base-mvp/contracts/api-v1-openapi.yaml
  - history/prompts/001-hackathon-base-mvp/002-implementation-plan.plan.prompt.md
tests:
  - Constitution Check validation (all 8 principles passed)
  - Data model alignment with FR-026 and FR-029
  - API contracts validation (3 endpoints defined)
---

## Prompt

/sp.plan

Specification Reference: Hackathon Base Deliverables (Book & RAG Chatbot)
Objective: Generate a comprehensive, multi-step technical plan for setting up the Docusaurus project, the FastAPI RAG backend, and linking them together.

Key Architectural Decisions:
1.  **Docusaurus Setup:** Use the official Docusaurus v3 template and configure the sidebar according to the four modules.
2.  **FastAPI Project Structure:** Use a Python virtual environment. The backend must include a `requirements.txt`, a `main.py` (FastAPI app), a `vector_db.py` (Qdrant client), and a `data_loader.py` (indexing script).
3.  **Chatbot Integration:** Develop a custom Docusaurus React component (`src/components/Chatbot.js`) that handles the API calls and displays the chat UI. Include logic for sending selected text as context.
4.  **Deployment:** Detail the steps for deploying Docusaurus to GitHub Pages via GitHub Actions and deploying the FastAPI service to a cloud platform (e.g., Vercel, Render, or a simple cloud VM) using a Dockerfile.

Milestone 1: Book Setup & Content Generation (Chapters 1-4).
Milestone 2: RAG Backend & Indexing Setup (FastAPI, Qdrant, Neon).
Milestone 3: Frontend Integration & Testing (Chatbot Component).

## Response snapshot

Created comprehensive implementation plan with Phase 0 research, Phase 1 design artifacts, and 3 execution milestones:

**Phase 0: Research (Complete)**
- 10 technical research items (R1-R10) documented in research.md
- Key decisions: Docusaurus v3 + math plugins, FastAPI layered architecture, Qdrant Cloud Free Tier, Neon Postgres Free Tier, OpenAI text-embedding-3-small + gpt-3.5-turbo, 500-word chunking with 50-word overlap, custom React chatbot, GitHub Actions + Render deployment
- No NEEDS CLARIFICATION markers - all technical decisions resolved

**Phase 1: Design & Contracts (Complete)**
- data-model.md: 4 entities (DocumentChunk, ChatMessage, Chapter, IndexingJob)
- Postgres schema: `document_chunks` table with UUID, chapter_title, section_title, url, vector_id
- Qdrant collection: `textbook_chunks`, 1536-dim vectors, cosine similarity
- contracts/api-v1-openapi.yaml: OpenAPI 3.1 spec for 3 endpoints (POST /api/v1/chat, POST /api/v1/index, GET /api/v1/health)
- quickstart.md: 5-minute setup guide for developers

**3 Implementation Milestones (10-day timeline)**:

**Milestone 1: Book Setup & Content (Days 1-3)**
- Initialize Docusaurus v3 TypeScript project with classic preset
- Configure math support (remark-math, rehype-katex)
- Create 4-module sidebar structure matching spec.md FR-001
- **Use Content Subagent**: Generate Chapter 4 MDX content (Digital Twin: URDF/SDF, Gazebo, sensor simulation)
  - 5 code examples (Python ROS 2, URDF XML)
  - 3 LaTeX equations (kinematic transforms, sensor noise)
  - 3 diagram placeholders with descriptive alt text
- Create stub MDX files for other chapters
- Setup GitHub Actions workflow for GitHub Pages deployment
- Test locally + deploy to production
- Acceptance: Chapter 4 accessible, LaTeX renders, Lighthouse ≥90, mobile-responsive

**Milestone 2: RAG Backend & Indexing (Days 4-7)**
- Initialize Python 3.11 project with layered architecture (api/services/db/models/utils)
- **Use Code Subagent**: Implement FastAPI structure, Qdrant client, Neon Postgres client, indexing service, RAG service, citation service
- Key files: main.py, app/core/config.py, app/db/qdrant_client.py, app/db/postgres_client.py, app/utils/mdx_parser.py, app/utils/text_chunker.py, app/services/indexing_service.py, app/services/rag_service.py, app/api/v1/endpoints/{chat,index,health}.py
- Write pytest tests (aim 80% coverage)
- Create Dockerfile
- Deploy to Render Free Tier
- Test endpoints: health check, indexing (index Chapter 4 ~200 chunks), chat query
- Acceptance: All endpoints functional, Qdrant ~200 vectors, Postgres ~200 rows, tests pass

**Milestone 3: Frontend Integration & Testing (Days 8-10)**
- **Use Code Subagent**: Create Chatbot React component (index.tsx, FloatingButton, MessageList, InputField, ContextBadge)
- Implement text selection listener (mouseup event, window.getSelection())
- Implement API integration (fetch POST /api/v1/chat with query + context)
- Style chatbot with Infima CSS variables, mobile-responsive
- Swizzle Docusaurus Layout theme to inject chatbot
- Write Playwright E2E tests (general query, selected text query, citation navigation)
- Deploy to GitHub Pages
- Smoke test production
- Acceptance: Chatbot accessible all pages, queries <3s, selected text works, citations navigate correctly, E2E tests pass

**Project Structure:**
- Frontend: `docs/` (MDX content), `src/components/Chatbot/`, `src/theme/Layout/` (swizzled)
- Backend: `backend/app/{api,core,services,db,models,utils}`, `backend/tests/`
- Config: `docusaurus.config.js`, `sidebars.js`, `.github/workflows/deploy-frontend.yml`, `backend/Dockerfile`, `backend/requirements.txt`

**Constitution Check:**
- ✅ All 8 principles validated
- ✅ Free-Tier Architecture (Qdrant Cloud, Neon Postgres, GitHub Pages, Render Free Tier)
- ✅ RAG Security (context-only answers via FR-020)
- ✅ High-Performance UX (Lighthouse ≥90, FCP <1.5s)
- ✅ Test-First (80% backend coverage, TDD workflow)
- ⚠️ Reusable Intelligence: Content/Code/Utility Subagents to be invoked during implementation

**Risk Mitigation:**
- 🔴 HIGH: Qdrant storage limit (1GB) → estimate before indexing, fail early at 900MB, prioritize Chapter 4
- 🟡 MEDIUM: OpenAI API costs → use gpt-3.5-turbo, set $5/month alert, cache embeddings
- 🟡 MEDIUM: Render cold start latency → display "warming up" message, retry logic
- 🟢 LOW: GitHub Pages deployment failure → test locally first, fallback to Vercel

**3 ADR Opportunities Identified:**
1. ADR-001: Choice of Qdrant over Pinecone (free tier, no credit card)
2. ADR-002: OpenAI Embeddings vs open-source (cost/quality ratio)
3. ADR-003: Text chunking strategy (500 words, 50-word overlap rationale)

## Outcome

- ✅ Impact: Complete implementation roadmap ready for `/sp.tasks`; 3 milestones, 10-day timeline, clear acceptance criteria
- 🧪 Tests: Constitution Check passed (8/8 principles), data model validated against FRs, API contracts complete
- 📁 Files: plan.md (524 lines), research.md (450+ lines), data-model.md (220+ lines), quickstart.md (180+ lines), contracts/api-v1-openapi.yaml (250+ lines)
- 🔁 Next prompts: Run `/sp.tasks` to generate detailed task breakdown with dependencies and parallel execution opportunities
- 🧠 Reflection: Plan balances architectural rigor (layered backend, component-based frontend) with hackathon pragmatism (free-tier constraints, 10-day timeline, MVP scope). Subagent usage strategy maximizes Constitution Principle VIII bonus points. Risk mitigation addresses primary concerns (Qdrant storage, OpenAI costs, cold start latency).

## Evaluation notes (flywheel)

- Failure modes observed: None (successful plan generation)
- Graders run and results (PASS/FAIL): Constitution Check PASS (all principles validated), Data Model PASS (schema matches FR-026/FR-029), API Contracts PASS (3 endpoints match FR-016 to FR-027)
- Prompt variant (if applicable): N/A (initial planning)
- Next experiment (smallest change to try): During `/sp.tasks`, evaluate task granularity (aim for tasks completable in 2-4 hours for effective parallelization)

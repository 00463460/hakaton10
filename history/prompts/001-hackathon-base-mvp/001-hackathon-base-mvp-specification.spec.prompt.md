---
id: 001
title: Hackathon Base MVP Specification
stage: spec
date: 2025-12-12
surface: agent
model: claude-sonnet-4-5
feature: 001-hackathon-base-mvp
branch: 001-hackathon-base-mvp
user: Cravix
command: /sp.specify
labels: ["spec", "hackathon", "mvp", "textbook", "rag-chatbot", "docusaurus", "fastapi"]
links:
  spec: specs/001-hackathon-base-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-hackathon-base-mvp/spec.md
  - specs/001-hackathon-base-mvp/checklists/requirements.md
  - history/prompts/001-hackathon-base-mvp/001-hackathon-base-mvp-specification.spec.prompt.md
tests:
  - Quality checklist validation (all items passed)
---

## Prompt

/sp.specify

Feature: Hackathon Base Deliverables (Book & RAG Chatbot)
Objective: Generate a complete, unambiguous specification document for the textbook (content, structure) and the fully integrated RAG chatbot functionality.

**Part 1: Textbook Content & Structure (Docusaurus)**
1.  **Structure:** The book must have four main modules, broken down into detailed chapters following the provided course outline (ROS 2, Digital Twin, Isaac, VLA).
2.  **Content Requirement:** Generate the full MDX content for **Chapter 4: The Digital Twin (Gazebo & Unity)**, focusing on URDF/SDF, physics simulation, and sensor simulation (LiDAR, Depth Cameras).
3.  **Visualization:** Integrate placeholders for diagrams or schematics for complex topics (e.g., ).

**Part 2: Integrated RAG Chatbot Functionality**
1.  **Frontend Component:** A persistent, collapsible React/MDX chatbot component embedded into the Docusaurus layout.
2.  **Retrieval Modes:**
    * **Mode A (General Query):** User types a question, and the API queries Qdrant with the full query.
    * **Mode B (Selected Text Context):** User highlights text on the page, clicks an "Ask AI about this" button, and the API uses the selected text (and the user's question) as the retrieval context.
3.  **Backend Services (FastAPI):** Must include three key endpoints:
    * `/api/v1/index`: Endpoint to trigger the indexing of the deployed book's content into Qdrant/Neon.
    * `/api/v1/chat`: Main chat endpoint that handles retrieval (Qdrant) and generation (LLM).
    * `/api/v1/health`: Simple endpoint for deployment monitoring.
4.  **Data Persistence:** Neon Postgres must store the document metadata (Chapter Title, URL, Chunk ID) linking Qdrant vectors back to source text.

## Response snapshot

Created comprehensive feature specification for Hackathon Base Deliverables (Textbook & RAG Chatbot) with:

**Branch & Structure:**
- Created feature branch: `001-hackathon-base-mvp`
- Initialized spec directory: `specs/001-hackathon-base-mvp/`
- Created PHR directory: `history/prompts/001-hackathon-base-mvp/`

**User Stories (4 total, prioritized P1-P3):**
1. **P1: Read Physical AI Textbook Content** - Students access online textbook with Chapter 4 (Digital Twin) complete with LaTeX, code examples, diagrams
2. **P2: Ask General Questions via RAG Chatbot** - Students query chatbot, receive textbook-grounded answers with source citations
3. **P3: Ask Questions About Selected Text** - Students highlight text, ask contextual questions with pre-populated context
4. **P1: Index Textbook Content for RAG** - Admins trigger indexing, chunk MDX files, generate embeddings, store in Qdrant + Neon

Each story includes:
- Clear priority justification
- Independent test description
- 5 Given-When-Then acceptance scenarios

**Functional Requirements (31 total, organized by component):**
- Textbook Content: FR-001 to FR-007 (Docusaurus v3, 4 modules, Chapter 4 MDX, LaTeX, code examples, diagrams, GitHub Pages deployment, Lighthouse ≥90)
- RAG Chatbot Frontend: FR-008 to FR-015 (React component, floating toggle, message history, 500-char limit, Mode A/B, citations, loading indicator)
- RAG Chatbot Backend: FR-016 to FR-028 (FastAPI endpoints, validation, Qdrant retrieval, LLM generation, indexing, health check, CORS)
- Data Persistence: FR-029 to FR-031 (Qdrant Cloud Free Tier, Neon Postgres, stateless chatbot)

**Success Criteria (10 measurable outcomes):**
- SC-001 to SC-003: Textbook navigation and performance (<3 clicks, FCP <1.5s, executable code)
- SC-004 to SC-006: Chatbot quality (90% queries <3s, 100% citations, 100% fallback for out-of-scope)
- SC-007: Indexing performance (<10 min, <1GB Qdrant storage)
- SC-008 to SC-010: Cross-cutting (95% selected text success, WCAG AA, zero secrets in Git)

**Key Entities:**
- Chapter (title, module, url, MDX content)
- Chunk (chunk_id, text, metadata, embedding vector)
- ChatMessage (role, content, sources, timestamp)
- Source Citation (chapter, section, url)

**Assumptions (8 documented):**
- A-001: OpenAI API <$10/month
- A-002: GitHub Pages supports <1000 visitors
- A-003: Qdrant 1GB sufficient (~600MB projected)
- A-004: Neon 100 hours/month sufficient
- A-005: English only (Urdu is Bonus 3)
- A-006: No auth (Better-Auth is Bonus 1)
- A-007: Diagram placeholders acceptable
- A-008: KaTeX-compatible LaTeX

**Dependencies (6):**
- Docusaurus v3, Qdrant Cloud, Neon Postgres, OpenAI API, GitHub Actions, GitHub Pages

**Out of Scope (10 items explicitly excluded):**
- User auth, personalization, Urdu translation, persistent chat, admin dashboard, actual diagrams, mobile apps, advanced RAG, rate limiting, comprehensive content for all modules

**Quality Validation:**
- Created requirements checklist: `specs/001-hackathon-base-mvp/checklists/requirements.md`
- All quality checks passed (content quality, requirement completeness, feature readiness)
- Constitutional alignment confirmed (Free-Tier Architecture, RAG Security, High-Performance UX, Technical Precision)
- Risk flags: HIGH (Qdrant storage), MEDIUM (OpenAI costs), LOW (Neon compute)

## Outcome

- ✅ Impact: Complete, unambiguous specification ready for `/sp.plan`; establishes foundation for 100pt base deliverable + bonus features
- 🧪 Tests: Quality checklist validation passed (20 acceptance scenarios defined, 6 edge cases documented, all requirements testable)
- 📁 Files: spec.md (199 lines), requirements checklist (120 lines), PHR created
- 🔁 Next prompts: Run `/sp.plan` to generate implementation plan with technical architecture, data models, API contracts
- 🧠 Reflection: Specification balances hackathon constraints (free-tier, time limits) with production quality (measurable outcomes, constitutional compliance). Story prioritization (P1: textbook + indexing, P2: general chatbot, P3: selected text) ensures MVP readiness even if time runs short.

## Evaluation notes (flywheel)

- Failure modes observed: None (successful spec creation on first iteration)
- Graders run and results (PASS/FAIL): Quality checklist PASS (all 12 items validated)
- Prompt variant (if applicable): N/A (initial specification)
- Next experiment (smallest change to try): During `/sp.plan`, evaluate ADR opportunities for technology choices (Qdrant vs alternatives, OpenAI vs open-source embeddings, chunking strategy)

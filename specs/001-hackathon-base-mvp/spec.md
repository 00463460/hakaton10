# Feature Specification: Hackathon Base Deliverables (Textbook & RAG Chatbot)

**Feature Branch**: `001-hackathon-base-mvp`
**Created**: 2025-12-12
**Status**: Draft
**Input**: User description: "Feature: Hackathon Base Deliverables (Book & RAG Chatbot)"

## User Scenarios & Testing

### User Story 1 - Read Physical AI Textbook Content (Priority: P1)

Students access a professional, university-level online textbook covering Physical AI and Humanoid Robotics. The textbook presents technical content with mathematical equations, code examples, and diagrams in a scannable, mobile-responsive format.

**Why this priority**: Core deliverable for hackathon base requirements. Without the textbook content, no other features (chatbot, indexing) have value. This is the foundational MVP.

**Independent Test**: Navigate to deployed GitHub Pages site, browse to Chapter 4 (Digital Twin), verify content renders with LaTeX equations, code blocks are syntax-highlighted, and diagrams display correctly. Content must be readable on mobile (320px width) and desktop (1920px width).

**Acceptance Scenarios**:

1. **Given** a student visits the Docusaurus site homepage, **When** they click on "Module 2: ROS 2 Fundamentals & Simulation", **Then** they see a chapter listing including "Chapter 4: The Digital Twin (Gazebo & Unity)"
2. **Given** a student navigates to Chapter 4, **When** the page loads, **Then** they see sections covering URDF/SDF models, physics simulation, and sensor simulation (LiDAR, Depth Cameras) with explanatory text, LaTeX-rendered equations, and code examples
3. **Given** a student views Chapter 4 on a mobile device (320px width), **When** they scroll through the content, **Then** all text, equations, code blocks, and diagrams are readable without horizontal scrolling
4. **Given** a student selects a code example in Chapter 4, **When** they copy-paste it, **Then** the code is syntactically valid and ready to execute (no placeholder values unless explicitly documented)
5. **Given** a student views Chapter 4, **When** they see a diagram placeholder (e.g., "Figure 4.1: URDF Robot Model Structure"), **Then** the placeholder is clearly marked with descriptive alt text explaining what the diagram would show

---

### User Story 2 - Ask General Questions via RAG Chatbot (Priority: P2)

Students ask questions about Physical AI topics and receive answers grounded exclusively in the textbook content, with source citations linking back to specific chapters.

**Why this priority**: Core hackathon requirement (100 pts). Demonstrates functional RAG pipeline without selected-text complexity. Independently valuable even if Story 3 (selected text) is not implemented.

**Independent Test**: Open chatbot, type "What is URDF in ROS 2?", submit query. Verify response contains textbook-based answer with citation like "[Source: Chapter 4, Section 4.2]" and hyperlink to that section. Test with question outside textbook scope (e.g., "What's the weather today?") to confirm refusal/fallback response.

**Acceptance Scenarios**:

1. **Given** a student is viewing any page on the textbook site, **When** they click the chatbot toggle button (e.g., floating icon bottom-right), **Then** a chatbot panel slides open with input field and message history visible
2. **Given** the chatbot is open, **When** a student types "Explain URDF file structure" and presses Enter, **Then** the system queries the vector database, retrieves relevant chunks from Chapter 4, generates an answer, and displays it with source citations (Chapter title, section, hyperlink)
3. **Given** the chatbot displays an answer, **When** a student clicks a citation hyperlink (e.g., "[Chapter 4, Section 4.2]"), **Then** the page navigates to that section and highlights the referenced text
4. **Given** a student asks a question outside the textbook scope (e.g., "Who won the 2024 World Cup?"), **When** the system processes the query, **Then** it responds with "I can only answer questions about Physical AI and Humanoid Robotics based on this textbook" and suggests related topics
5. **Given** the chatbot is open and has message history, **When** a student collapses the chatbot panel, **Then** the panel slides closed, and the toggle button remains visible to reopen it with history preserved

---

### User Story 3 - Ask Questions About Selected Text (Priority: P3)

Students highlight specific text on a textbook page and ask contextual questions, enabling deeper exploration of confusing passages without requiring them to rephrase context.

**Why this priority**: Bonus feature (100 pts). Enhances UX but not critical for base deliverable. Depends on Story 2 (chatbot infrastructure) but is independently testable once chatbot exists.

**Independent Test**: Highlight a paragraph in Chapter 4 about sensor simulation, click "Ask AI about this" button (appears on text selection), type question "Why is LiDAR used instead of cameras?", verify response uses selected text as context and cites the same chapter section.

**Acceptance Scenarios**:

1. **Given** a student is reading Chapter 4, **When** they highlight a paragraph about LiDAR sensors using their mouse/touch, **Then** a floating tooltip appears with an "Ask AI about this" button
2. **Given** the "Ask AI about this" button is visible, **When** the student clicks it, **Then** the chatbot opens with the selected text pre-populated as context (e.g., "Selected text: [quoted paragraph]") and the input field ready for their question
3. **Given** the chatbot has selected text as context, **When** the student types "Explain this in simpler terms" and submits, **Then** the system sends both the selected text and the question to the backend, retrieves relevant chunks prioritizing the selected passage, and generates a contextual answer with citations
4. **Given** a student submits a contextual query, **When** the response is generated, **Then** the answer explicitly references the selected text (e.g., "The passage you selected discusses LiDAR's advantage in...") and includes standard source citations
5. **Given** a student closes the chatbot after a contextual query, **When** they reopen it, **Then** the selected text context is cleared, and the chatbot returns to general query mode

---

### User Story 4 - Index Textbook Content for RAG (Priority: P1)

System administrators or automated CI/CD pipelines trigger indexing of deployed textbook content, chunking MDX files, generating embeddings, and storing them in the vector database with metadata linking back to source chapters.

**Why this priority**: Prerequisite for Story 2 and Story 3. Without indexed content, chatbot cannot function. Treated as P1 because it blocks all RAG features, but is typically a one-time setup task rather than student-facing.

**Independent Test**: Deploy textbook to GitHub Pages, call `/api/v1/index` endpoint (authenticated or open depending on spec), verify logs show successful chunking of Chapter 4, check Qdrant dashboard for vector count increase, query Neon Postgres to confirm metadata rows (Chapter 4 title, URL, chunk IDs).

**Acceptance Scenarios**:

1. **Given** the textbook site is deployed to GitHub Pages with updated content, **When** an administrator calls `POST /api/v1/index` (or automated CI/CD trigger), **Then** the system fetches all MDX files from the deployed site, parses content, and chunks text into ~500-word segments
2. **Given** the indexing process has chunked content, **When** embeddings are generated for each chunk, **Then** the system uses OpenAI Embeddings (text-embedding-3-small) to create 1536-dimensional vectors and stores them in Qdrant Cloud Free Tier with metadata (chunk_id, chapter_title, section_title, url)
3. **Given** vectors are stored in Qdrant, **When** the system writes metadata to Neon Postgres, **Then** each chunk has a corresponding row in the `document_chunks` table with columns: chunk_id (UUID), chapter_title (text), section_title (text), url (text), vector_id (UUID from Qdrant), created_at (timestamp)
4. **Given** indexing completes successfully, **When** the endpoint returns a response, **Then** the response includes summary statistics: total_chunks_indexed (integer), total_chapters_processed (integer), indexing_duration_seconds (float), status: "success"
5. **Given** indexing encounters an error (e.g., Qdrant quota exceeded), **When** the process fails, **Then** the endpoint returns HTTP 500 with error message and partial progress (chapters successfully indexed before failure)

---

### Edge Cases

- **What happens when a student asks the same question repeatedly?** System retrieves from vector DB each time (no query-level caching) but response may vary slightly due to LLM generation. Accept as expected behavior unless response quality degrades.
- **How does the system handle very long questions (>1000 characters)?** Frontend enforces 500-character limit on chatbot input with counter. Backend validates and returns 400 Bad Request if exceeded.
- **What if Qdrant Free Tier storage (1GB) is exceeded during indexing?** Indexing process estimates chunk count and vector size before starting; fails with clear error message if projected size exceeds 900MB (safety margin). Suggest content reduction or upgrading plan.
- **What if selected text spans multiple chapters or sections?** Frontend limits text selection to 2000 characters max. Backend processes it as single context chunk regardless of origin, but citations may reference multiple sections if retrieval finds relevant content across chapters.
- **How does the chatbot handle concurrent users?** FastAPI backend is stateless; each query is independent. Qdrant Cloud handles concurrent reads. No session management needed for MVP (users don't have persistent chat history across page reloads).
- **What if GitHub Pages deployment fails or site is inaccessible during indexing?** Indexing endpoint includes retry logic (3 attempts with exponential backoff) for fetching MDX files. If all retries fail, returns 503 Service Unavailable with error details.

## Requirements

### Functional Requirements

**Textbook Content (Part 1):**

- **FR-001**: System MUST serve a Docusaurus v3 site with four main modules: (1) Introduction to Physical AI, (2) ROS 2 Fundamentals & Simulation, (3) Vision-Language-Action Models, (4) Advanced Topics
- **FR-002**: System MUST include complete MDX content for Chapter 4 "The Digital Twin (Gazebo & Unity)" under Module 2, covering URDF/SDF models, physics simulation engines (Gazebo), and sensor simulation (LiDAR point clouds, depth cameras)
- **FR-003**: Chapter 4 MUST include at least 5 executable code examples (Python for ROS 2 nodes, URDF XML snippets) with syntax highlighting and copy buttons
- **FR-004**: Chapter 4 MUST render at least 3 mathematical equations using LaTeX notation (e.g., kinematic transformations, sensor noise models) via KaTeX or MathJax
- **FR-005**: Chapter 4 MUST include placeholders for at least 3 diagrams (e.g., "Figure 4.1: URDF Robot Model Structure") with descriptive alt text explaining the visual content
- **FR-006**: System MUST deploy the Docusaurus site to GitHub Pages with automated CI/CD via GitHub Actions on push to main branch
- **FR-007**: System MUST achieve Lighthouse Performance score ≥ 90 on deployed site (measured on Chapter 4 page)

**RAG Chatbot Frontend (Part 2):**

- **FR-008**: System MUST embed a persistent, collapsible React chatbot component into the Docusaurus layout, accessible from all pages
- **FR-009**: Chatbot component MUST include a floating toggle button (bottom-right corner, 60px diameter) that opens/closes the chat panel with slide-in animation
- **FR-010**: Chatbot panel MUST display message history (user questions and bot responses) with distinct styling, scrollable up to 50 messages
- **FR-011**: Chatbot input field MUST enforce a 500-character limit with real-time character counter
- **FR-012**: System MUST support Mode A (General Query): user types question, system sends to `/api/v1/chat` with query text only
- **FR-013**: System MUST support Mode B (Selected Text Context): user highlights text on page (up to 2000 characters), clicks "Ask AI about this" button, chatbot opens with selected text as context parameter sent to `/api/v1/chat`
- **FR-014**: Chatbot responses MUST display source citations as hyperlinks (e.g., "[Chapter 4, Section 4.2]") that navigate to the referenced section on click
- **FR-015**: Chatbot MUST show loading indicator (spinner or "thinking..." message) while waiting for `/api/v1/chat` response

**RAG Chatbot Backend (Part 2):**

- **FR-016**: System MUST provide FastAPI backend with endpoint `POST /api/v1/chat` accepting JSON payload: `{ "query": string, "context": string | null }`
- **FR-017**: `/api/v1/chat` endpoint MUST validate input: query length 1-500 chars, context length 0-2000 chars, return 400 Bad Request if invalid
- **FR-018**: `/api/v1/chat` endpoint MUST query Qdrant vector database with embedded query (using OpenAI text-embedding-3-small) to retrieve top 5 most relevant chunks (cosine similarity)
- **FR-019**: If `context` parameter is provided (Mode B), system MUST prepend selected text to the retrieval query to prioritize contextually relevant chunks
- **FR-020**: `/api/v1/chat` endpoint MUST generate response using retrieved chunks as context via LLM API (OpenAI GPT-4 or compatible), instructing model to answer exclusively based on provided context
- **FR-021**: `/api/v1/chat` response MUST include source citations with chapter title, section title, and URL for each chunk used in generation
- **FR-022**: `/api/v1/chat` response MUST return JSON: `{ "answer": string, "sources": [{ "chapter": string, "section": string, "url": string }], "confidence": float }`
- **FR-023**: System MUST provide endpoint `POST /api/v1/index` (no authentication for MVP) that triggers re-indexing of deployed textbook content
- **FR-024**: `/api/v1/index` endpoint MUST fetch all MDX files from GitHub Pages deployment, parse Markdown content (strip frontmatter, HTML tags), and chunk into ~500-word segments with 50-word overlap
- **FR-025**: `/api/v1/index` endpoint MUST generate embeddings for each chunk (OpenAI text-embedding-3-small) and store vectors in Qdrant Cloud with metadata: chunk_id, chapter_title, section_title, url
- **FR-026**: `/api/v1/index` endpoint MUST write chunk metadata to Neon Postgres table `document_chunks` with schema: chunk_id UUID PRIMARY KEY, chapter_title TEXT, section_title TEXT, url TEXT, vector_id UUID, created_at TIMESTAMP
- **FR-027**: System MUST provide endpoint `GET /api/v1/health` returning JSON: `{ "status": "ok", "qdrant_connected": bool, "postgres_connected": bool, "timestamp": ISO8601 }`
- **FR-028**: All backend endpoints MUST implement CORS headers allowing requests from GitHub Pages domain (https://<username>.github.io)

**Data Persistence:**

- **FR-029**: System MUST use Qdrant Cloud Free Tier (1GB storage, 100k vectors) for vector embeddings with collection name `textbook_chunks` and 1536-dimensional vectors
- **FR-030**: System MUST use Neon Serverless Postgres Free Tier (0.5GB storage) with single table `document_chunks` as defined in FR-026
- **FR-031**: System MUST NOT persist user chat history (stateless chatbot; messages cleared on page reload)

### Key Entities

- **Chapter**: Represents a section of the textbook (e.g., "Chapter 4: The Digital Twin"). Attributes: title, module (parent), url (deployed page), content (MDX source)
- **Chunk**: Segmented piece of chapter content for vector indexing. Attributes: chunk_id (UUID), text (plain text ~500 words), chapter_title, section_title, url (link to source), embedding (1536-dim vector)
- **ChatMessage**: Ephemeral message in chatbot UI (not persisted). Attributes: role (user|assistant), content (text), sources (array of citations), timestamp
- **Source Citation**: Reference to textbook content used in chatbot response. Attributes: chapter_title, section_title, url

## Success Criteria

### Measurable Outcomes

- **SC-001**: Students can navigate the textbook and read Chapter 4 content in under 3 clicks from homepage (Homepage → Module 2 → Chapter 4)
- **SC-002**: Chapter 4 page loads with First Contentful Paint < 1.5s and Time to Interactive < 2.5s on 3G network (measured via Lighthouse)
- **SC-003**: Students successfully copy-paste at least 3 code examples from Chapter 4 and execute them without syntax errors (validated via manual testing)
- **SC-004**: Chatbot responds to 90% of textbook-related queries within 3 seconds (p90 latency from user submit to response display)
- **SC-005**: Chatbot provides source citations for 100% of answers generated from textbook content
- **SC-006**: Students who ask questions outside textbook scope receive fallback message (not hallucinated answers) in 100% of cases (validated via test queries on non-covered topics)
- **SC-007**: Indexing process completes for all textbook content (4 modules, estimated 50 chapters) within 10 minutes and stores vectors under Qdrant Free Tier 1GB limit
- **SC-008**: Selected text feature (Mode B) correctly passes highlighted text as context in 95% of attempts (measured via automated E2E tests simulating text selection)
- **SC-009**: Textbook site passes WCAG 2.1 Level AA accessibility checks (keyboard navigation, color contrast, ARIA labels) on automated scan
- **SC-010**: Zero hardcoded secrets or API keys committed to Git repository (validated via automated secret scanning in CI/CD)

## Assumptions

- **A-001**: OpenAI API access is available with cost controls to prevent runaway charges (estimated <$10/month for embeddings + generation at hackathon scale)
- **A-002**: GitHub Pages free tier supports site traffic for hackathon judging period (estimated <1000 unique visitors)
- **A-003**: Qdrant Cloud Free Tier 1GB storage is sufficient for textbook content (assumes ~50 chapters × 200 chunks/chapter × 6KB/vector = ~600MB)
- **A-004**: Neon Postgres Free Tier 100 compute-hours/month is sufficient (indexing + chat queries estimated <20 hours/month)
- **A-005**: Textbook content is authored in English; no multi-language support required for MVP (Urdu translation is Bonus 3, out of scope for base deliverables)
- **A-006**: Chatbot does not require user authentication for MVP (Better-Auth integration is Bonus 1, out of scope)
- **A-007**: Diagram placeholders in Chapter 4 are acceptable for MVP; actual diagrams can be added post-hackathon via tools like Mermaid.js or Excalidraw
- **A-008**: LaTeX equations in Chapter 4 use standard notation compatible with KaTeX (no custom macros requiring MathJax advanced features)

## Dependencies

- **D-001**: Docusaurus v3 documentation and React 18 compatibility
- **D-002**: Qdrant Cloud Free Tier account and API credentials
- **D-003**: Neon Serverless Postgres Free Tier account and connection string
- **D-004**: OpenAI API key with access to text-embedding-3-small and GPT-4 (or GPT-3.5-turbo as cost fallback)
- **D-005**: GitHub repository with GitHub Actions enabled for CI/CD
- **D-006**: GitHub Pages deployment target configured (branch or docs folder)

## Out of Scope (Explicitly Excluded from MVP)

- **OS-001**: User authentication and signup/signin (Better-Auth integration is Bonus 1, not base requirement)
- **OS-002**: Per-chapter personalization (code language switching, difficulty adjustment) is Bonus 2, not base requirement
- **OS-003**: Urdu translation feature is Bonus 3, not base requirement
- **OS-004**: Persistent chat history across sessions (requires user auth, out of scope)
- **OS-005**: Admin dashboard for managing indexed content (manual re-indexing via `/api/v1/index` endpoint is sufficient)
- **OS-006**: Actual diagrams for Chapter 4 (placeholders with descriptive alt text acceptable; diagrams can be added later)
- **OS-007**: Mobile app versions (web-only for MVP; mobile-responsive design via Docusaurus built-in)
- **OS-008**: Advanced RAG features (re-ranking, hybrid search, query expansion) - basic semantic search sufficient for 100pts
- **OS-009**: Rate limiting or abuse prevention on chatbot (open access for hackathon demo)
- **OS-010**: Comprehensive content for all 4 modules (only Chapter 4 required to demonstrate platform capability)

## Notes

- **Constitutional Alignment**: This spec adheres to Constitution Principle II (Free-Tier Architecture) by exclusively using Qdrant Cloud Free Tier, Neon Postgres Free Tier, and GitHub Pages. Principle III (RAG Security and Accuracy) is enforced via FR-020 (LLM answers only from provided context) and SC-006 (fallback for out-of-scope queries).
- **Hackathon Scoring**: Base deliverable (textbook + functional RAG chatbot) targets 100pts. Selected text feature (Story 3) demonstrates advanced UX for potential bonus points if time permits.
- **Risk Mitigation**: Primary risk is Qdrant storage limit. Mitigation: Estimate vector count during indexing (FR-025), fail early with clear error if approaching limit, prioritize indexing Chapter 4 first to ensure demo readiness.
- **Implementation Order**: Recommend completing stories in priority order (P1 → P2 → P3) to ensure MVP readiness even if time runs out. Story 4 (indexing) is prerequisite for Stories 2 and 3, so implement concurrently with Story 1 (textbook content).

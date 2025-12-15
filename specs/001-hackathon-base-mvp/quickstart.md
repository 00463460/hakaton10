# Quickstart Guide: Physical AI Textbook with RAG Chatbot

**Feature**: Hackathon Base Deliverables (Textbook & RAG Chatbot)
**Branch**: `001-hackathon-base-mvp`
**Prerequisites**: Node.js 20+, Python 3.11+, Git, GitHub account, accounts for Qdrant Cloud, Neon Postgres, OpenAI API

---

## Quick Start (5-Minute Setup)

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/<username>/physical-ai-textbook.git
cd physical-ai-textbook

# Frontend (Docusaurus)
npm install

# Backend (FastAPI)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

**Backend** (create `backend/.env`):
```env
QDRANT_URL=https://<cluster-id>.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
NEON_CONNECTION_STRING=postgresql://user:pass@host/db?sslmode=require
OPENAI_API_KEY=sk-your-openai-api-key
GITHUB_PAGES_BASE_URL=https://<username>.github.io/physical-ai-textbook
```

**Get Credentials**:
- Qdrant: Sign up at https://cloud.qdrant.io (free tier), create cluster, copy URL + API key
- Neon: Sign up at https://neon.tech (free tier), create project, copy connection string
- OpenAI: Get API key from https://platform.openai.com/api-keys

### 3. Run Locally

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
npm start  # Opens http://localhost:3000
```

### 4. Initialize Database and Index Content

```bash
# Wait for backend to start, then:
curl -X POST http://localhost:8000/api/v1/health  # Verify backend is up

# Trigger indexing (this will take 5-10 minutes for full textbook)
curl -X POST http://localhost:8000/api/v1/index

# Monitor progress in backend terminal logs
```

### 5. Test Chatbot

1. Open http://localhost:3000 in browser
2. Click floating chatbot button (bottom-right corner)
3. Type: "What is URDF in ROS 2?"
4. Verify response with source citations

---

## Project Structure Overview

```
physical-ai-textbook/
├── docs/                          # Textbook content (MDX files)
│   ├── module-1/
│   ├── module-2/
│   │   └── chapter-4.mdx         # Chapter 4: Digital Twin
│   ├── module-3/
│   └── module-4/
├── src/
│   └── components/
│       └── Chatbot/
│           ├── index.tsx          # Main chatbot component
│           ├── styles.module.css
│           └── types.ts
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── api/v1/endpoints/      # API routes
│       ├── services/              # Business logic
│       ├── db/                    # Database clients
│       └── models/                # Pydantic schemas
├── docusaurus.config.js           # Docusaurus configuration
├── sidebars.js                    # Sidebar navigation
└── package.json
```

---

## Common Tasks

### Add New Chapter

1. Create MDX file in `docs/module-X/chapter-Y.mdx`
2. Add frontmatter:
   ```yaml
   ---
   title: "Chapter Y: Title Here"
   sidebar_position: Y
   ---
   ```
3. Update `sidebars.js` if needed (auto-generated from frontmatter by default)
4. Re-index content: `curl -X POST http://localhost:8000/api/v1/index`

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Chat query (general)
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is URDF?"}'

# Chat query (with context)
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain this", "context": "URDF is an XML format..."}'

# Trigger indexing
curl -X POST http://localhost:8000/api/v1/index
```

### Deploy to Production

**Frontend (GitHub Pages)**:
```bash
# Configure docusaurus.config.js with your GitHub username
# Push to main branch → GitHub Actions auto-deploys
git add .
git commit -m "Add Chapter 4 content"
git push origin main
```

**Backend (Render)**:
1. Create account at https://render.com
2. New Web Service → Connect GitHub repo
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard (QDRANT_URL, NEON_CONNECTION_STRING, etc.)
6. Deploy → Get backend URL (e.g., `https://physical-ai-backend.onrender.com`)
7. Update `src/components/Chatbot/index.tsx` with production backend URL

---

## Troubleshooting

### Chatbot Not Responding

**Check**: Backend is running and reachable
```bash
curl http://localhost:8000/api/v1/health
# Should return: {"status": "ok", "qdrant_connected": true, ...}
```

**Fix**: Verify environment variables in `backend/.env`, restart backend

### Indexing Fails with "Storage Exceeded"

**Check**: Qdrant collection size
```bash
# In Python REPL:
from qdrant_client import QdrantClient
client = QdrantClient(url="...", api_key="...")
info = client.get_collection("textbook_chunks")
print(f"Vector count: {info.vectors_count}, Storage: {info.vectors_count * 6144 / 1024**2:.2f} MB")
```

**Fix**: Reduce content (fewer chapters) or upgrade Qdrant plan

### Citations Missing in Chatbot Response

**Check**: Postgres metadata exists for vector IDs
```sql
-- In Neon SQL editor
SELECT COUNT(*) FROM document_chunks;
```

**Fix**: Re-run indexing to populate metadata

### LaTeX Equations Not Rendering

**Check**: `remark-math` and `rehype-katex` plugins installed
```bash
npm list remark-math rehype-katex
```

**Fix**: Install plugins and add to `docusaurus.config.js`:
```js
module.exports = {
  presets: [
    [
      'classic',
      {
        docs: {
          remarkPlugins: [require('remark-math')],
          rehypePlugins: [require('rehype-katex')],
        },
      },
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
    },
  ],
};
```

---

## Next Steps After Quickstart

1. **Content Creation**: Write Chapter 4 MDX content (see `docs/module-2/chapter-4.mdx` template)
2. **Styling**: Customize chatbot appearance in `src/components/Chatbot/styles.module.css`
3. **Testing**: Write integration tests (see `backend/tests/test_endpoints.py`)
4. **Performance**: Run Lighthouse audit on deployed site (target: score ≥90)
5. **Deployment**: Push to GitHub to trigger auto-deployment

---

## Support

**Documentation**: See `specs/001-hackathon-base-mvp/` for full specification and implementation plan
**Issues**: Create GitHub issue at https://github.com/<username>/physical-ai-textbook/issues
**Constitution**: Refer to `.specify/memory/constitution.md` for project principles

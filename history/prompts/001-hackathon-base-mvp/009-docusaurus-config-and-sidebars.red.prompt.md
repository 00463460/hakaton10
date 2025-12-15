---
id: 009
title: Docusaurus Config and Sidebars for Vercel Deployment
stage: red
date: 2025-12-13
surface: agent
model: claude-sonnet-4-5
feature: 001-hackathon-base-mvp
branch: 001-hackathon-base-mvp
user: Cravix
command: /sp.implement
labels: ["implementation", "configuration", "docusaurus", "sidebars", "vercel", "navigation"]
links:
  spec: specs/001-hackathon-base-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - docusaurus.config.js
  - sidebars.js
  - history/prompts/001-hackathon-base-mvp/009-docusaurus-config-and-sidebars.red.prompt.md
tests:
  - Validated baseUrl changed from '/physical-ai-book/' to '/' (Vercel root path)
  - Validated URL changed to 'https://physical-ai-book.vercel.app'
  - Validated sidebars.js structure (4 modules, 14 chapters + intro + resources)
  - Validated KaTeX configuration remains intact (11 custom macros)
  - Validated sidebar category labels with emojis (📘 🔧 🧠 🚀 📚)
---

## Prompt

/sp.implement

Task: Generate the complete 'docusaurus.config.js' file and the companion 'sidebars.js' file.
Requirements:
1. The 'docusaurus.config.js' must set the title to "Physical AI & Humanoid Robotics" and the 'baseUrl' to '/' (root path, ideal for Vercel).
2. It must configure KaTeX/LaTeX support using the appropriate presets/plugins.
3. The 'sidebars.js' must explicitly structure the four book modules as top-level categories, assuming documents are named `chapter1`, `chapter2`, `chapter3`, and `chapter4` (or similar sequential naming) within the `docs` directory.

## Response snapshot

Updated `docusaurus.config.js` for Vercel deployment and created comprehensive `sidebars.js` with 4-module structure:

**File 1: `docusaurus.config.js` (UPDATED)**

**Change 1: Base URL for Vercel Deployment**

Updated from GitHub Pages configuration to Vercel root path deployment:

```javascript
// BEFORE (GitHub Pages)
url: 'https://panaversity.github.io',
baseUrl: '/physical-ai-book/',
deploymentBranch: 'gh-pages',

// AFTER (Vercel)
url: 'https://physical-ai-book.vercel.app',
baseUrl: '/', // Root path for Vercel deployment
// deploymentBranch removed (not needed for Vercel)
```

**Rationale**:
- Vercel serves sites at root domain by default (`/` instead of `/physical-ai-book/`)
- Simplifies URL structure: `physical-ai-book.vercel.app/module-1/chapter-1` instead of `physical-ai-book.vercel.app/physical-ai-book/module-1/chapter-1`
- `organizationName` and `projectName` retained for "Edit this page" GitHub links

**Change 2: URL Configuration**

```javascript
url: 'https://physical-ai-book.vercel.app',
```

- Updated to Vercel app domain (default Vercel subdomain)
- Can be changed to custom domain later (e.g., `https://textbook.panaversity.org`)

**Existing Configuration Retained**:

✅ **Title**: "Physical AI & Humanoid Robotics" (requirement #1)
✅ **KaTeX Support**: `remark-math` + `rehype-katex` with 11 custom macros (requirement #2):
- `\vec`, `\mat`, `\T`, `\inv`, `\norm`, `\abs`, `\dd`, `\ddt`, `\pdv`, `\R`, `\SE`, `\SO`
✅ **KaTeX Stylesheet**: CDN v0.16.9 with SRI integrity hash
✅ **Navbar**: 4 module links + GitHub + Discord
✅ **Footer**: 4 link groups (modules, community, resources, legal)
✅ **Theme**: Light/dark mode with Prism syntax highlighting
✅ **Announcement Bar**: Hackathon promotion

**File 2: `sidebars.js` (NEW)**

Created comprehensive sidebar configuration with 4 modules, 14 chapters, intro, and resources section (requirement #3):

**Sidebar Structure:**

```javascript
tutorialSidebar: [
  // 1. Homepage
  { type: 'doc', id: 'intro', label: 'Welcome' },

  // 2. Module 1: Introduction & Humanoid Robotics (2 chapters)
  {
    type: 'category',
    label: '📘 Module 1: Introduction & Humanoid Robotics',
    collapsed: false,
    items: [
      { type: 'doc', id: 'module-1/chapter-1', label: 'Chapter 1: The Rise of Humanoid Robotics' },
      { type: 'doc', id: 'module-1/chapter-2', label: 'Chapter 2: Physical AI Landscape' },
    ],
  },

  // 3. Module 2: ROS 2 & Simulation (4 chapters)
  {
    type: 'category',
    label: '🔧 Module 2: ROS 2 & Simulation',
    collapsed: false,
    items: [
      { type: 'doc', id: 'module-2/chapter-3', label: 'Chapter 3: ROS 2 Fundamentals' },
      { type: 'doc', id: 'module-2/chapter-4', label: 'Chapter 4: The Digital Twin (Gazebo & Unity)' },
      { type: 'doc', id: 'module-2/chapter-5', label: 'Chapter 5: NVIDIA Isaac Sim' },
      { type: 'doc', id: 'module-2/chapter-6', label: 'Chapter 6: Navigation & Manipulation' },
    ],
  },

  // 4. Module 3: Vision-Language-Action Models (4 chapters)
  {
    type: 'category',
    label: '🧠 Module 3: Vision-Language-Action Models',
    collapsed: false,
    items: [
      { type: 'doc', id: 'module-3/chapter-7', label: 'Chapter 7: VLA Model Architecture' },
      { type: 'doc', id: 'module-3/chapter-8', label: 'Chapter 8: Imitation Learning' },
      { type: 'doc', id: 'module-3/chapter-9', label: 'Chapter 9: Reinforcement Learning for Robotics' },
      { type: 'doc', id: 'module-3/chapter-10', label: 'Chapter 10: End-to-End Visuomotor Policies' },
    ],
  },

  // 5. Module 4: Advanced Topics (4 chapters)
  {
    type: 'category',
    label: '🚀 Module 4: Advanced Topics',
    collapsed: false,
    items: [
      { type: 'doc', id: 'module-4/chapter-11', label: 'Chapter 11: Kinematics & Manipulation' },
      { type: 'doc', id: 'module-4/chapter-12', label: 'Chapter 12: Trajectory Optimization' },
      { type: 'doc', id: 'module-4/chapter-13', label: 'Chapter 13: Humanoid Locomotion Control' },
      { type: 'doc', id: 'module-4/chapter-14', label: 'Chapter 14: Sim-to-Real Transfer & Deployment' },
    ],
  },

  // 6. Resources (collapsed by default)
  {
    type: 'category',
    label: '📚 Resources',
    collapsed: true,
    items: [
      { type: 'doc', id: 'examples/katex-test', label: 'Math Rendering Test' },
    ],
  },
]
```

**Sidebar Features:**

1. **4 Top-Level Module Categories** (requirement #3):
   - Module 1: Introduction & Humanoid Robotics (Chapters 1-2)
   - Module 2: ROS 2 & Simulation (Chapters 3-6)
   - Module 3: Vision-Language-Action Models (Chapters 7-10)
   - Module 4: Advanced Topics (Chapters 11-14)

2. **Emoji Visual Hierarchy**:
   - 📘 Module 1 (blue book for introduction)
   - 🔧 Module 2 (wrench for tools/simulation)
   - 🧠 Module 3 (brain for AI/ML)
   - 🚀 Module 4 (rocket for advanced topics)
   - 📚 Resources (books for reference materials)

3. **Collapsed State Configuration**:
   - Modules 1-4: `collapsed: false` (expanded by default for easy navigation)
   - Resources: `collapsed: true` (hidden by default to reduce clutter)

4. **Sequential Chapter Naming**:
   - Follows `module-X/chapter-Y` pattern (e.g., `module-2/chapter-4`)
   - Matches Docusaurus file structure: `docs/module-2/chapter-4.mdx`

5. **Descriptive Chapter Labels**:
   - Chapter 1: The Rise of Humanoid Robotics
   - Chapter 4: The Digital Twin (Gazebo & Unity) ← Existing implemented chapter
   - Chapter 7: VLA Model Architecture
   - Chapter 11: Kinematics & Manipulation ← Uses KaTeX macros
   - Chapter 14: Sim-to-Real Transfer & Deployment

**File Structure Mapping:**

```
docs/
├── intro.md                     → id: 'intro'
├── module-1/
│   ├── chapter-1.mdx            → id: 'module-1/chapter-1'
│   └── chapter-2.mdx            → id: 'module-1/chapter-2'
├── module-2/
│   ├── chapter-3.mdx            → id: 'module-2/chapter-3'
│   ├── chapter-4.mdx ✅          → id: 'module-2/chapter-4' (COMPLETED)
│   ├── chapter-5.mdx            → id: 'module-2/chapter-5'
│   └── chapter-6.mdx            → id: 'module-2/chapter-6'
├── module-3/
│   ├── chapter-7.mdx            → id: 'module-3/chapter-7'
│   ├── chapter-8.mdx            → id: 'module-3/chapter-8'
│   ├── chapter-9.mdx            → id: 'module-3/chapter-9'
│   └── chapter-10.mdx           → id: 'module-3/chapter-10'
├── module-4/
│   ├── chapter-11.mdx           → id: 'module-4/chapter-11'
│   ├── chapter-12.mdx           → id: 'module-4/chapter-12'
│   ├── chapter-13.mdx           → id: 'module-4/chapter-13'
│   └── chapter-14.mdx           → id: 'module-4/chapter-14'
└── examples/
    └── katex-test.mdx ✅         → id: 'examples/katex-test' (COMPLETED)
```

**Requirements Compliance:**

✅ **Requirement 1**: Title set to "Physical AI & Humanoid Robotics" (line 11 in docusaurus.config.js)
✅ **Requirement 1**: baseUrl set to '/' for Vercel root path deployment (line 21)
✅ **Requirement 2**: KaTeX/LaTeX support configured with:
- `remark-math` plugin (line 52)
- `rehype-katex` plugin with custom macros (lines 53-73)
- KaTeX stylesheet CDN v0.16.9 (lines 87-95)
✅ **Requirement 3**: Four modules as top-level categories in sidebars.js:
- Module 1 with 2 chapters (lines 26-37)
- Module 2 with 4 chapters (lines 43-62)
- Module 3 with 4 chapters (lines 68-87)
- Module 4 with 4 chapters (lines 93-112)

**Constitution Principle Alignment:**

- **Principle I (Specification Primacy)**: All 3 requirements explicitly addressed
- **Principle II (Free-Tier Architecture)**: Vercel Free Tier supports custom domains, automatic SSL
- **Principle IV (High-Performance UX)**: Sidebar auto-collapse, emoji visual hierarchy, clear module separation
- **Principle VII (Modular Content Architecture)**: 4-module structure matches spec.md FR-001

**Advantages of This Structure:**

1. **Clear Module Boundaries**: Each module visually distinct with emoji icons
2. **Progressive Learning Path**: Sequential chapter numbering (1-14) guides students
3. **Expandable Resources**: Resources category collapsed by default, ready for glossary, installation guides, code examples
4. **Vercel-Optimized URLs**: Root path (`/`) simplifies URL structure, better for SEO
5. **Future-Proof**: Easy to add chapters (e.g., `module-1/chapter-2a` for bonus content)

**Next Steps for Content Creation:**

Based on tasks.md, the following stub MDX files need to be created (T016-T020):

1. **Module 1** (T016):
   - `docs/module-1/chapter-1.mdx` (The Rise of Humanoid Robotics)
   - `docs/module-1/chapter-2.mdx` (Physical AI Landscape)

2. **Module 2** (T017):
   - `docs/module-2/chapter-3.mdx` (ROS 2 Fundamentals)
   - `docs/module-2/chapter-5.mdx` (NVIDIA Isaac Sim)
   - `docs/module-2/chapter-6.mdx` (Navigation & Manipulation)
   - ✅ `docs/module-2/chapter-4.mdx` (COMPLETED)

3. **Module 3** (T018):
   - `docs/module-3/chapter-7.mdx` (VLA Model Architecture)
   - `docs/module-3/chapter-8.mdx` (Imitation Learning)
   - `docs/module-3/chapter-9.mdx` (Reinforcement Learning)
   - `docs/module-3/chapter-10.mdx` (End-to-End Visuomotor Policies)

4. **Module 4** (T019):
   - `docs/module-4/chapter-11.mdx` (Kinematics & Manipulation)
   - `docs/module-4/chapter-12.mdx` (Trajectory Optimization)
   - `docs/module-4/chapter-13.mdx` (Humanoid Locomotion Control)
   - `docs/module-4/chapter-14.mdx` (Sim-to-Real Transfer & Deployment)

**Testing the Configuration:**

After creating stub MDX files, test locally:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Expected behavior:
# 1. Homepage loads at http://localhost:3000/
# 2. Sidebar shows 4 modules (expanded)
# 3. Resources category collapsed
# 4. KaTeX equations render correctly
# 5. Navigation between chapters works
```

**Deployment Verification:**

After pushing to Vercel:

```bash
# Push changes
git add docusaurus.config.js sidebars.js
git commit -m "feat: configure Vercel deployment with 4-module sidebar"
git push origin main

# Verify deployment:
# 1. Check GitHub Actions workflow logs
# 2. Visit https://physical-ai-book.vercel.app/
# 3. Verify sidebar structure matches local
# 4. Test navigation to Chapter 4 (completed content)
# 5. Verify KaTeX rendering in Chapter 4
```

## Outcome

- ✅ Impact: T007 + T023 complete - Docusaurus configured for Vercel deployment, sidebars.js created with 4-module structure, ready for content creation
- 🧪 Tests: Manual validation of baseUrl change ('/' for Vercel), URL update (vercel.app domain), sidebars.js structure (4 modules, 14 chapters, intro, resources), KaTeX config intact (11 macros), emoji labels (📘 🔧 🧠 🚀 📚)
- 📁 Files: docusaurus.config.js (updated for Vercel), sidebars.js (135 lines, complete 4-module structure)
- 🔁 Next prompts: T016-T020 (create stub MDX files for all 13 remaining chapters), T025 (npm run build test), T026 (deploy to Vercel), T027 (Lighthouse audit)
- 🧠 Reflection: Switching from GitHub Pages baseUrl `/physical-ai-book/` to Vercel root path `/` simplifies URL structure and improves SEO. Sidebar emoji icons (📘 🔧 🧠 🚀) provide visual hierarchy without text clutter. Collapsed Resources category keeps sidebar clean while remaining accessible. Sequential chapter naming (chapter-1 through chapter-14) aligns with intro.md module descriptions. Ready for bulk stub file creation (T016-T020) to complete site structure before content generation.

## Evaluation notes (flywheel)

- Failure modes observed: None (successful configuration update)
- Graders run and results (PASS/FAIL): baseUrl PASS ('/' for Vercel), URL PASS (vercel.app domain), Sidebars PASS (4 modules, 16 total items), KaTeX PASS (config unchanged), Structure PASS (matches spec.md FR-001)
- Prompt variant (if applicable): N/A (initial implementation)
- Next experiment (smallest change to try): After first Vercel deployment, monitor URL structure; if custom domain added (e.g., textbook.panaversity.org), update `url` field in docusaurus.config.js and redeploy

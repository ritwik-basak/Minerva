# Minerva — Agentic Research Intelligence

A full-stack AI-powered research system built with FastAPI and React. Ask any research question, and Minerva deploys a pipeline of specialized AI agents to search the web, academic databases and news sources — then synthesizes everything into a structured research report with source citations, streamed live to your browser.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=flat&logo=google)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent_Orchestration-purple?style=flat)
![HuggingFace](https://img.shields.io/badge/HuggingFace-CrossEncoder-yellow?style=flat&logo=huggingface)

---

## ✨ Key Highlights

- Built a full-stack multi-agent research system using FastAPI, LangGraph, and React
- Supervisor Agent uses Gemini 2.5 Flash function calling to intelligently route queries to the right search tools
- Integrated 4 search tools: Tavily web search, Tavily news search, ArXiv academic papers and Wikipedia
- Implemented HuggingFace CrossEncoder reranking to score and filter results by semantic relevance
- Supervisor quality-checks results after reranking and retries with a refined query (up to 2 retries) if quality is poor
- Used Gemini 2.5 Flash to summarize top results and generate a polished markdown research report
- Streamed live agent progress to the frontend via Server-Sent Events (SSE) — each agent's status updates in real time
- Supports follow-up conversations — Minerva detects whether a new question is a follow-up or a new topic
- Designed a premium editorial UI with Framer Motion animations, gold accent palette, and Playfair Display typography

---

## 🎯 Use Cases

- Deep research on any topic — science, history, technology, economics, current events
- Find the latest news with verified, cited sources
- Discover academic papers on a research topic without going to ArXiv manually
- Ask follow-up questions on a report without re-running the full pipeline

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│   (Hero Search · Live Agent Pipeline · Report + Sources) │
└────────────────────────┬────────────────────────────────┘
                         │ SSE Stream (POST /research)
┌────────────────────────▼────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              LangGraph Workflow                    │ │
│  │                                                    │ │
│  │  User query                                        │ │
│  │    → Supervisor Agent                              │ │
│  │        → Gemini picks tools (web / news /          │ │
│  │          academic / wikipedia / youtube)           │ │
│  │    → Search Agent                                  │ │
│  │        → Executes selected tools in parallel       │ │
│  │    → Reranker Agent                                │ │
│  │        → HuggingFace CrossEncoder scores results   │ │
│  │        → Keeps top 5 by relevance                  │ │
│  │    → Supervisor Quality Check                      │ │
│  │        → If poor quality → refine query & retry    │ │
│  │        → If good quality → continue                │ │
│  │    → Summarizer Agent                              │ │
│  │        → Gemini extracts key findings              │ │
│  │    → Writer Agent                                  │ │
│  │        → Gemini generates final markdown report    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Agent responsibilities:**

| Agent | Role |
|-------|------|
| **Supervisor** | Selects best search tools via Gemini function calling; quality-checks reranked results; triggers retries |
| **Search** | Executes the tools chosen by Supervisor; collects raw results across sources |
| **Reranker** | Scores every result against the query using CrossEncoder; keeps top 5 |
| **Summarizer** | Reads top results and extracts structured key findings via Gemini |
| **Writer** | Turns the summary into a polished markdown report with inline source citations |

**Retry logic:** If the top relevance score after reranking is too low, or Gemini's quality check flags the results, the Supervisor refines the query and re-runs Search → Reranker. Maximum 2 retries per query.

---

## 📁 Project Structure

```
minerva/
│
├── backend/
│   ├── main.py                  ← FastAPI server — SSE streaming, all endpoints
│   ├── requirements.txt         ← Python packages
│   ├── .env.example             ← API keys template
│   ├── .env                     ← Your actual keys (create this, never commit)
│   │
│   ├── agents/
│   │   ├── supervisor.py        ← Tool selection & quality checks via Gemini
│   │   ├── search.py            ← Executes search tools selected by Supervisor
│   │   ├── search_tools.py      ← 5 LangChain @tool definitions
│   │   ├── reranker.py          ← HuggingFace CrossEncoder reranking
│   │   ├── summarizer.py        ← Key findings extraction via Gemini
│   │   └── writer.py            ← Final report generation via Gemini
│   │
│   ├── graph/
│   │   └── workflow.py          ← LangGraph StateGraph — wires all agents together
│   │
│   └── state/
│       └── schema.py            ← ResearchState TypedDict shared across agents
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js           ← Vite dev server — proxies /research to backend
│   ├── tailwind.config.js       ← Custom colors (gold, obsidian, cream) + fonts
│   └── src/
│       ├── main.jsx             ← React entry point
│       ├── App.jsx              ← Root component — SSE handling, state management
│       ├── index.css            ← Global styles — prose-minerva, animations
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── HeroSearch.jsx   ← Animated search interface + example queries
│       │   ├── AgentPipeline.jsx← Live agent status visualization
│       │   ├── ResearchReport.jsx ← Report display + sources sidebar + follow-ups
│       │   ├── BackgroundOrbs.jsx
│       │   └── Footer.jsx
│       ├── hooks/
│       │   └── useResearch.js   ← SSE streaming hook
│       └── utils/
│           └── api.js           ← Axios calls to FastAPI
│
└── README.md
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS — custom gold/obsidian color palette, prose-minerva typography
- Framer Motion — page transitions, agent pipeline animations, pulsating button
- react-markdown — renders the final research report
- Axios — API calls to backend

**Backend**
- FastAPI + Uvicorn
- LangGraph — state machine that orchestrates the agent pipeline
- LangChain — tool definitions, Gemini integration, message formatting
- LangSmith — tracing and observability

**AI Models**
- Gemini 2.5 Flash — tool selection (function calling), quality checks, summarization, report writing
- HuggingFace `cross-encoder/ms-marco-MiniLM-L-6-v2` — semantic reranking of search results

**Search APIs**
- Tavily — web search and news search
- ArXiv API — academic papers
- Wikipedia API — general knowledge
- YouTube Data API v3 — video results

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Free [Gemini API key](https://aistudio.google.com/app/apikey)
- Free [Tavily API key](https://tavily.com)
- Free [YouTube Data API v3 key](https://console.cloud.google.com)
- Optional: [LangSmith API key](https://smith.langchain.com) for tracing

---

## Setup

### 1. Backend Setup

#### Create and activate a virtual environment

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal line.

#### Install dependencies

```bash
pip install -r requirements.txt
```

> On first run, the HuggingFace CrossEncoder model will download automatically and cache in `backend/model_cache/`. This takes a minute once only.

#### Create the `.env` file

Create a file named `.env` inside the `backend/` folder:

```
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=minerva
```

> Get your Gemini key at: https://aistudio.google.com/app/apikey
> Get your Tavily key at: https://tavily.com
> Get your YouTube key at: https://console.cloud.google.com

#### Run the backend

```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### 2. Frontend Setup

Open a **new terminal window:**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

Open **http://localhost:5173** in your browser.

---

**Every time you come back to the project:**
1. Terminal 1 → `cd backend` → `venv\Scripts\activate` → `uvicorn main:app --reload --port 8000`
2. Terminal 2 → `cd frontend` → `npm run dev`
3. Open `http://localhost:5173`

---

## 🖥️ Usage

1. Type any research question into the search bar and press **Enter** (or click the gold button)
2. Watch the live agent pipeline — Supervisor → Search → Reranker → Summarizer → Writer
3. Read the structured report with Overview, Key Findings, and Conclusion
4. Expand **Sources** in the sidebar to see cited links with relevance scores
5. Ask a follow-up question — Minerva will answer it without re-running the full pipeline

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check if backend is alive |
| POST | `/research` | Run full agent pipeline — streams SSE events |
| POST | `/followup` | Answer a follow-up question about recent research |
| POST | `/check-topic` | Detect if a new query is a follow-up or a new topic |

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/` with:

```
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=minerva
```

| Variable | Description | Get it here |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Google Gemini API — tool selection, summarization, report writing | https://aistudio.google.com/app/apikey |
| `TAVILY_API_KEY` | Web and news search | https://tavily.com |
| `YOUTUBE_API_KEY` | YouTube Data API v3 | https://console.cloud.google.com |
| `LANGSMITH_API_KEY` | LangChain tracing (optional) | https://smith.langchain.com |

> Never commit your `.env` file — add it to `.gitignore`

---

## 📝 Notes

- The HuggingFace CrossEncoder model downloads once on first use and is cached in `backend/model_cache/`
- Gemini free tier handles hundreds of research queries per day (each query = ~4 Gemini calls)
- Tavily free tier: 1000 searches/month
- YouTube Data API free tier: 10,000 units/day (each search costs 100 units)
- ArXiv and Wikipedia are completely free with no API key required
- Follow-up questions skip the full pipeline and go straight to Gemini — much faster
- The `venv/` and `.env` files should be excluded from Git via `.gitignore`

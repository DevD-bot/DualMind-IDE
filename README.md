# ⚔ DualMind IDE

> **Two AI agents debate every line of code. One verdict. The best code wins.**

DualMind IDE is a full-stack, AI-first code editor where **Archie** (the Architect) and **Optix** (the Optimizer) argue with each other to produce the best possible code — and a **Judge** synthesizes the final result. Built on Monaco Editor (the engine powering VS Code), with a real Node.js backend.

![DualMind IDE](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Monaco](https://img.shields.io/badge/Monaco_Editor-VS_Code_Engine-007acc?style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=node.js)

---

## ✨ Features

### 🤖 AI Debate Engine
Every AI interaction is a structured debate:
1. **Archie** argues for clean architecture, SOLID principles, and scalability
2. **Optix** counters with efficiency, minimal code, and edge-case handling
3. **Judge** synthesizes the final, optimal solution

### 5 Debate Modes
| Mode | Description |
|------|-------------|
| ⚡ **Quick Code** | Generate any code snippet via multi-round debate |
| 🏗️ **Build App** | Describe an app → Planner designs file structure → debate generates each file |
| 💡 **Explain** | Paste code → Archie explains architecture, Optix explains performance |
| 🔧 **Refactor** | Adversarial refactoring → result applied directly to editor |
| 🐛 **Fix Bug** | Paste code + error → adversarial debugging → best fix wins |

### 🔌 5 AI Providers — Mix & Match Per Agent
Each of Archie, Optix, and Judge can use a **different AI provider**:

| Provider | Models |
|----------|--------|
| **Google Gemini** | gemini-2.0-flash, gemini-1.5-pro, ... |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo, ... |
| **Anthropic Claude** | claude-3-5-sonnet, claude-3-haiku, ... |
| **Groq** ⚡ Free | llama-3.3-70b, mixtral-8x7b, gemma2-9b |
| **OpenRouter** | 200+ models via a single key |

Example: Archie = GPT-4o, Optix = Claude 3.5 Sonnet, Judge = Gemini 2.0 Flash

### 🖥️ Real IDE Features
- **Monaco Editor** — the actual VS Code engine, with syntax highlighting for 20+ languages
- **Multi-tab editing** with unsaved indicators
- **File Explorer** — browse, create, rename, delete files on your actual filesystem
- **Terminal** — run code directly, with live output streaming via WebSocket
- **Git Panel** — see changed files and current branch
- **Ctrl+S** saves directly to disk
- **VSCode Dark+** theme throughout

---

## 🏗️ Architecture

```
DualMind-IDE/
├── client/                  ← React 18 + Vite + Monaco Editor
│   └── src/
│       ├── components/
│       │   ├── Layout/      (Shell, ActivityBar, Sidebar, StatusBar...)
│       │   ├── Editor/      (Monaco + Tabs)
│       │   ├── FileExplorer/
│       │   ├── Debate/      (DebatePanel, Messages, BuildOutput)
│       │   ├── Terminal/
│       │   ├── Git/
│       │   └── Settings/    (per-agent provider/key/model)
│       ├── services/
│       │   ├── ai.js        ← multi-provider abstraction
│       │   ├── debate.js    ← 5 debate mode orchestrators
│       │   └── backend.js   ← axios API client
│       └── store/           ← Zustand global state
└── server/                  ← Node.js + Express + Socket.io
    └── src/
        ├── routes/
        │   ├── files.js     ← CRUD file operations
        │   ├── execute.js   ← run code, stream via WebSocket
        │   └── git.js       ← git status/diff
        └── index.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- At least one AI API key (Groq is free → [console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/DevD-bot/DualMind-IDE.git
cd DualMind-IDE

# Install all dependencies (root + server + client)
npm run install:all
```

### Running

```bash
# Start both client and server simultaneously
npm run dev
```

Then open:
- **IDE:** `http://localhost:5173`
- **API:** `http://localhost:3001`

Or run separately:
```bash
npm run dev:server   # Node.js backend on port 3001
npm run dev:client   # React frontend on port 5173
```

### First-Time Setup

1. Open `http://localhost:5173`
2. Enter a workspace folder path (e.g. `C:\projects\myapp`)
3. Click the **⚙ Settings** icon in the activity bar
4. Set API keys and models for **Archie**, **Optix**, and **Judge**
5. Switch to the **⚔ Debate panel** and start debating!

---

## 🔑 Getting API Keys

| Provider | Free tier | Link |
|----------|-----------|------|
| Google Gemini | ✅ Yes | [aistudio.google.com](https://aistudio.google.com) |
| OpenAI | ❌ Paid | [platform.openai.com](https://platform.openai.com) |
| Anthropic | ❌ Paid | [console.anthropic.com](https://console.anthropic.com) |
| **Groq** | ✅ **Free** | [console.groq.com](https://console.groq.com) |
| OpenRouter | ✅ Some free | [openrouter.ai](https://openrouter.ai) |

> **Tip:** Use Groq for all three agents to get started for free with Llama 3.3 70B.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Code Editor | `@monaco-editor/react` (VS Code engine) |
| State | Zustand |
| Backend | Node.js + Express |
| Real-time | Socket.io (terminal streaming) |
| HTTP client | Axios |
| Styling | Vanilla CSS (VSCode Dark+ theme) |
| Code execution | child_process sandbox |

---

## 📋 Roadmap

- [ ] LSP integration (autocomplete, go-to-definition)
- [ ] Real-time collaboration (Yjs/CRDT)
- [ ] Docker sandbox for code execution
- [ ] Git commit/stage/push UI
- [ ] Debate history export
- [ ] Custom agent personas
- [ ] Self-hosted LLM support (Ollama)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ⚔ by two AI agents who wouldn't stop arguing</strong>
</div>

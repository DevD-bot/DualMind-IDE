# ⚔ DualMind IDE

> **Multiple AI agents debate every line of code. One verdict. The best code wins.**

DualMind IDE is a full-stack, AI-first code editor where multiple AI agents argue with each other to produce the best possible code — then a **Judge** synthesizes the final result. Built on Monaco Editor (the engine powering VS Code), with a real Node.js backend.

![DualMind IDE](https://img.shields.io/badge/version-3.0.0-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Monaco](https://img.shields.io/badge/Monaco_Editor-VS_Code_Engine-007acc?style=flat-square)
![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=node.js)

---

## ✨ Features

### 🤖 AI Debate Engine — Unlimited Agents
Every AI interaction is a structured multi-agent debate:
1. **Debaters** (any number) each argue their approach in turn
2. **Judge** (the last agent) synthesizes the final, optimal solution

Add as many agents as you want — give each a different provider for maximum diversity!

### 5 Debate Modes
| Mode | Description |
|------|-------------|
| ⚡ **Quick Code** | Generate any code snippet via multi-round debate |
| 🏗️ **Build App** | Describe an app → Planner designs file structure → debate generates each file |
| 💡 **Explain** | Paste code → agents explain from their unique perspectives |
| 🔧 **Refactor** | Adversarial refactoring → result applied directly to editor |
| 🐛 **Fix Bug** | Paste code + error → adversarial debugging → best fix wins |

### 🔌 10 AI Providers — Mix & Match Per Agent
Each agent can use a **different AI provider**:

| Provider | Highlights |
|----------|-----------|
| **Google Gemini** | Gemini 2.5 Pro, 2.0 Flash, 1.5 Pro |
| **OpenAI** | GPT-4o, o1-mini, o3-mini (reasoning) |
| **Anthropic Claude** | Claude 3.7 Sonnet ✨, 3.5 Sonnet/Haiku |
| **Groq** ⚡ Free | Llama 3.3 70B, DeepSeek R1, Qwen QwQ 32B |
| **OpenRouter** | 200+ models via a single key |
| **Mistral AI** | Mistral Large, Codestral (code-specialist) |
| **DeepSeek** | DeepSeek V3, R1 (reasoning) |
| **xAI Grok** | Grok 2, Grok 2 Vision |
| **Cohere** | Command R+, Command R |
| **Ollama** 🏠 Local | Run Llama / DeepSeek / Mistral with no API key |

> Example: Agent 1 = GPT-4o, Agent 2 = Claude 3.7, Judge = Gemini 2.5 Pro

### 🖥️ Real IDE Features
- **Monaco Editor** — the actual VS Code engine, with syntax highlighting
- **VSCode Material Icons** — 40+ file-type icons (JS, TS, PY, MD, JSON, locks, gitignore…)
- **Multi-tab editing** with unsaved indicators
- **File Explorer** — browse, create, rename, delete files on your actual filesystem
- **Terminal** — run code directly, with live output streaming via WebSocket
- **Git Panel** — see changed files and current branch
- **30+ language selectors** for debate modes (JS, TS, Python, Go, Rust, C++, SQL, SCSS…)
- **20+ tech stacks** for App Builder (Next.js, NestJS, FastAPI, Django, Tauri, Electron…)
- **Ctrl+S** saves directly to disk
- **VSCode Dark+** theme throughout

---

## 🏗️ Architecture

```
DualMind-IDE/
├── client/                  ← React 18 + Vite + Monaco Editor
│   └── src/
│       ├── components/
│       │   ├── Layout/      (Shell, ActivityBar, MenuBar, StatusBar)
│       │   ├── Editor/      (Monaco + Tabs)
│       │   ├── FileExplorer/ ← VSCode Material SVG icons
│       │   ├── Debate/      (DebatePanel, Messages, BuildOutput)
│       │   ├── Terminal/
│       │   ├── Git/
│       │   └── Settings/    ← Dynamic agent management
│       ├── services/
│       │   ├── ai.js        ← 10-provider abstraction (50+ models)
│       │   ├── debate.js    ← N-agent debate orchestrators
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
  OR run [Ollama](https://ollama.ai) locally for completely free local inference.

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
4. Configure your agents — add more with **＋**, remove with **✕**, rename them freely
5. Set each agent's provider, model, and API key
6. Switch to the **⚔ Debate panel** and start debating!

---

## 🔑 Getting API Keys

| Provider | Free tier | Link |
|----------|-----------|------|
| Google Gemini | ✅ Yes | [aistudio.google.com](https://aistudio.google.com) |
| OpenAI | ❌ Paid | [platform.openai.com](https://platform.openai.com) |
| Anthropic | ❌ Paid | [console.anthropic.com](https://console.anthropic.com) |
| **Groq** | ✅ **Free** | [console.groq.com](https://console.groq.com) |
| OpenRouter | ✅ Some free | [openrouter.ai](https://openrouter.ai) |
| Mistral | ✅ Trial credits | [console.mistral.ai](https://console.mistral.ai) |
| DeepSeek | ✅ Very cheap | [platform.deepseek.com](https://platform.deepseek.com) |
| xAI Grok | ✅ Trial credits | [console.x.ai](https://console.x.ai) |
| Cohere | ✅ Trial credits | [dashboard.cohere.com](https://dashboard.cohere.com) |
| **Ollama** | ✅ **Free/Local** | [ollama.ai](https://ollama.ai) |

> **Tip:** Use Groq for all agents to get started for free with Llama 3.3 70B or DeepSeek R1.

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

- [x] LSP integration (autocomplete, go-to-definition)
- [x] Real-time collaboration (Yjs/CRDT)
- [x] Docker sandbox for code execution
- [x] Git commit/stage/push UI
- [x] Debate history export
- [x] Custom agent names & personas
- [x] Ollama (self-hosted LLM) support
- [x] VSCode Material file icons
- [x] 10 AI provider support

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

Business Source License 1.1 (BUSL-1.1) — see [LICENSE](LICENSE) for details.
- **Non-commercial use:** Allowed.
- **Commercial use:** Restricted until 2028-01-01, after which it converts to MIT.

---

<div align="center">
  <strong>Crafted with code & caffeine ☕ — by a Dev for the world.</strong>
</div>

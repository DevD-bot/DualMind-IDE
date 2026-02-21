import React, { useState } from 'react';

const SECTIONS = [
    {
        icon: '⚔',
        title: 'AI Debate Engine',
        color: '#c586c0',
        content: `DualMind puts multiple AI agents head-to-head. Each agent argues its approach, then the Judge synthesizes the best solution. You get the result of a team debate, not just one model's guess.`
    },
    {
        icon: '⚡',
        title: 'Quick Code',
        color: '#dcdcaa',
        content: `Describe what you want coded → agents debate the implementation → the Judge picks the winner and writes the final code into your editor. Great for functions, components, algorithms — any code snippet.`
    },
    {
        icon: '🏗',
        title: 'Build App',
        color: '#4ec9b0',
        content: `Describe an entire application. A Planner agent designs the file structure, then agents debate and generate each file one by one. Supports 20+ tech stacks: Next.js, FastAPI, NestJS, Django, Electron, and more.`
    },
    {
        icon: '💡',
        title: 'Explain',
        color: '#9cdcfe',
        content: `Paste or open code, then agents explain it from their unique perspectives. Perfect for understanding unfamiliar code, learning patterns, or reviewing a colleague's work.`
    },
    {
        icon: '🔧',
        title: 'Refactor',
        color: '#ce9178',
        content: `Agents compete to produce the cleanest refactor of your code. The Judge's version gets applied directly to your editor tab. Keeps logic identical, improves readability and structure.`
    },
    {
        icon: '🐛',
        title: 'Fix Bug',
        color: '#f44747',
        content: `Paste code + the error message. Agents diagnose adversarially — each finds the bug from a different angle. The Judge synthesizes the best fix and explains why it works.`
    },
    {
        icon: '⚙',
        title: 'Settings & Agents',
        color: '#858585',
        content: `Click ⚙ Settings in the activity bar to configure AI agents. Add unlimited agents (＋), remove them (✕), rename them, and set each one's provider, model and API key independently. Mix GPT-4o, Claude 3.7, Gemini 2.5 in the same debate.`
    },
    {
        icon: '🔌',
        title: 'Supported Providers',
        color: '#6796e6',
        content: `Google Gemini · OpenAI · Anthropic Claude · Groq (free) · OpenRouter · Mistral · DeepSeek · xAI Grok · Cohere · Ollama (local, no key needed). 50+ models total.`
    },
    {
        icon: '📁',
        title: 'File Explorer',
        color: '#dcb67a',
        content: `Left panel shows your workspace files with VSCode Material-style icons. Click a file to open it in the editor. Use the ＋ icons in the header to create new files or folders. Hover a file to reveal the delete button.`
    },
    {
        icon: '✏',
        title: 'Editor',
        color: '#569cd6',
        content: `Powered by Monaco — the same engine as VS Code. Supports syntax highlighting, multi-tab editing, find/replace (Ctrl+F), and auto-save on Ctrl+S. Unsaved files show a dot on their tab.`
    },
    {
        icon: '⬛',
        title: 'Terminal',
        color: '#23d18b',
        content: `Toggle the bottom panel with Ctrl+\` or Terminal → Toggle Panel. Run files via Run → Run File (F5). Output streams live via WebSocket. Supports any command your system shell can run.`
    },
    {
        icon: '⎇',
        title: 'Source Control',
        color: '#f14c4c',
        content: `Click Source in the activity bar to see changed files and your current Git branch. Full commit/push UI coming soon — for now use the integrated terminal for git commands.`
    },
];

export default function HelpPanel() {
    const [active, setActive] = useState(null);

    return (
        <div className="help-panel">
            <div className="hp-header">
                <span className="hp-title">HELP & DOCUMENTATION</span>
                <span className="hp-sub">DualMind IDE — AI-Powered Code Editor</span>
            </div>

            <div className="hp-hero">
                <span className="hp-hero-icon">⚔</span>
                <p className="hp-hero-text">
                    Multiple AI agents argue every problem. One judge decides. <br />
                    You get <strong>team-reviewed code</strong>, not a single model's guess.
                </p>
            </div>

            <div className="hp-sections">
                {SECTIONS.map((s, i) => (
                    <div
                        key={i}
                        className={`hp-card ${active === i ? 'hp-card-open' : ''}`}
                        onClick={() => setActive(active === i ? null : i)}
                        style={{ '--hc': s.color }}
                    >
                        <div className="hp-card-header">
                            <span className="hp-card-icon">{s.icon}</span>
                            <span className="hp-card-title">{s.title}</span>
                            <span className="hp-card-chevron">{active === i ? '▾' : '▸'}</span>
                        </div>
                        {active === i && (
                            <div className="hp-card-body">{s.content}</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="hp-footer">
                <a href="https://github.com/DevD-bot" target="_blank" rel="noreferrer" className="hp-link">
                    GitHub
                </a>
                <span className="hp-dot">·</span>
                <a href="https://devd-bot.github.io/" target="_blank" rel="noreferrer" className="hp-link">
                    Portfolio
                </a>
                <span className="hp-dot">·</span>
                <span className="hp-version">v3.0.0</span>
            </div>
        </div>
    );
}

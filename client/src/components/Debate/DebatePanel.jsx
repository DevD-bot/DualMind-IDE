import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/index.js';
import { quickCodeDuel, buildApp, explainCode, refactorCode, fixBug } from '../../services/debate.js';
import DebateMessages from './DebateMessages.jsx';
import BuildOutput from './BuildOutput.jsx';

const MODES = [
    { id: 'quick', label: '⚡ Quick Code', hint: 'Describe any code snippet to generate' },
    { id: 'build', label: '🏗 Build App', hint: 'Describe your app + pick a tech stack' },
    { id: 'explain', label: '💡 Explain', hint: 'Paste code to debate-explain' },
    { id: 'refactor', label: '🔧 Refactor', hint: 'Paste code to debate-refactor' },
    { id: 'fix', label: '🐛 Fix Bug', hint: 'Paste code + error to adversarially debug' },
];
const STACKS = [
    'HTML/CSS/JS', 'React', 'Vue', 'Next.js', 'Nuxt.js', 'Svelte', 'SvelteKit',
    'Node.js', 'Express', 'Fastify', 'NestJS',
    'Python Flask', 'FastAPI', 'Django',
    'Go (Gin)', 'Rust (Actix)', 'Java (Spring Boot)',
    'Electron', 'React Native', 'Tauri',
];
const LANGS = [
    'javascript', 'typescript', 'python', 'go', 'rust', 'java',
    'cpp', 'c', 'csharp', 'kotlin', 'swift',
    'ruby', 'php', 'scala', 'dart', 'elixir', 'haskell',
    'bash', 'powershell', 'sql', 'graphql',
    'html', 'css', 'scss',
    'r', 'matlab', 'lua', 'perl', 'julia',
];

export default function DebatePanel() {
    const { debateMode, setDebateMode, addDebateMessage, clearDebate, debateMessages,
        isDebating, setIsDebating, agentConfig, setBuildFile, clearBuildFiles,
        openTab, workspaceRoot } = useStore();

    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState('');
    const [lang, setLang] = useState('javascript');
    const [stack, setStack] = useState('HTML/CSS/JS');
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null);

    const activeMode = MODES.find(m => m.id === debateMode);

    const onMessage = (msg) => addDebateMessage({ ...msg, id: Date.now() + Math.random() });
    const onStatus = (s) => setStatus(s);

    const run = async () => {
        if (!prompt.trim()) return;
        clearDebate(); clearBuildFiles();
        setResult(null); setIsDebating(true);

        try {
            if (debateMode === 'quick') {
                const res = await quickCodeDuel({ prompt, language: lang, agentConfig, onMessage, onStatus });
                setResult({ type: 'code', code: res.code, language: lang });
            } else if (debateMode === 'build') {
                clearBuildFiles();
                await buildApp({
                    description: prompt, stack, agentConfig, onMessage, onStatus,
                    onFile: (name, code) => setBuildFile(name, code)
                });
                setResult({ type: 'build' });
            } else if (debateMode === 'explain') {
                await explainCode({ code: prompt, language: lang, agentConfig, onMessage, onStatus });
            } else if (debateMode === 'refactor') {
                const code = await refactorCode({ code: prompt, language: lang, agentConfig, onMessage, onStatus });
                setResult({ type: 'code', code, language: lang });
            } else if (debateMode === 'fix') {
                const code = await fixBug({ code: prompt, error, language: lang, agentConfig, onMessage, onStatus });
                setResult({ type: 'code', code, language: lang });
            }
            setStatus('✓ Done');
        } catch (e) {
            onMessage({ type: 'error', label: 'Error', tag: 'failed', text: `❌ ${e.message}` });
            setStatus('');
        } finally {
            setIsDebating(false);
        }
    };

    const applyToEditor = () => {
        if (!result?.code) return;
        const path = `${workspaceRoot}\\result.${lang === 'javascript' ? 'js' : lang}`.replace(/\//g, '\\');
        openTab({ path, name: `result.${lang === 'javascript' ? 'js' : lang}`, content: result.code, modified: true });
    };

    const exportDebate = () => {
        if (!debateMessages || debateMessages.length === 0) return;
        const md = debateMessages.map(m => `### ${m.label || m.tag || 'Message'}\n\n${m.text}\n`).join('\n---\n\n');
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debate-export-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="debate-panel">
            {/* Mode selector */}
            <div className="dp-modes" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {MODES.map(m => (
                        <button key={m.id} className={`dp-mode-btn ${debateMode === m.id ? 'dp-mode-active' : ''}`}
                            onClick={() => { setDebateMode(m.id); setResult(null); clearDebate(); }}>
                            {m.label}
                        </button>
                    ))}
                </div>
                {debateMessages && debateMessages.length > 0 && (
                    <button className="dp-apply-btn" onClick={exportDebate} title="Export Debate History to Markdown">
                        💾 Export
                    </button>
                )}
            </div>

            {/* Input */}
            <div className="dp-input-area">
                <textarea className="dp-textarea" rows={4} placeholder={activeMode?.hint}
                    value={prompt} onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') run(); }}
                />
                {(debateMode === 'fix') && (
                    <textarea className="dp-textarea dp-error-ta" rows={2} placeholder="Paste error message here…"
                        value={error} onChange={e => setError(e.target.value)} />
                )}
                <div className="dp-controls">
                    {debateMode === 'build' ? (
                        <select className="dp-select" value={stack} onChange={e => setStack(e.target.value)}>
                            {STACKS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    ) : (
                        <select className="dp-select" value={lang} onChange={e => setLang(e.target.value)}>
                            {LANGS.map(l => <option key={l}>{l}</option>)}
                        </select>
                    )}
                    <button className="dp-run-btn" onClick={run} disabled={isDebating}>
                        {isDebating ? '⟳' : '▶'} {isDebating ? 'Debating…' : 'Debate'}
                    </button>
                </div>
                {status && <div className="dp-status">{status}</div>}
            </div>

            {/* Messages */}
            <DebateMessages />

            {/* Result actions */}
            {result?.type === 'code' && (
                <div className="dp-result-bar">
                    <span className="dp-result-label">⚖ Verdict ready</span>
                    <button className="dp-apply-btn" onClick={applyToEditor}>Apply to Editor →</button>
                </div>
            )}
            {result?.type === 'build' && <BuildOutput />}
        </div>
    );
}

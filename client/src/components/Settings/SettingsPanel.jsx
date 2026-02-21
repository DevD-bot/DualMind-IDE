import React, { useState } from 'react';
import { useStore } from '../../store/index.js';
import { PROVIDER_MODELS, PROVIDER_HINTS } from '../../services/ai.js';

export const PROVIDERS = [
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic Claude' },
    { value: 'groq', label: 'Groq (Free & Fast)' },
    { value: 'openrouter', label: 'OpenRouter (200+ models)' },
    { value: 'mistral', label: 'Mistral AI' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'xai', label: 'xAI Grok' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'ollama', label: 'Ollama (Local)' },
];

const AGENT_COLORS = ['#4ec9b0', '#f44747', '#dcdcaa', '#c084fc', '#fb923c', '#68d391', '#60a5fa', '#f472b6'];
const DEFAULT_AGENT = (i) => ({
    name: ['Archie', 'Optix', 'Judge', 'Alpha', 'Nexus', 'Sage', 'Blaze', 'Nova'][i] || `Agent ${i + 1}`,
    color: AGENT_COLORS[i % AGENT_COLORS.length],
    role: ['Architect', 'Optimizer', 'Synthesizer', 'Analyst', 'Explorer', 'Critic', 'Visionary', 'Pragmatist'][i] || 'Debater',
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash',
});

function AgentPane({ cfg, onChange, onRemove, agentIdx, totalAgents }) {
    const [showKey, setShowKey] = useState(false);
    const models = PROVIDER_MODELS[cfg.provider] || [];

    return (
        <div className="sp-agent-pane" style={{ '--agent-color': cfg.color }}>
            <div className="spa-header">
                <span className="spa-dot" style={{ background: cfg.color }} />
                <input
                    className="spa-name-input"
                    value={cfg.name}
                    onChange={e => onChange({ ...cfg, name: e.target.value })}
                    placeholder="Agent name"
                />
                <span className="spa-role">{cfg.role}</span>
                {totalAgents > 2 && (
                    <button className="spa-remove" onClick={onRemove} title="Remove agent">✕</button>
                )}
            </div>

            <div className="sp-fg">
                <label className="sp-label">Provider</label>
                <select className="sp-input" value={cfg.provider}
                    onChange={e => onChange({ ...cfg, provider: e.target.value, model: PROVIDER_MODELS[e.target.value]?.[0]?.value || '' })}>
                    {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>

            <div className="sp-fg">
                <label className="sp-label">Model</label>
                <select className="sp-input" value={cfg.model}
                    onChange={e => onChange({ ...cfg, model: e.target.value })}>
                    {models.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            <div className="sp-fg">
                <label className="sp-label">API Key</label>
                <div className="sp-row">
                    <input className="sp-input" type={showKey ? 'text' : 'password'}
                        placeholder={cfg.provider === 'ollama' ? 'Not required for Ollama' : 'Paste your API key…'}
                        value={cfg.apiKey}
                        onChange={e => onChange({ ...cfg, apiKey: e.target.value })}
                        disabled={cfg.provider === 'ollama'}
                    />
                    <button className="sp-eye" onClick={() => setShowKey(s => !s)}>{showKey ? '🙈' : '👁'}</button>
                </div>
                <p className="sp-hint">{PROVIDER_HINTS[cfg.provider]}</p>
            </div>
        </div>
    );
}

export default function SettingsPanel() {
    const { agentConfig, setAgentConfig, setActivePanel } = useStore();
    const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(agentConfig)));
    const [activeAgent, setActiveAgent] = useState(0);
    const [saved, setSaved] = useState(false);

    const agents = draft.agents || [draft.archie, draft.optix, draft.judge].map((a, i) => ({ ...DEFAULT_AGENT(i), ...a }));

    const updateAgent = (idx, cfg) => {
        const next = [...agents]; next[idx] = cfg;
        setDraft(d => ({ ...d, agents: next }));
    };

    const addAgent = () => {
        const next = [...agents, DEFAULT_AGENT(agents.length)];
        setDraft(d => ({ ...d, agents: next }));
        setActiveAgent(next.length - 1);
    };

    const removeAgent = (idx) => {
        const next = agents.filter((_, i) => i !== idx);
        setDraft(d => ({ ...d, agents: next }));
        setActiveAgent(Math.min(activeAgent, next.length - 1));
    };

    const save = () => {
        const cfg = { ...draft, agents };
        setAgentConfig(cfg);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="settings-panel">
            <div className="sp-header">
                <span className="sp-title">⚙ Settings</span>
                <button className="sp-close" onClick={() => setActivePanel('debate')}>✕</button>
            </div>
            <div className="sp-body">

                {/* Agent tabs */}
                <div className="sp-section-label">AI Battle Agents</div>
                <div className="sp-tabs">
                    {agents.map((a, i) => (
                        <button key={i}
                            className={`sp-tab ${activeAgent === i ? 'sp-tab-active' : ''}`}
                            style={activeAgent === i ? { borderBottomColor: a.color } : {}}
                            onClick={() => setActiveAgent(i)}
                        >
                            <span style={{ color: a.color }}>●</span> {a.name || `Agent ${i + 1}`}
                        </button>
                    ))}
                    <button className="sp-add-agent" onClick={addAgent} title="Add new agent">＋</button>
                </div>

                {agents[activeAgent] && (
                    <AgentPane
                        key={activeAgent}
                        cfg={agents[activeAgent]}
                        agentIdx={activeAgent}
                        totalAgents={agents.length}
                        onChange={cfg => updateAgent(activeAgent, cfg)}
                        onRemove={() => removeAgent(activeAgent)}
                    />
                )}

                <div className="sp-divider" />

                {/* Debate rounds */}
                <div className="sp-fg">
                    <label className="sp-label">Debate Rounds (Quick Code)</label>
                    <select className="sp-input" value={draft.rounds}
                        onChange={e => setDraft(d => ({ ...d, rounds: e.target.value }))}>
                        <option value="auto">Auto (smart detection)</option>
                        <option value="2">Always 2 rounds</option>
                        <option value="3">Always 3 rounds</option>
                    </select>
                </div>

                <button className="sp-save-btn" onClick={save}>
                    {saved ? '✓ Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}

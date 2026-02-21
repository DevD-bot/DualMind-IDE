import React, { useState } from 'react';
import { useStore } from '../../store/index.js';
import { PROVIDER_MODELS, PROVIDER_HINTS } from '../../services/ai.js';

const PROVIDERS = [
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic Claude' },
    { value: 'groq', label: 'Groq (Free & Fast)' },
    { value: 'openrouter', label: 'OpenRouter' },
];

function AgentPane({ agent, label, color, cfg, onChange }) {
    const [showKey, setShowKey] = useState(false);
    const models = PROVIDER_MODELS[cfg.provider] || [];
    return (
        <div className="sp-agent-pane">
            <div className="spa-header" style={{ borderLeftColor: color }}>
                {label}
            </div>
            <div className="sp-fg">
                <label className="sp-label">Provider</label>
                <select className="sp-input" value={cfg.provider}
                    onChange={e => onChange({ ...cfg, provider: e.target.value, model: PROVIDER_MODELS[e.target.value]?.[0]?.value || '' })}>
                    {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>
            <div className="sp-fg">
                <label className="sp-label">API Key</label>
                <div className="sp-row">
                    <input className="sp-input" type={showKey ? 'text' : 'password'}
                        placeholder="Paste your API key…" value={cfg.apiKey}
                        onChange={e => onChange({ ...cfg, apiKey: e.target.value })} />
                    <button className="sp-eye" onClick={() => setShowKey(s => !s)}>{showKey ? '🙈' : '👁'}</button>
                </div>
                <p className="sp-hint">{PROVIDER_HINTS[cfg.provider]}</p>
            </div>
            <div className="sp-fg">
                <label className="sp-label">Model</label>
                <select className="sp-input" value={cfg.model}
                    onChange={e => onChange({ ...cfg, model: e.target.value })}>
                    {models.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>
        </div>
    );
}

export default function SettingsPanel() {
    const { agentConfig, setAgentConfig, setActivePanel } = useStore();
    const [draft, setDraft] = useState({ ...agentConfig });
    const [activeAgent, setActiveAgent] = useState('archie');
    const [saved, setSaved] = useState(false);

    const updateAgent = (agent, cfg) => setDraft(d => ({ ...d, [agent]: cfg }));
    const copyFrom = (src, dst) => setDraft(d => ({ ...d, [dst]: { ...d[src] } }));

    const save = () => {
        setAgentConfig(draft);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const agents = [
        { id: 'archie', label: '🔵 Archie — Architect', color: '#4ec9b0' },
        { id: 'optix', label: '🔴 Optix — Optimizer', color: '#f44747' },
        { id: 'judge', label: '⚖ Judge — Synthesizer', color: '#dcdcaa' },
    ];

    return (
        <div className="settings-panel">
            <div className="sp-header">
                <span className="sp-title">Settings</span>
                <button className="sp-close" onClick={() => setActivePanel('explorer')}>✕</button>
            </div>
            <div className="sp-body">
                {/* Agent tabs */}
                <div className="sp-tabs">
                    {agents.map(a => (
                        <button key={a.id} className={`sp-tab ${activeAgent === a.id ? 'sp-tab-active' : ''}`}
                            style={activeAgent === a.id ? { borderBottomColor: a.color } : {}}
                            onClick={() => setActiveAgent(a.id)}>
                            {a.id === 'archie' ? 'Archie' : a.id === 'optix' ? 'Optix' : 'Judge'}
                        </button>
                    ))}
                </div>
                {agents.map(a => activeAgent === a.id && (
                    <div key={a.id}>
                        {a.id !== 'archie' && (
                            <button className="sp-copy-btn" onClick={() => copyFrom('archie', a.id)}>↓ Copy Archie's settings</button>
                        )}
                        <AgentPane agent={a.id} label={a.label} color={a.color}
                            cfg={draft[a.id]} onChange={cfg => updateAgent(a.id, cfg)} />
                    </div>
                ))}

                <div className="sp-divider" />
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

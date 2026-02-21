import React from 'react';
import { useStore } from '../../store/index.js';

function langFromPath(path = '') {
    const ext = path.split('.').pop()?.toLowerCase();
    const map = {
        js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX',
        py: 'Python', go: 'Go', rs: 'Rust', html: 'HTML', css: 'CSS',
        json: 'JSON', md: 'Markdown', sh: 'Shell', cpp: 'C++', c: 'C', java: 'Java'
    };
    return map[ext] || ext?.toUpperCase() || '—';
}

export default function StatusBar() {
    const openTabs = useStore(s => s.openTabs);
    const activeTab = useStore(s => s.activeTab);
    const gitBranch = useStore(s => s.gitBranch);
    const agentConfig = useStore(s => s.agentConfig);
    const toggleBottomPanel = useStore(s => s.toggleBottomPanel);
    const bottomPanelOpen = useStore(s => s.bottomPanelOpen);

    const file = openTabs.find(t => t.path === activeTab);
    const lang = langFromPath(file?.name);

    const providerLabel = p => ({ gemini: 'Gemini', openai: 'OpenAI', anthropic: 'Claude', groq: 'Groq', openrouter: 'OR' }[p] || p);
    const a = agentConfig.archie, o = agentConfig.optix;

    return (
        <div className="statusbar">
            <div className="sb-left">
                {gitBranch && <span className="sb-badge">⎇ {gitBranch}</span>}
                <span className="sb-badge">
                    A:{providerLabel(a.provider)} ⟺ O:{providerLabel(o.provider)}
                </span>
            </div>
            <div className="sb-right">
                {file && <span className="sb-badge">{lang}</span>}
                <span className="sb-badge sb-clickable" onClick={toggleBottomPanel}>
                    {bottomPanelOpen ? '▼' : '▲'} Terminal
                </span>
            </div>
        </div>
    );
}

import React from 'react';
import { useStore } from '../../store/index.js';

// Activity bar now controls the RIGHT panel only (Debate / Git / Settings)
// The file explorer is always visible on the left — no toggle needed for it
const RIGHT_ITEMS = [
    { id: 'debate', icon: '⚔', label: 'Debate', title: 'AI Debate Engine' },
    { id: 'git', icon: '⎇', label: 'Source', title: 'Source Control (Git)' },
];

export default function ActivityBar() {
    const { activePanel, setActivePanel } = useStore();

    return (
        <div className="actbar">
            <div className="ab-top">
                {RIGHT_ITEMS.map(p => (
                    <button
                        key={p.id}
                        className={`ab-btn ${activePanel === p.id ? 'ab-active' : ''}`}
                        title={p.title}
                        onClick={() => setActivePanel(activePanel === p.id ? 'debate' : p.id)}
                    >
                        <span className="ab-icon">{p.icon}</span>
                        <span className="ab-label">{p.label}</span>
                    </button>
                ))}
            </div>
            <div className="ab-bottom">
                <button
                    className={`ab-btn ${activePanel === 'settings' ? 'ab-active' : ''}`}
                    title="Settings — API keys & model config"
                    onClick={() => setActivePanel(activePanel === 'settings' ? 'debate' : 'settings')}
                >
                    <span className="ab-icon">⚙</span>
                    <span className="ab-label">Settings</span>
                </button>
            </div>
        </div>
    );
}

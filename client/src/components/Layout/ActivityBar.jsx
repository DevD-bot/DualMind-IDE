import React from 'react';
import { useStore } from '../../store/index.js';

const NAV_ITEMS = [
    { id: 'explorer', icon: '📁', label: 'Files' },
    { id: 'debate', icon: '⚔', label: 'Debate' },
    { id: 'git', icon: '⎇', label: 'Source' },
];

export default function ActivityBar() {
    const { activePanel, setActivePanel } = useStore();

    return (
        <div className="actbar">
            <div className="ab-top">
                {NAV_ITEMS.map(p => (
                    <button
                        key={p.id}
                        className={`ab-btn ${activePanel === p.id ? 'ab-active' : ''}`}
                        title={p.id === 'explorer' ? 'File Explorer' : p.id === 'debate' ? 'AI Debate Engine' : 'Source Control (Git)'}
                        onClick={() => setActivePanel(activePanel === p.id ? null : p.id)}
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
                    onClick={() => setActivePanel(activePanel === 'settings' ? 'explorer' : 'settings')}
                >
                    <span className="ab-icon">⚙</span>
                    <span className="ab-label">Settings</span>
                </button>
            </div>
        </div>
    );
}

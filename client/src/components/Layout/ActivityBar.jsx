import React from 'react';
import { useStore } from '../../store/index.js';

const panels = [
    { id: 'explorer', icon: '📁', title: 'Explorer' },
    { id: 'debate', icon: '⚔', title: 'Debate' },
    { id: 'git', icon: '⎇', title: 'Git' },
    { id: 'settings', icon: '⚙', title: 'Settings' },
];

export default function ActivityBar() {
    const { activePanel, setActivePanel } = useStore();

    return (
        <div className="actbar">
            {panels.map(p => (
                <button
                    key={p.id}
                    className={`ab-btn ${activePanel === p.id ? 'ab-active' : ''}`}
                    title={p.title}
                    onClick={() => setActivePanel(activePanel === p.id && p.id !== 'settings' ? null : p.id)}
                >
                    {p.icon}
                </button>
            ))}
        </div>
    );
}

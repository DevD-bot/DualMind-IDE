import React from 'react';
import { useStore } from '../../store/index.js';

const EXT_ICONS = {
    js: '🟨', jsx: '⚛', ts: '🔷', tsx: '⚛', py: '🐍', go: '🔵',
    html: '🌐', css: '🎨', json: '📋', md: '📝', sh: '💲', rs: '🦀',
    cpp: '⚙', c: '⚙', java: '☕', rb: '💎', default: '📄',
};

function fileIcon(name = '') {
    const ext = name.split('.').pop()?.toLowerCase();
    return EXT_ICONS[ext] || EXT_ICONS.default;
}

export default function EditorTabs() {
    const { openTabs, activeTab, setActiveTab, closeTab } = useStore();

    if (!openTabs.length) return <div className="editor-tabbar empty-tabbar"></div>;

    return (
        <div className="editor-tabbar">
            {openTabs.map(tab => (
                <div
                    key={tab.path}
                    className={`ed-tab ${tab.path === activeTab ? 'ed-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.path)}
                >
                    <span className="ed-tab-icon">{fileIcon(tab.name)}</span>
                    <span className="ed-tab-name">{tab.name}</span>
                    {tab.modified && <span className="ed-tab-dot" title="Unsaved">●</span>}
                    <button
                        className="ed-tab-close"
                        onClick={e => { e.stopPropagation(); closeTab(tab.path); }}
                    >×</button>
                </div>
            ))}
        </div>
    );
}

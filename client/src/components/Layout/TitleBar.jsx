import React from 'react';
import { useStore } from '../../store/index.js';

export default function TitleBar() {
    const workspaceRoot = useStore(s => s.workspaceRoot);
    const setWorkspaceRoot = useStore(s => s.setWorkspaceRoot);
    const isDebating = useStore(s => s.isDebating);
    const name = workspaceRoot.split(/[\\/]/).pop() || 'DualMind IDE';

    return (
        <div className="titlebar">
            <div className="tb-left">
                <span className="tb-logo">⚔</span>
                <span className="tb-name">DualMind IDE</span>
                <span className="tb-sep">—</span>
                <span className="tb-workspace">{name}</span>
            </div>
            {isDebating && (
                <div className="tb-status-pill">
                    <span className="tb-pulse"></span>
                    Agents debating…
                </div>
            )}
            <div className="tb-right">
                <button className="tb-action-btn" title="Change workspace"
                    onClick={() => { const r = prompt('Enter workspace folder path:'); if (r) setWorkspaceRoot(r.trim()); }}>
                    📂
                </button>
            </div>
        </div>
    );
}

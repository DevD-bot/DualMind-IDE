import React, { useState } from 'react';
import { useStore } from '../store/index.js';
import { getFileTree } from '../services/backend.js';

export default function WorkspacePrompt() {
    const setWorkspaceRoot = useStore(s => s.setWorkspaceRoot);
    const setFileTree = useStore(s => s.setFileTree);
    const [path, setPath] = useState('');
    const [error, setError] = useState('');

    const open = async () => {
        const root = path.trim();
        if (!root) return;
        try {
            const { tree } = await getFileTree(root);
            setFileTree(tree);
            setWorkspaceRoot(root);
        } catch {
            setError('Could not open folder. Make sure the path exists and the server is running on port 3001.');
        }
    };

    return (
        <div className="workspace-prompt">
            <div className="wp-card">
                <div className="wp-logo">⚔</div>
                <h1 className="wp-title">DualMind IDE</h1>
                <p className="wp-sub">Two AI agents. One verdict. The best code wins.</p>
                <div className="wp-input-row">
                    <input className="wp-input" placeholder="Enter workspace folder path, e.g. C:\projects\myapp"
                        value={path} onChange={e => setPath(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && open()} />
                    <button className="wp-btn" onClick={open}>Open →</button>
                </div>
                {error && <p className="wp-error">{error}</p>}
                <p className="wp-note">Make sure the server is running: <code>npm run dev</code></p>
            </div>
        </div>
    );
}

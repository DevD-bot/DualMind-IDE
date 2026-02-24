import React, { useState } from 'react';
import { useStore } from '../store/index.js';
import { getFileTree } from '../services/backend.js';
import axios from 'axios';

const API = axios.create({ baseURL: `http://${window.location.hostname}:3001/api` });

export default function WorkspacePrompt() {
    const setWorkspaceRoot = useStore(s => s.setWorkspaceRoot);
    const setFileTree = useStore(s => s.setFileTree);
    const [path, setPath] = useState('');
    const [error, setError] = useState('');
    const [picking, setPicking] = useState(false);

    const openPath = async (root) => {
        if (!root?.trim()) return;
        try {
            const { tree } = await getFileTree(root.trim());
            setFileTree(tree);
            setWorkspaceRoot(root.trim());
        } catch {
            setError('Could not open folder. Make sure the path exists and the server is running on port 3001.');
        }
    };

    const browseFolder = async () => {
        setPicking(true);
        setError('');
        try {
            const { data } = await API.get('/files/pick-folder');
            if (data.path) {
                await openPath(data.path);
            } else {
                setPicking(false);
            }
        } catch {
            setError('Could not open folder picker. Is the server running?');
            setPicking(false);
        }
    };

    return (
        <div className="workspace-prompt">
            <div className="wp-card">
                <div className="wp-logo">⚔</div>
                <h1 className="wp-title">DualMind IDE</h1>
                <p className="wp-sub">Two AI agents. One verdict. The best code wins.</p>

                {/* Primary: native folder browser */}
                <button className="wp-browse-btn" onClick={browseFolder} disabled={picking}>
                    {picking ? '⟳ Opening…' : '📂 Open Folder'}
                </button>

                {/* Divider */}
                <div className="wp-divider"><span>or enter path manually</span></div>

                {/* Fallback: text input */}
                <div className="wp-input-row">
                    <input className="wp-input"
                        placeholder="C:\projects\myapp"
                        value={path} onChange={e => setPath(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && openPath(path)}
                    />
                    <button className="wp-btn" onClick={() => openPath(path)}>Open →</button>
                </div>

                {error && <p className="wp-error">{error}</p>}
                <p className="wp-note">Server must be running: <code>npm run dev:server</code></p>
            </div>
        </div>
    );
}

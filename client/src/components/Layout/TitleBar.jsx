import React, { useState } from 'react';
import { useStore } from '../../store/index.js';
import { getFileTree } from '../../services/backend.js';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3001/api' });

export default function TitleBar() {
    const workspaceRoot = useStore(s => s.workspaceRoot);
    const setWorkspaceRoot = useStore(s => s.setWorkspaceRoot);
    const setFileTree = useStore(s => s.setFileTree);
    const isDebating = useStore(s => s.isDebating);
    const [picking, setPicking] = useState(false);

    const name = workspaceRoot ? workspaceRoot.split(/[\\/]/).pop() : 'DualMind IDE';

    const browseFolder = async () => {
        setPicking(true);
        try {
            const { data } = await API.get('/files/pick-folder');
            if (data.path) {
                const { tree } = await getFileTree(data.path);
                setFileTree(tree);
                setWorkspaceRoot(data.path);
            }
        } catch (e) {
            console.error('Failed to pick folder:', e);
        }
        setPicking(false);
    };

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
                <button className="tb-action-btn" title="Open folder from computer"
                    onClick={browseFolder} disabled={picking}>
                    {picking ? '⟳' : '📂'}
                </button>
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/index.js';
import axios from 'axios';
import { getFileTree } from '../../services/backend.js';

const API = axios.create({ baseURL: 'http://localhost:3001/api' });

function Menu({ label, items }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="mb-menu" ref={ref}>
            <button className={`mb-trigger ${open ? 'mb-open' : ''}`} onClick={() => setOpen(o => !o)}>
                {label}
            </button>
            {open && (
                <div className="mb-dropdown">
                    {items.map((item, i) =>
                        item === '---'
                            ? <div key={i} className="mb-sep" />
                            : <button key={i} className="mb-item" onClick={() => { setOpen(false); item.action(); }}
                                disabled={item.disabled}>
                                <span className="mb-item-label">{item.label}</span>
                                {item.shortcut && <span className="mb-item-shortcut">{item.shortcut}</span>}
                            </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function MenuBar() {
    const { setWorkspaceRoot, setFileTree, toggleBottomPanel } = useStore();
    const workspaceRoot = useStore(s => s.workspaceRoot);
    const isDebating = useStore(s => s.isDebating);
    const workspaceName = workspaceRoot ? workspaceRoot.split(/[\\/]/).pop() : '';

    const openFolder = async () => {
        try {
            const { data } = await API.get('/files/pick-folder');
            if (data.path) {
                const { tree } = await getFileTree(data.path);
                setFileTree(tree);
                setWorkspaceRoot(data.path);
            }
        } catch (e) { console.error(e); }
    };

    const runFile = async () => {
        const { activeTab, openTabs } = useStore.getState();
        const tab = openTabs.find(t => t.path === activeTab);
        if (!tab) return;
        useStore.getState().addTerminalLine({ type: 'out', text: `\n▶ Running ${tab.name}...\n` });
        useStore.getState().bottomPanelOpen || useStore.getState().toggleBottomPanel();
        await API.post('/terminal/run', { cwd: workspaceRoot, file: tab.path });
    };

    const newTerminal = () => {
        const store = useStore.getState();
        if (!store.bottomPanelOpen) store.toggleBottomPanel();
        store.clearTerminal();
    };

    const menus = [
        {
            label: 'File', items: [
                { label: '📂 Open Folder…', shortcut: 'Ctrl+K', action: openFolder },
                '---',
                { label: '💾 Save', shortcut: 'Ctrl+S', action: () => document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 's', bubbles: true })) },
                '---',
                { label: '⛔ Close Workspace', action: () => { setWorkspaceRoot(''); setFileTree([]); } },
            ]
        },
        {
            label: 'Edit', items: [
                { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
                { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
                '---',
                { label: 'Find', shortcut: 'Ctrl+F', action: () => document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'f', bubbles: true })) },
            ]
        },
        {
            label: 'Run', items: [
                { label: '▶ Run File', shortcut: 'F5', action: runFile },
                { label: '⬛ Stop Process', action: () => API.post('/terminal/kill').catch(() => { }) },
            ]
        },
        {
            label: 'Terminal', items: [
                { label: '⊞ New Terminal', action: newTerminal },
                { label: '⇅ Toggle Panel', shortcut: 'Ctrl+`', action: () => useStore.getState().toggleBottomPanel() },
                { label: '🗑 Clear Terminal', action: () => useStore.getState().clearTerminal() },
            ]
        },
    ];

    return (
        <div className="menubar">
            <span className="mb-logo">⚔</span>
            <span className="mb-appname">DualMind IDE</span>
            {menus.map(m => <Menu key={m.label} label={m.label} items={m.items} />)}
            {isDebating && (
                <div className="mb-status-pill">
                    <span className="mb-pulse" />
                    Agents debating…
                </div>
            )}
            {workspaceName && !isDebating && (
                <span className="mb-workspace">{workspaceName}</span>
            )}
        </div>
    );
}

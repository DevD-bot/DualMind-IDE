import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/index.js';
import { getFileTree, readFile, deleteFile, mkdir, writeFile } from '../../services/backend.js';
import { getGitStatus } from '../../services/backend.js';

const EXT_ICONS = {
    js: '🟨', jsx: '⚛', ts: '🔷', tsx: '⚛', py: '🐍', go: '🔵', html: '🌐',
    css: '🎨', json: '📋', md: '📝', sh: '💲', rs: '🦀', cpp: '⚙', c: '⚙', java: '☕'
};
function fIcon(name = '') { const e = name.split('.').pop()?.toLowerCase(); return EXT_ICONS[e] || '📄'; }

function TreeNode({ node, depth = 0, onRefresh }) {
    const [expanded, setExpanded] = useState(depth === 0);
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState(node.name);
    const { openTab, workspaceRoot, setGitStatus } = useStore();

    const openFile = async () => {
        if (node.type === 'dir') { setExpanded(e => !e); return; }
        const absPath = `${workspaceRoot}\\${node.path}`.replace(/\//g, '\\');
        const { content } = await readFile(absPath);
        openTab({ path: absPath, name: node.name, content, modified: false });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!confirm(`Delete ${node.name}?`)) return;
        const absPath = `${workspaceRoot}\\${node.path}`.replace(/\//g, '\\');
        await deleteFile(absPath);
        onRefresh();
    };

    return (
        <div className="ft-node" style={{ paddingLeft: depth * 12 + 4 }}>
            <div className="ft-row" onClick={openFile}>
                {node.type === 'dir' ? (
                    <span className="ft-chevron">{expanded ? '▾' : '▸'}</span>
                ) : (
                    <span className="ft-file-icon">{fIcon(node.name)}</span>
                )}
                <span className="ft-name">{node.name}</span>
                <button className="ft-del" onClick={handleDelete} title="Delete">✕</button>
            </div>
            {node.type === 'dir' && expanded && node.children?.map(child => (
                <TreeNode key={child.path} node={child} depth={depth + 1} onRefresh={onRefresh} />
            ))}
        </div>
    );
}

export default function FileExplorer() {
    const { workspaceRoot, fileTree, setFileTree, setGitStatus } = useStore();
    const [newFileName, setNewFileName] = useState('');
    const [creating, setCreating] = useState(false);

    const refresh = useCallback(async () => {
        if (!workspaceRoot) return;
        const { tree } = await getFileTree(workspaceRoot);
        setFileTree(tree);
        try {
            const gs = await getGitStatus(workspaceRoot);
            setGitStatus(gs);
        } catch { }
    }, [workspaceRoot]);

    useEffect(() => { refresh(); }, [refresh]);

    const createFile = async () => {
        if (!newFileName.trim()) return;
        const absPath = `${workspaceRoot}\\${newFileName}`.replace(/\//g, '\\');
        await writeFile(absPath, '');
        setNewFileName(''); setCreating(false);
        refresh();
    };

    const createFolder = async () => {
        const name = prompt('Folder name:');
        if (!name) return;
        await mkdir(`${workspaceRoot}\\${name}`.replace(/\//g, '\\'));
        refresh();
    };

    return (
        <div className="file-explorer">
            <div className="fe-header">
                <span className="fe-title">EXPLORER</span>
                <div className="fe-actions">
                    <button className="fe-icon-btn" title="New File" onClick={() => setCreating(c => !c)}>＋📄</button>
                    <button className="fe-icon-btn" title="New Folder" onClick={createFolder}>＋📁</button>
                    <button className="fe-icon-btn" title="Refresh" onClick={refresh}>↺</button>
                </div>
            </div>
            {creating && (
                <div className="fe-new-input">
                    <input autoFocus value={newFileName} onChange={e => setNewFileName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') setCreating(false); }}
                        placeholder="filename.ext" className="fe-input" />
                </div>
            )}
            <div className="fe-tree">
                {fileTree.length === 0
                    ? <div className="fe-empty">No files found</div>
                    : fileTree.map(node => <TreeNode key={node.path} node={node} onRefresh={refresh} />)
                }
            </div>
        </div>
    );
}

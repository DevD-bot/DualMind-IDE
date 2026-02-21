import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/index.js';
import { getFileTree, readFile, deleteFile, mkdir, writeFile, getGitStatus } from '../../services/backend.js';

// ── VSCode Material Icon Theme — SVG icon definitions ─────────
// Each returns a <svg> element styled like VSCode Material icons

const icons = {
    // ── Language icons ──────────────────────────────────────────────
    js: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#f7df1e" /><text x="3" y="24" fontSize="19" fontWeight="bold" fontFamily="monospace" fill="#000">JS</text></svg>
    ),
    jsx: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#61dafb" /><text x="1" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#000">JSX</text></svg>
    ),
    ts: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#3178c6" /><text x="3" y="24" fontSize="19" fontWeight="bold" fontFamily="monospace" fill="#fff">TS</text></svg>
    ),
    tsx: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#3178c6" /><text x="1" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#fff">TSX</text></svg>
    ),
    py: () => (
        <svg viewBox="0 0 32 32" className="fi-svg">
            <rect width="32" height="32" rx="3" fill="#3572a5" />
            <path d="M16 5c-4.4 0-4.1 1.9-4.1 1.9V9h8.4v1H9.6S7 9.7 7 14.3s2.2 4.4 2.2 4.4H11v-2.1s-.1-2.2 2.2-2.2h7.5s2.2.1 2.2-2.1V7c0 0 .3-2-6.9-2zm-1.5 1.4c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1-1.1-.5-1.1-1.1.5-1.1 1.1-1.1z" fill="#ffd43b" />
            <path d="M16 27c4.4 0 4.1-1.9 4.1-1.9V23H11.7v-1h13.7s2.6.3 2.6-4.3-2.2-4.4-2.2-4.4H24v2.1s.1 2.2-2.2 2.2h-7.5s-2.2-.1-2.2 2.1v5.2s-.3 2 6.9 2zm1.5-1.4c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" fill="#4584b6" />
        </svg>
    ),
    go: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#00acd7" /><text x="4" y="24" fontSize="19" fontWeight="bold" fontFamily="monospace" fill="#fff">Go</text></svg>
    ),
    rs: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#ce4a23" /><text x="3" y="24" fontSize="18" fontWeight="bold" fontFamily="monospace" fill="#fff">RS</text></svg>
    ),
    java: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#b07219" /><text x="1" y="24" fontSize="14" fontWeight="bold" fontFamily="monospace" fill="#fff">JAVA</text></svg>
    ),
    cpp: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#6295cb" />
            <text x="3" y="22" fontSize="15" fontWeight="bold" fontFamily="monospace" fill="#fff">C++</text>
        </svg>
    ),
    c: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#555"><text x="8" y="24" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="#a8c7f0">C</text></rect></svg>
    ),
    cs: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#178600" /><text x="4" y="24" fontSize="18" fontWeight="bold" fontFamily="monospace" fill="#fff">C#</text></svg>
    ),
    h: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#9b59b6" /><text x="8" y="24" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="#fff">h</text></svg>
    ),
    rb: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#701516" /><text x="4" y="24" fontSize="18" fontWeight="bold" fontFamily="monospace" fill="#fff">RB</text></svg>
    ),
    php: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#4f5d95" /><text x="2" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#fff">PHP</text></svg>
    ),
    swift: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#f05138" /><text x="1" y="24" fontSize="13" fontWeight="bold" fontFamily="monospace" fill="#fff">Swift</text></svg>
    ),
    kt: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#a97bff" /><text x="4" y="24" fontSize="18" fontWeight="bold" fontFamily="monospace" fill="#fff">KT</text></svg>
    ),

    // ── Web / markup ────────────────────────────────────────────────
    html: () => (
        <svg viewBox="0 0 32 32" className="fi-svg">
            <rect width="32" height="32" rx="3" fill="#e34c26" />
            <path d="M6 3l2.4 26.8L16 32l7.6-2.2L26 3H6zm17.3 6.6l-.3 3.4H13l.3 3.4h9.7l-1 10.6L16 28.6l-5.9-1.6-1-10.6h3.3l.5 5.7 3.1.8 3.1-.8.5-5.7H9.4L8.7 9.6h14.6z" fill="#fff" />
        </svg>
    ),
    css: () => (
        <svg viewBox="0 0 32 32" className="fi-svg">
            <rect width="32" height="32" rx="3" fill="#563d7c" />
            <path d="M6 3l2.4 26.8L16 32l7.6-2.2L26 3H6zm17.4 6.6l-.4 4.8H12.8l.3 3.2h9.6l-1 10.6L16 29.6l-5.7-1.4-.4-4.4h3.5l.2 2.4 2.4.6 2.4-.6.3-3.5H9.6L8.4 9.6h15z" fill="#fff" />
        </svg>
    ),
    scss: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#cd6799" /><text x="1" y="24" fontSize="15" fontWeight="bold" fontFamily="monospace" fill="#fff">SCSS</text></svg>
    ),
    svg: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#ffb13b" /><text x="2" y="24" fontSize="16" fontWeight="bold" fontFamily="monospace" fill="#fff">SVG</text></svg>
    ),

    // ── Config / data ───────────────────────────────────────────────
    json: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#2a2a2a" stroke="#cbcb41" strokeWidth="2" /><text x="1" y="24" fontSize="13" fontWeight="bold" fontFamily="monospace" fill="#cbcb41">JSON</text></svg>
    ),
    yml: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#cb171e" /><text x="1" y="24" fontSize="14" fontWeight="bold" fontFamily="monospace" fill="#fff">YAML</text></svg>
    ),
    yaml: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#cb171e" /><text x="1" y="24" fontSize="14" fontWeight="bold" fontFamily="monospace" fill="#fff">YAML</text></svg>
    ),
    toml: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#9c4221" /><text x="1" y="24" fontSize="14" fontWeight="bold" fontFamily="monospace" fill="#fff">TOML</text></svg>
    ),
    xml: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#ff6600" /><text x="2" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#fff">XML</text></svg>
    ),
    env: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#ecd53f" /><text x="3" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#000">ENV</text></svg>
    ),
    sql: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#e38c00" /><text x="2" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#fff">SQL</text></svg>
    ),

    // ── Docs / markdown ────────────────────────────────────────────
    md: () => (
        <svg viewBox="0 0 32 32" className="fi-svg">
            <rect width="32" height="32" rx="3" fill="#42a5f5" />
            <path d="M4 10h2v12H4v-7.5l-3 4-3-4V22H-4V10h2l3 4 3-4zm8 0v12h-2V14l-2 2-2-2v8H6V10h2l2 2 2-2h2zm3 0h6c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4v4h-2V10zm2 6h4v-4h-4v4z" transform="translate(6,4) scale(0.8)" fill="#fff" />
        </svg>
    ),
    txt: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#4a4a4a" /><path d="M8 9h16M8 14h16M8 19h12" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" /></svg>
    ),
    pdf: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#e53935" /><text x="2" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#fff">PDF</text></svg>
    ),

    // ── Shell / scripts ────────────────────────────────────────────
    sh: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#4eaa25" /><text x="5" y="24" fontSize="18" fontWeight="bold" fontFamily="monospace" fill="#fff">sh</text></svg>
    ),
    bat: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#c0c0c0" /><text x="2" y="24" fontSize="17" fontWeight="bold" fontFamily="monospace" fill="#333">bat</text></svg>
    ),
    ps1: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#012456" /><text x="2" y="24" fontSize="15" fontWeight="bold" fontFamily="monospace" fill="#00bcd4">PS</text></svg>
    ),

    // ── Images ─────────────────────────────────────────────────────
    png: () => <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#26a69a" /><path d="M4 22L11 14l5 6 4-4 8 6H4z" fill="#80cbc4" /><circle cx="22" cy="10" r="3" fill="#ffeb3b" /></svg>,
    jpg: () => <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#26a69a" /><path d="M4 22L11 14l5 6 4-4 8 6H4z" fill="#80cbc4" /><circle cx="22" cy="10" r="3" fill="#ffeb3b" /></svg>,
    gif: () => <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#ff5722" /><text x="3" y="24" fontSize="18" fontWeight="bold" fontFamily="monospace" fill="#fff">GIF</text></svg>,
    webp: () => <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#26a69a" /><path d="M4 22L11 14l5 6 4-4 8 6H4z" fill="#80cbc4" /></svg>,

    // ── Special files ───────────────────────────────────────────────
    gitignore: () => (
        <svg viewBox="0 0 32 32" className="fi-svg">
            <rect width="32" height="32" rx="3" fill="#f44747" />
            <text x="4" y="21" fontSize="14" fontWeight="bold" fontFamily="monospace" fill="#fff">git</text>
        </svg>
    ),
    lock: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#444" /><path d="M10 14V11a6 6 0 0112 0v3h1a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V15a1 1 0 011-1h1zm6-8a4 4 0 00-4 4v3h8v-3a4 4 0 00-4-4zm0 10a2 2 0 110 4 2 2 0 010-4z" fill="#aaa" /></svg>
    ),
    vue: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#41b883" /><path d="M16 8l-8 14h4l4-7 4 7h4L16 8z" fill="#fff" /><path d="M16 8l-5 8.5 5 8.5 5-8.5L16 8z" fill="#35495e" /></svg>
    ),
    svelte: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#ff3e00" /><path d="M22.4 9.6c-1.3-1.9-3.8-2.5-5.7-1.4L9.6 12.7c-1.9 1.1-2.5 3.3-1.4 5.2.4.7.9 1.2 1.5 1.6-1.3 1.9-.8 4.5 1.1 5.7 1.3 1.9 3.8 2.5 5.7 1.4l7.2-4.5c1.9-1.1 2.5-3.3 1.4-5.2-.4-.7-.9-1.2-1.5-1.6 1.2-1.9.7-4.5-1.2-5.7z" fill="#fff" /></svg>
    ),
    lua: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#000080" /><text x="3" y="24" fontSize="16" fontWeight="bold" fontFamily="monospace" fill="#fff">Lua</text></svg>
    ),
    dart: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#00b4ab" /><text x="2" y="24" fontSize="15" fontWeight="bold" fontFamily="monospace" fill="#fff">Dart</text></svg>
    ),
    r: () => (
        <svg viewBox="0 0 32 32" className="fi-svg"><rect width="32" height="32" rx="3" fill="#276dc3" /><text x="9" y="24" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="#fff">R</text></svg>
    ),

    // ── Fallback ────────────────────────────────────────────────────
    default: () => (
        <svg viewBox="0 0 32 32" className="fi-svg">
            <path d="M6 2h14l6 6v22H6V2z" fill="#4a4a4a" />
            <path d="M20 2l6 6h-6V2z" fill="#666" />
            <line x1="10" y1="14" x2="22" y2="14" stroke="#888" strokeWidth="1.5" />
            <line x1="10" y1="18" x2="22" y2="18" stroke="#888" strokeWidth="1.5" />
            <line x1="10" y1="22" x2="18" y2="22" stroke="#888" strokeWidth="1.5" />
        </svg>
    ),
};

// Special full filename → icon mapping
const FILENAME_ICONS = {
    '.gitignore': 'gitignore',
    '.gitattributes': 'gitignore',
    '.env': 'env',
    '.env.local': 'env',
    '.env.example': 'env',
    'package.json': 'json',
    'package-lock.json': 'lock',
    'yarn.lock': 'lock',
    'pnpm-lock.yaml': 'lock',
    'README.md': 'md',
    'Dockerfile': 'sh',
    'Makefile': 'sh',
};

// Folder icons by name
const FOLDER_ICON_COLOR = {
    src: '#dcb67a', client: '#dcb67a', server: '#dcb67a', lib: '#dcb67a',
    components: '#c084fc', pages: '#c084fc', views: '#c084fc', layouts: '#c084fc',
    styles: '#f472b6', css: '#f472b6', scss: '#f472b6',
    public: '#68d391', static: '#68d391', assets: '#68d391', images: '#68d391',
    node_modules: '#555', '.git': '#f44747',
    api: '#60a5fa', routes: '#60a5fa', controllers: '#60a5fa',
    test: '#fbbf24', tests: '#fbbf24', '__tests__': '#fbbf24', spec: '#fbbf24',
    dist: '#888', build: '#888', out: '#888',
    default: '#dcb67a',
};

function getFileIcon(name = '') {
    // Check full filename first
    const fnKey = FILENAME_ICONS[name];
    if (fnKey) return icons[fnKey] ?? icons.default;

    // Then extension
    const parts = name.split('.');
    if (parts.length > 1) {
        const ext = parts.pop().toLowerCase();
        if (icons[ext]) return icons[ext];
        // 2-part extension e.g. .d.ts
        if (parts.length > 1) {
            const ext2 = parts.pop().toLowerCase() + ext;
            if (icons[ext2]) return icons[ext2];
        }
    }
    return icons.default;
}

function FolderIcon({ name, open }) {
    const color = FOLDER_ICON_COLOR[name] || FOLDER_ICON_COLOR.default;
    return (
        <svg viewBox="0 0 32 32" className="fi-svg fi-folder">
            {open ? (
                <>
                    <path d="M2 10c0-1.1.9-2 2-2h10l2 3h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V10z" fill={color} />
                    <path d="M2 15h28v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9z" fill={color} opacity="0.8" />
                </>
            ) : (
                <>
                    <path d="M2 10c0-1.1.9-2 2-2h10l2 3h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V10z" fill={color} opacity="0.7" />
                    <path d="M2 13h28v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9z" fill={color} />
                </>
            )}
        </svg>
    );
}

function TreeNode({ node, depth = 0, onRefresh }) {
    const [expanded, setExpanded] = useState(depth === 0);
    const { openTab, workspaceRoot, activeTab } = useStore();

    const absPath = `${workspaceRoot}\\${node.path}`.replace(/\//g, '\\');
    const isActive = activeTab === absPath;

    const onClick = async () => {
        if (node.type === 'dir') { setExpanded(e => !e); return; }
        const { content } = await readFile(absPath);
        openTab({ path: absPath, name: node.name, content, modified: false });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!confirm(`Delete ${node.name}?`)) return;
        await deleteFile(absPath);
        onRefresh();
    };

    const FileIconComp = getFileIcon(node.name);

    return (
        <div className="ft-node">
            <div
                className={`ft-row ${isActive ? 'ft-row-active' : ''}`}
                style={{ paddingLeft: depth * 14 + 6 }}
                onClick={onClick}
                title={node.path}
            >
                {node.type === 'dir' ? (
                    <span className="ft-icon-wrap ft-chevron">
                        <span className="ft-chevron-arrow">{expanded ? '▾' : '▸'}</span>
                        <FolderIcon name={node.name} open={expanded} />
                    </span>
                ) : (
                    <span className="ft-icon-wrap">
                        <FileIconComp />
                    </span>
                )}
                <span className="ft-name">{node.name}</span>
                <button className="ft-del" onClick={handleDelete} title={`Delete ${node.name}`}>✕</button>
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
    const [creating, setCreating] = useState(null);
    const folderName = workspaceRoot?.split(/[\\/]/).pop() || 'EXPLORER';

    const refresh = useCallback(async () => {
        if (!workspaceRoot) return;
        const { tree } = await getFileTree(workspaceRoot);
        setFileTree(tree);
        try { const gs = await getGitStatus(workspaceRoot); setGitStatus(gs); } catch { }
    }, [workspaceRoot]);

    useEffect(() => { refresh(); }, [refresh]);

    const createFile = async () => {
        if (!newFileName.trim()) return;
        const absPath = `${workspaceRoot}\\${newFileName}`.replace(/\//g, '\\');
        if (creating === 'folder') await mkdir(absPath);
        else await writeFile(absPath, '');
        setNewFileName(''); setCreating(null);
        refresh();
    };

    return (
        <div className="file-explorer">
            <div className="fe-header">
                <span className="fe-title">EXPLORER</span>
                <div className="fe-actions">
                    <button className="fe-icon-btn" title="New File" onClick={() => setCreating('file')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.5L9 1zM9 2l3.5 3.5H9V2zM7.5 9H9v1.5H7.5V12h-1v-1.5H5V9h1.5V7.5h1V9z" /></svg>
                    </button>
                    <button className="fe-icon-btn" title="New Folder" onClick={() => setCreating('folder')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 3H7.70711L6.14645 1.43934 5.79289 1H1.5l-.5.5v11l.5.5h13l.5-.5v-9l-.5-.5zm-.5 9H2V2h3.29289l1.56066 1.56066.35355.43934H14v8z" /><path d="M7 8.5v-1h1V6h1v1.5h1.5v1H9V10H8V8.5H7z" /></svg>
                    </button>
                    <button className="fe-icon-btn" title="Refresh" onClick={refresh}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13.451 5.609l-.579-.939-1.068.812-.076.094c-.335-.43-.719-.822-1.145-1.165l.79-1.109-.94-.578-.812 1.068a6.227 6.227 0 0 0-1.516-.435L7.999 2h-1v1.369c-.537.09-1.052.26-1.524.5L4.694 2.75 3.75 3.33l.724 1.017A6.217 6.217 0 0 0 3.321 5.5L2.25 4.694l-.578.94 1.068.812c-.239.472-.41.987-.5 1.524H1v1h1.369c.09.537.261 1.052.5 1.524l-1.069.812.578.94L3.5 11.25c.472.24.987.41 1.524.5V13h1v-1.369a6.17 6.17 0 0 0 1.524-.5l.812 1.068.94-.579-.724-1.017A6.217 6.217 0 0 0 9.5 9.5h1V8h-.369a6.17 6.17 0 0 0-.5-1.524l1.069-.812-.579-.94L9.5 5.44A6.227 6.227 0 0 0 8 5.07V4h-1v1.07c-.537.088-1.052.26-1.524.5L4.664 4.5a5.16 5.16 0 0 1 1.165-.79L6 4.5h.5A4.5 4.5 0 1 1 3.5 8.5h-1A5.5 5.5 0 1 0 8 3z" /></svg>
                    </button>
                </div>
            </div>

            <div className="fe-root-label">
                <span className="fe-root-chevron">▾</span>
                <span className="fe-root-name">{folderName.toUpperCase()}</span>
            </div>

            {creating && (
                <div className="fe-new-input">
                    <span className="fe-new-icon">{creating === 'folder' ? '📁' : '📄'}</span>
                    <input autoFocus value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') createFile();
                            if (e.key === 'Escape') { setCreating(null); setNewFileName(''); }
                        }}
                        placeholder={creating === 'folder' ? 'folder name' : 'file.ext'}
                        className="fe-input" />
                </div>
            )}

            <div className="fe-tree">
                {fileTree.length === 0
                    ? <div className="fe-empty">No files — open a folder</div>
                    : fileTree.map(node => (
                        <TreeNode key={node.path} node={node} onRefresh={refresh} />
                    ))
                }
            </div>
        </div>
    );
}

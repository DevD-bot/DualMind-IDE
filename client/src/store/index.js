import { create } from 'zustand';

const DEFAULT_AGENT = { provider: 'gemini', apiKey: '', model: 'gemini-2.0-flash' };

function loadPersistedConfig() {
    try {
        return JSON.parse(localStorage.getItem('dualmind_config') || '{}');
    } catch { return {}; }
}

const saved = loadPersistedConfig();

export const useStore = create((set, get) => ({
    // ── Workspace ──────────────────────────────────
    workspaceRoot: saved.workspaceRoot || '',
    setWorkspaceRoot: (root) => { set({ workspaceRoot: root }); get().persistConfig(); },

    fileTree: [],
    setFileTree: (tree) => set({ fileTree: tree }),

    // ── Editor Tabs ────────────────────────────────
    openTabs: [],   // [{ path, name, content, modified, language }]
    activeTab: null,

    openTab: (file) => {
        const { openTabs } = get();
        const exists = openTabs.find(t => t.path === file.path);
        if (exists) { set({ activeTab: file.path }); return; }
        set({ openTabs: [...openTabs, file], activeTab: file.path });
    },
    closeTab: (path) => {
        const { openTabs, activeTab } = get();
        const idx = openTabs.findIndex(t => t.path === path);
        const next = openTabs.filter(t => t.path !== path);
        let newActive = activeTab;
        if (activeTab === path) {
            newActive = next.length ? (next[Math.max(0, idx - 1)]?.path || next[0]?.path) : null;
        }
        set({ openTabs: next, activeTab: newActive });
    },
    setActiveTab: (path) => set({ activeTab: path }),
    updateTabContent: (path, content) => {
        set(s => ({
            openTabs: s.openTabs.map(t => t.path === path ? { ...t, content, modified: true } : t),
        }));
    },
    markTabSaved: (path) => {
        set(s => ({
            openTabs: s.openTabs.map(t => t.path === path ? { ...t, modified: false } : t),
        }));
    },

    // ── Debate ─────────────────────────────────────
    debateMode: 'quick',  // 'quick' | 'build' | 'explain' | 'refactor' | 'fix'
    setDebateMode: (m) => set({ debateMode: m }),
    debateMessages: [],
    addDebateMessage: (msg) => set(s => ({ debateMessages: [...s.debateMessages, msg] })),
    clearDebate: () => set({ debateMessages: [] }),
    isDebating: false,
    setIsDebating: (v) => set({ isDebating: v }),
    buildFileTree: {},   // filename -> code (for Build App output)
    setBuildFile: (name, code) => set(s => ({ buildFileTree: { ...s.buildFileTree, [name]: code } })),
    clearBuildFiles: () => set({ buildFileTree: {} }),

    // ── Terminal ───────────────────────────────────
    terminalLines: [],
    addTerminalLine: (line) => set(s => ({ terminalLines: [...s.terminalLines, line] })),
    clearTerminal: () => set({ terminalLines: [] }),
    socketId: null,
    setSocketId: (id) => set({ socketId: id }),

    // ── Git ────────────────────────────────────────
    gitBranch: '',
    gitFiles: [],
    setGitStatus: ({ branch, files }) => set({ gitBranch: branch, gitFiles: files }),

    // ── UI Layout ──────────────────────────────────
    activePanel: 'debate',  // 'explorer' | 'debate' | 'git' | 'settings'
    setActivePanel: (p) => set({ activePanel: p }),
    bottomPanelOpen: true,
    toggleBottomPanel: () => set(s => ({ bottomPanelOpen: !s.bottomPanelOpen })),
    sidebarWidth: 240,
    setSidebarWidth: (w) => set({ sidebarWidth: w }),

    // ── Agent Config ───────────────────────────────
    agentConfig: (() => {
        const DEF = { provider: 'gemini', apiKey: '', model: 'gemini-2.0-flash' };
        const defaultAgents = [
            { name: 'Archie', color: '#4ec9b0', role: 'Architect', ...(saved.archie || DEF) },
            { name: 'Optix', color: '#f44747', role: 'Optimizer', ...(saved.optix || DEF) },
            { name: 'Judge', color: '#dcdcaa', role: 'Synthesizer', ...(saved.judge || DEF) },
        ];
        return {
            agents: saved.agents || defaultAgents,
            // legacy keys kept for backwards compat
            archie: saved.archie || { ...DEF },
            optix: saved.optix || { ...DEF },
            judge: saved.judge || { ...DEF },
            rounds: saved.rounds || 'auto',
        };
    })(),
    setAgentConfig: (cfg) => {
        set({ agentConfig: cfg });
        const { workspaceRoot } = get();
        const persist = { ...cfg, workspaceRoot };
        localStorage.setItem('dualmind_config', JSON.stringify(persist));
    },
    persistConfig: () => {
        const { agentConfig, workspaceRoot } = get();
        localStorage.setItem('dualmind_config', JSON.stringify({ ...agentConfig, workspaceRoot }));
    },
}));

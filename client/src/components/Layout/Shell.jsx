import React from 'react';
import { useStore } from '../../store/index.js';
import MenuBar from './MenuBar.jsx';
import ActivityBar from './ActivityBar.jsx';
import FileExplorer from '../FileExplorer/FileExplorer.jsx';
import EditorArea from './EditorArea.jsx';
import BottomPanel from './BottomPanel.jsx';
import StatusBar from './StatusBar.jsx';
import SettingsPanel from '../Settings/SettingsPanel.jsx';
import DebatePanel from '../Debate/DebatePanel.jsx';
import GitPanel from '../Git/GitPanel.jsx';
import HelpPanel from '../Help/HelpPanel.jsx';
import WorkspacePrompt from '../WorkspacePrompt.jsx';

export default function Shell() {
    const workspaceRoot = useStore(s => s.workspaceRoot);
    const activePanel = useStore(s => s.activePanel);
    const bottomPanelOpen = useStore(s => s.bottomPanelOpen);

    if (!workspaceRoot) return <WorkspacePrompt />;

    // Right panel content (debate / git / settings / help)
    const rightPanel = () => {
        if (activePanel === 'settings') return <SettingsPanel />;
        if (activePanel === 'git') return <GitPanel />;
        if (activePanel === 'help') return <HelpPanel />;
        return <DebatePanel />;   // debate is default right panel
    };

    return (
        <div className="shell">
            {/* ── Top bar ─────────────────────────────── */}
            <MenuBar />

            {/* ── Body ────────────────────────────────── */}
            <div className="shell-body">

                {/* Thin activity bar (icons only, no sidebar toggle) */}
                <ActivityBar />

                {/* LEFT: always-visible file explorer */}
                <div className="left-panel">
                    <FileExplorer />
                </div>

                {/* CENTER: editor + terminal */}
                <div className="main-area">
                    <EditorArea />
                    {bottomPanelOpen && <BottomPanel />}
                </div>

                {/* RIGHT: debate / git / settings panel */}
                <div className="right-panel">
                    {rightPanel()}
                </div>

            </div>

            {/* ── Status bar ──────────────────────────── */}
            <StatusBar />
        </div>
    );
}

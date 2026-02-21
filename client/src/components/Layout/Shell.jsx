import React from 'react';
import { useStore } from '../../store/index.js';
import ActivityBar from './ActivityBar.jsx';
import Sidebar from './Sidebar.jsx';
import EditorArea from './EditorArea.jsx';
import BottomPanel from './BottomPanel.jsx';
import StatusBar from './StatusBar.jsx';
import TitleBar from './TitleBar.jsx';
import SettingsPanel from '../Settings/SettingsPanel.jsx';
import WorkspacePrompt from '../WorkspacePrompt.jsx';

export default function Shell() {
    const workspaceRoot = useStore(s => s.workspaceRoot);
    const activePanel = useStore(s => s.activePanel);
    const bottomPanelOpen = useStore(s => s.bottomPanelOpen);

    if (!workspaceRoot) return <WorkspacePrompt />;

    return (
        <div className="shell">
            <TitleBar />
            <div className="shell-body">
                <ActivityBar />
                {activePanel !== 'settings' && (
                    <Sidebar />
                )}
                {activePanel === 'settings' ? (
                    <SettingsPanel />
                ) : (
                    <div className="main-area">
                        <EditorArea />
                        {bottomPanelOpen && <BottomPanel />}
                    </div>
                )}
            </div>
            <StatusBar />
        </div>
    );
}

import React from 'react';
import { useStore } from '../../store/index.js';
import FileExplorer from '../FileExplorer/FileExplorer.jsx';
import DebatePanel from '../Debate/DebatePanel.jsx';
import GitPanel from '../Git/GitPanel.jsx';

export default function Sidebar() {
    const activePanel = useStore(s => s.activePanel);

    return (
        <div className="sidebar">
            {activePanel === 'explorer' && <FileExplorer />}
            {activePanel === 'debate' && <DebatePanel />}
            {activePanel === 'git' && <GitPanel />}
        </div>
    );
}

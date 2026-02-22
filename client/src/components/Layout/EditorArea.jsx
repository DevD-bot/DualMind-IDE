import React, { useState } from 'react';
import { useStore } from '../../store/index.js';
import MonacoEditor from '../Editor/MonacoEditor.jsx';
import EditorTabs from '../Editor/EditorTabs.jsx';

export default function EditorArea() {
    const openTabs = useStore(s => s.openTabs);
    const activeTab = useStore(s => s.activeTab);

    const activeFile = openTabs.find(t => t.path === activeTab);

    return (
        <div className="editor-area">
            <EditorTabs />
            {activeFile ? (
                <MonacoEditor key={activeFile.path} file={activeFile} />
            ) : (
                <div className="editor-empty">
                    <div className="ee-logo">⚔</div>
                    <h2>DualMind IDE</h2>
                    <p>Open a file from the Explorer or start a debate</p>
                    <div className="ee-shortcuts">
                        <span className="ee-key">📁</span> Explorer to browse files
                        <br />
                        <span className="ee-key">⚔</span> Debate panel to generate code
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useRef, useEffect } from 'react';
import { useStore } from '../../store/index.js';
import { executeCode } from '../../services/backend.js';

export default function Terminal() {
    const terminalLines = useStore(s => s.terminalLines);
    const clearTerminal = useStore(s => s.clearTerminal);
    const openTabs = useStore(s => s.openTabs);
    const activeTab = useStore(s => s.activeTab);
    const socketId = useStore(s => s.socketId);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView(); }, [terminalLines]);

    const runActive = async () => {
        const file = openTabs.find(t => t.path === activeTab);
        if (!file) return;
        clearTerminal();
        const ext = file.name.split('.').pop()?.toLowerCase();
        const langMap = { js: 'javascript', py: 'python', go: 'go', sh: 'bash', rs: 'rust' };
        const language = langMap[ext] || ext;
        await executeCode(language, file.content, socketId);
    };

    return (
        <div className="terminal-panel">
            <div className="tp-toolbar">
                <button className="tp-btn" onClick={runActive} title="Run current file">▶ Run</button>
                <button className="tp-btn" onClick={clearTerminal} title="Clear">◻ Clear</button>
            </div>
            <div className="tp-output">
                {terminalLines.length === 0
                    ? <span className="tp-hint">$ Open a file and click Run to execute it</span>
                    : terminalLines.map((line, i) => (
                        <span key={i} className={`tp-line tp-${line.type}`}>{line.text}</span>
                    ))
                }
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

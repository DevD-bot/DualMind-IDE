import React, { useRef, useEffect, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { io } from 'socket.io-client';
import { useStore } from '../../store/index.js';
import { executeCode } from '../../services/backend.js';

export default function Terminal() {
    const terminalLines = useStore(s => s.terminalLines);
    const clearTerminal = useStore(s => s.clearTerminal);
    const addTerminalLine = useStore(s => s.addTerminalLine);
    const openTabs = useStore(s => s.openTabs);
    const activeTab = useStore(s => s.activeTab);
    const targetRef = useRef(null);
    const terminalRef = useRef(null);
    const fitAddonRef = useRef(null);
    const socketRef = useRef(null);
    const { workspaceRoot } = useStore();

    useEffect(() => {
        if (!targetRef.current) return;

        const terminal = new XTerm({
            cursorBlink: true,
            theme: { background: '#1e1e1e' },
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 14,
            lineHeight: 1.2,
            convertEol: true
        });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(targetRef.current);
        fitAddon.fit();

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;

        const socket = io(`http://${window.location.hostname}:3001`);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('terminal:spawn', {
                cwd: workspaceRoot,
                cols: terminal.cols,
                rows: terminal.rows
            });
        });

        socket.on('terminal:data', (data) => {
            terminal.write(data);
        });

        terminal.onData((data) => {
            socket.emit('terminal:data', data);
        });

        const handleResize = () => {
            fitAddon.fit();
            socket.emit('terminal:resize', { cols: terminal.cols, rows: terminal.rows });
        };
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.disconnect();
            terminal.dispose();
        };
    }, [workspaceRoot]);

    return (
        <div className="terminal-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tp-toolbar">
                <span className="tp-title">TERMINAL</span>
                <div style={{ flex: 1 }} />
            </div>
            <div className="tp-output" style={{ padding: '8px', overflow: 'hidden' }}>
                <div ref={targetRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}

import React, { useRef, useEffect } from 'react';
import MonacoEditorLib from '@monaco-editor/react';
import { useStore } from '../../store/index.js';
import { writeFile } from '../../services/backend.js';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

function langFromName(name = '') {
    const ext = name.split('.').pop()?.toLowerCase();
    const map = {
        js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
        py: 'python', go: 'go', rs: 'rust', html: 'html', css: 'css', json: 'json',
        md: 'markdown', sh: 'shell', cpp: 'cpp', c: 'c', java: 'java', rb: 'ruby'
    };
    return map[ext] || 'plaintext';
}

export default function MonacoEditor({ file }) {
    const editorRef = useRef(null);
    const updateTabContent = useStore(s => s.updateTabContent);
    const markTabSaved = useStore(s => s.markTabSaved);

    const handleMount = (editor, monaco) => {
        editorRef.current = editor;

        // LSP config
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
        });

        // Room name from file path
        const roomName = file.path.replace(/[^a-zA-Z0-9-]/g, '_');
        const wsUrl = window.location.protocol === 'https:'
            ? `wss://${window.location.hostname}:3001/yjs`
            : `ws://${window.location.hostname}:3001/yjs`;

        // Setup Yjs
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(wsUrl, roomName, ydoc);
        const ytext = ydoc.getText('monaco');

        let binding = null;
        provider.on('sync', isSynced => {
            if (isSynced && !binding) {
                // If the room is newly created and empty, seed it with the file's original content
                if (ytext.toString() === '' && file.content) {
                    ytext.insert(0, file.content);
                }
                binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);
            }
        });

        editor.disposeBindings = () => {
            if (binding) binding.destroy();
            provider.disconnect();
            ydoc.destroy();
        };

        // Ctrl+S to save
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
            const content = editor.getValue();
            try {
                await writeFile(file.path, content);
                markTabSaved(file.path);
            } catch (e) {
                console.error('Save failed:', e);
            }
        });
    };

    useEffect(() => {
        return () => {
            if (editorRef.current?.disposeBindings) {
                editorRef.current.disposeBindings();
            }
        };
    }, []);

    return (
        <div className="monaco-wrap">
            <MonacoEditorLib
                height="100%"
                language={langFromName(file.name)}
                value={file.content}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    wordWrap: 'off',
                    automaticLayout: true,
                    cursorBlinking: 'smooth',
                    cursorStyle: 'line',
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    padding: { top: 10 },
                }}
                onChange={v => updateTabContent(file.path, v)}
                onMount={handleMount}
            />
        </div>
    );
}

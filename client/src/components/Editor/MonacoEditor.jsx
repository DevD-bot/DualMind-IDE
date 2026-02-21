import React, { useRef } from 'react';
import MonacoEditorLib from '@monaco-editor/react';
import { useStore } from '../../store/index.js';
import { writeFile } from '../../services/backend.js';

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

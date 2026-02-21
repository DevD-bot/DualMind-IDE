import React, { useState } from 'react';
import { useStore } from '../../store/index.js';
import { writeFile } from '../../services/backend.js';

export default function BuildOutput() {
    const buildFileTree = useStore(s => s.buildFileTree);
    const workspaceRoot = useStore(s => s.workspaceRoot);
    const openTab = useStore(s => s.openTab);
    const [selected, setSelected] = useState(null);
    const files = Object.keys(buildFileTree);

    const saveAll = async () => {
        for (const name of files) {
            const path = `${workspaceRoot}\\${name}`.replace(/\//g, '\\');
            await writeFile(path, buildFileTree[name]);
        }
        alert(`${files.length} files saved to workspace!`);
    };

    const openInEditor = (name) => {
        const path = `${workspaceRoot}\\${name}`.replace(/\//g, '\\');
        openTab({ path, name, content: buildFileTree[name], modified: false });
    };

    if (!files.length) return null;
    return (
        <div className="build-output">
            <div className="bo-header">
                <span className="bo-title">📦 Generated Files ({files.length})</span>
                <button className="bo-save-btn" onClick={saveAll}>💾 Save All to Workspace</button>
            </div>
            <div className="bo-files">
                {files.map(name => (
                    <div key={name} className={`bo-file ${selected === name ? 'bo-file-active' : ''}`}
                        onClick={() => setSelected(s => s === name ? null : name)}>
                        <span>📄 {name}</span>
                        <button className="bo-open-btn" onClick={e => { e.stopPropagation(); openInEditor(name); }}>Open →</button>
                    </div>
                ))}
            </div>
            {selected && buildFileTree[selected] && (
                <pre className="bo-preview">{buildFileTree[selected]}</pre>
            )}
        </div>
    );
}

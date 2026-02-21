import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/index.js';
import { getGitStatus } from '../../services/backend.js';

const STATUS_LABELS = { M: 'Modified', A: 'Added', D: 'Deleted', '??': 'Untracked', R: 'Renamed' };

export default function GitPanel() {
    const { workspaceRoot, gitBranch, gitFiles, setGitStatus } = useStore();
    const [loading, setLoading] = useState(false);

    const refresh = async () => {
        if (!workspaceRoot) return;
        setLoading(true);
        try { setGitStatus(await getGitStatus(workspaceRoot)); } catch { }
        setLoading(false);
    };

    useEffect(() => { refresh(); }, [workspaceRoot]);

    return (
        <div className="git-panel">
            <div className="gp-header">
                <span className="gp-title">SOURCE CONTROL</span>
                <button className="gp-refresh" onClick={refresh}>{loading ? '⟳' : '↺'}</button>
            </div>
            {gitBranch && <div className="gp-branch">⎇ {gitBranch}</div>}
            <div className="gp-files">
                {gitFiles.length === 0
                    ? <div className="gp-empty">No changes detected</div>
                    : gitFiles.map((f, i) => (
                        <div key={i} className="gp-file">
                            <span className={`gp-badge gp-${f.status}`}>{f.status}</span>
                            <span className="gp-fname">{f.file}</span>
                            <span className="gp-label">{STATUS_LABELS[f.status] || f.status}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

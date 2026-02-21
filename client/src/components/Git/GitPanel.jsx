import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/index.js';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3001/api' });

const STATUS_META = {
    'M': { label: 'Modified', color: '#4ec9b0' },
    'A': { label: 'Added', color: '#73c991' },
    'D': { label: 'Deleted', color: '#f44747' },
    'R': { label: 'Renamed', color: '#dcdcaa' },
    '??': { label: 'Untracked', color: '#9d9d9d' },
};

function FileItem({ f, onStage, onUnstage }) {
    const meta = STATUS_META[f.status] || STATUS_META['??'];
    return (
        <div className="gp-file-row" title={f.file}>
            <span className="gp-badge" style={{ color: meta.color }}>{f.status}</span>
            <span className="gp-fname">{f.file.split(/[\\/]/).pop()}</span>
            <span className="gp-fpath">{f.file}</span>
            <div className="gp-file-actions">
                {f.staged
                    ? <button className="gp-fa-btn" title="Unstage" onClick={() => onUnstage(f.file)}>−</button>
                    : <button className="gp-fa-btn gp-stage-btn" title="Stage" onClick={() => onStage(f.file)}>+</button>
                }
            </div>
        </div>
    );
}

export default function GitPanel() {
    const { workspaceRoot, gitBranch, gitFiles, setGitStatus } = useStore();
    const [loading, setLoading] = useState(false);
    const [commitMsg, setCommitMsg] = useState('');
    const [log, setLog] = useState([]);
    const [showLog, setShowLog] = useState(false);
    const [actionMsg, setActionMsg] = useState('');
    const [actionErr, setActionErr] = useState('');
    const [ahead, setAhead] = useState(0);
    const [behind, setBehind] = useState(0);

    const notify = (msg, isErr = false) => {
        if (isErr) setActionErr(msg);
        else setActionMsg(msg);
        setTimeout(() => { setActionMsg(''); setActionErr(''); }, 3500);
    };

    const refresh = async () => {
        if (!workspaceRoot) return;
        setLoading(true);
        try {
            const { data } = await API.get(`/git/status?cwd=${encodeURIComponent(workspaceRoot)}`);
            setGitStatus(data);
            setAhead(data.ahead || 0);
            setBehind(data.behind || 0);
        } catch (e) { notify(e.response?.data?.error || e.message, true); }
        setLoading(false);
    };

    const loadLog = async () => {
        if (!workspaceRoot) return;
        try {
            const { data } = await API.get(`/git/log?cwd=${encodeURIComponent(workspaceRoot)}&n=10`);
            setLog(data.commits || []);
        } catch { }
    };

    useEffect(() => { refresh(); }, [workspaceRoot]);
    useEffect(() => { if (showLog) loadLog(); }, [showLog]);

    const stage = async (file) => { try { await API.post('/git/stage', { cwd: workspaceRoot, file }); refresh(); } catch (e) { notify(e.response?.data?.error || e.message, true); } };
    const unstage = async (file) => { try { await API.post('/git/unstage', { cwd: workspaceRoot, file }); refresh(); } catch (e) { notify(e.response?.data?.error || e.message, true); } };
    const stageAll = async () => { try { await API.post('/git/stage', { cwd: workspaceRoot }); refresh(); notify('All files staged'); } catch (e) { notify(e.message, true); } };

    const commit = async () => {
        if (!commitMsg.trim()) return notify('Commit message is empty', true);
        try {
            await API.post('/git/commit', { cwd: workspaceRoot, message: commitMsg });
            setCommitMsg(''); refresh(); notify('✓ Committed');
        } catch (e) { notify(e.response?.data?.error || e.message, true); }
    };

    const push = async () => {
        notify('Pushing…');
        try { await API.post('/git/push', { cwd: workspaceRoot }); refresh(); notify('✓ Pushed'); }
        catch (e) { notify(e.response?.data?.error || e.message, true); }
    };

    const pull = async () => {
        notify('Pulling…');
        try { await API.post('/git/pull', { cwd: workspaceRoot }); refresh(); notify('✓ Pulled'); }
        catch (e) { notify(e.response?.data?.error || e.message, true); }
    };

    const staged = gitFiles.filter(f => f.staged);
    const unstaged = gitFiles.filter(f => !f.staged);

    return (
        <div className="git-panel">
            {/* Header */}
            <div className="gp-header">
                <span className="gp-title">SOURCE CONTROL</span>
                <button className="gp-icon-btn" title="Refresh" onClick={refresh}>{loading ? '⟳' : '↺'}</button>
            </div>

            {/* Branch + sync */}
            {gitBranch && (
                <div className="gp-branch-bar">
                    <span className="gp-branch-name">⎇ {gitBranch}</span>
                    {(ahead > 0 || behind > 0) && (
                        <span className="gp-sync-info">
                            {behind > 0 && <span title="commits behind">↓{behind}</span>}
                            {ahead > 0 && <span title="commits ahead"> ↑{ahead}</span>}
                        </span>
                    )}
                </div>
            )}

            {/* Action feedback */}
            {actionMsg && <div className="gp-action-ok">{actionMsg}</div>}
            {actionErr && <div className="gp-action-err">{actionErr}</div>}

            {/* Sync buttons */}
            <div className="gp-sync-bar">
                <button className="gp-sync-btn" onClick={pull} title="Pull from remote">↓ Pull</button>
                <button className="gp-sync-btn gp-push-btn" onClick={push} title="Push to remote">↑ Push</button>
            </div>

            {/* Commit box */}
            <div className="gp-commit-box">
                <textarea className="gp-commit-input" rows={3}
                    placeholder="Commit message…"
                    value={commitMsg} onChange={e => setCommitMsg(e.target.value)}
                    onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') commit(); }}
                />
                <div className="gp-commit-actions">
                    <button className="gp-stage-all-btn" onClick={stageAll} title="Stage all changes">＋ Stage All</button>
                    <button className="gp-commit-btn" onClick={commit} disabled={!commitMsg.trim()}>✓ Commit</button>
                </div>
            </div>

            {/* Staged files */}
            {staged.length > 0 && (
                <div className="gp-section">
                    <div className="gp-section-title">
                        <span>▾ Staged Changes ({staged.length})</span>
                    </div>
                    {staged.map((f, i) => <FileItem key={i} f={f} onStage={stage} onUnstage={unstage} />)}
                </div>
            )}

            {/* Unstaged files */}
            {unstaged.length > 0 && (
                <div className="gp-section">
                    <div className="gp-section-title">
                        <span>▾ Changes ({unstaged.length})</span>
                    </div>
                    {unstaged.map((f, i) => <FileItem key={i} f={f} onStage={stage} onUnstage={unstage} />)}
                </div>
            )}

            {gitFiles.length === 0 && !loading && (
                <div className="gp-empty">No changes — working tree clean</div>
            )}

            {/* Commit log */}
            <div className="gp-log-toggle" onClick={() => setShowLog(s => !s)}>
                {showLog ? '▾' : '▸'} Commit History
            </div>
            {showLog && (
                <div className="gp-log">
                    {log.length === 0 ? <div className="gp-empty">No commits yet</div>
                        : log.map((c, i) => (
                            <div key={i} className="gp-log-entry">
                                <span className="gp-log-hash">{c.hash}</span>
                                <span className="gp-log-msg">{c.message}</span>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}

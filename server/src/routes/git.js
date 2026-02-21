const express = require('express');
const { execSync, exec } = require('child_process');
const router = express.Router();

function git(cmd, cwd) {
    return execSync(`git ${cmd}`, { cwd, encoding: 'utf-8', timeout: 15000 });
}
function gitAsync(cmd, cwd) {
    return new Promise((resolve, reject) => {
        exec(`git ${cmd}`, { cwd, timeout: 30000 }, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout.trim());
        });
    });
}

// GET /api/git/status?cwd=<path>
router.get('/status', (req, res) => {
    const cwd = req.query.cwd;
    if (!cwd) return res.status(400).json({ error: 'cwd required' });
    try {
        const raw = git('status --porcelain', cwd);
        const branch = git('rev-parse --abbrev-ref HEAD', cwd).trim();
        // upstream tracking info
        let ahead = 0, behind = 0;
        try {
            const counts = git('rev-list --left-right --count @{u}...HEAD', cwd).trim().split(/\s+/);
            behind = parseInt(counts[0]) || 0;
            ahead = parseInt(counts[1]) || 0;
        } catch { }
        const files = raw.trim().split('\n').filter(Boolean).map(line => ({
            xy: line.slice(0, 2),
            staged: line[0] !== ' ' && line[0] !== '?',
            status: line.slice(0, 2).trim(),
            file: line.slice(3).trim(),
        }));
        res.json({ branch, files, ahead, behind });
    } catch (e) {
        // Folder is not a git repo — return empty state silently
        if (e.message.includes('not a git repository')) {
            return res.json({ branch: null, files: [], ahead: 0, behind: 0 });
        }
        res.status(500).json({ error: e.message });
    }
});

// GET /api/git/diff?path=<file>&cwd=<dir>
router.get('/diff', (req, res) => {
    const { path: filePath, cwd } = req.query;
    if (!filePath || !cwd) return res.status(400).json({ error: 'path and cwd required' });
    try {
        const diff = git(`diff HEAD -- "${filePath}"`, cwd);
        res.json({ diff });
    } catch (e) {
        res.json({ diff: '' });
    }
});

// GET /api/git/log?cwd=<path>&n=10
router.get('/log', (req, res) => {
    const { cwd, n = 10 } = req.query;
    if (!cwd) return res.status(400).json({ error: 'cwd required' });
    try {
        const raw = git(`log --oneline -${n}`, cwd);
        const commits = raw.trim().split('\n').filter(Boolean).map(line => ({
            hash: line.slice(0, 7),
            message: line.slice(8),
        }));
        res.json({ commits });
    } catch (e) {
        res.json({ commits: [] });
    }
});

// POST /api/git/stage  { cwd, file? }  — file omitted = stage all
router.post('/stage', async (req, res) => {
    const { cwd, file } = req.body;
    if (!cwd) return res.status(400).json({ error: 'cwd required' });
    try {
        const target = file ? `"${file}"` : '.';
        await gitAsync(`add ${target}`, cwd);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/unstage  { cwd, file }
router.post('/unstage', async (req, res) => {
    const { cwd, file } = req.body;
    if (!cwd || !file) return res.status(400).json({ error: 'cwd and file required' });
    try {
        await gitAsync(`restore --staged "${file}"`, cwd);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/commit  { cwd, message }
router.post('/commit', async (req, res) => {
    const { cwd, message } = req.body;
    if (!cwd || !message) return res.status(400).json({ error: 'cwd and message required' });
    try {
        const out = await gitAsync(`commit -m "${message.replace(/"/g, '\\"')}"`, cwd);
        res.json({ ok: true, output: out });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/push  { cwd }
router.post('/push', async (req, res) => {
    const { cwd } = req.body;
    if (!cwd) return res.status(400).json({ error: 'cwd required' });
    try {
        const out = await gitAsync('push', cwd);
        res.json({ ok: true, output: out });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/git/pull  { cwd }
router.post('/pull', async (req, res) => {
    const { cwd } = req.body;
    if (!cwd) return res.status(400).json({ error: 'cwd required' });
    try {
        const out = await gitAsync('pull', cwd);
        res.json({ ok: true, output: out });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

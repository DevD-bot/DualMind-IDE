const express = require('express');
const { execSync } = require('child_process');
const router = express.Router();

function git(cmd, cwd) {
    return execSync(`git ${cmd}`, { cwd, encoding: 'utf-8', timeout: 10000 });
}

// GET /api/git/status?cwd=<path>
router.get('/status', (req, res) => {
    const cwd = req.query.cwd;
    if (!cwd) return res.status(400).json({ error: 'cwd required' });
    try {
        const raw = git('status --porcelain', cwd);
        const branch = git('rev-parse --abbrev-ref HEAD', cwd).trim();
        const files = raw.trim().split('\n').filter(Boolean).map(line => ({
            status: line.slice(0, 2).trim(),
            file: line.slice(3).trim(),
        }));
        res.json({ branch, files });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/git/diff?path=<file>&cwd=<dir>
router.get('/diff', (req, res) => {
    const { path: filePath, cwd } = req.query;
    if (!filePath || !cwd) return res.status(400).json({ error: 'path and cwd required' });
    try {
        const diff = git(`diff HEAD -- "${filePath}"`, cwd);
        const orig = git(`show HEAD:"${filePath}"`, cwd);
        res.json({ diff, original: orig });
    } catch (e) {
        // New file not in HEAD yet
        res.json({ diff: '', original: '' });
    }
});

module.exports = router;

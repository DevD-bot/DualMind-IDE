const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function buildTree(dirPath, baseDir) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
        .filter(e => !['node_modules', '.git', 'dist', '.DS_Store'].includes(e.name))
        .map(e => {
            const fullPath = path.join(dirPath, e.name);
            const relPath = path.relative(baseDir, fullPath);
            if (e.isDirectory()) {
                return { name: e.name, path: relPath, type: 'dir', children: buildTree(fullPath, baseDir) };
            }
            return { name: e.name, path: relPath, type: 'file' };
        })
        .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
}

// GET /api/files/tree?root=<absolute-path>
router.get('/tree', (req, res) => {
    const root = req.query.root;
    if (!root || !fs.existsSync(root)) return res.status(400).json({ error: 'Invalid root path' });
    try {
        const tree = buildTree(root, root);
        res.json({ root, tree });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/files/read?path=<absolute-path>
router.get('/read', (req, res) => {
    const filePath = req.query.path;
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ path: filePath, content });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/files/write  { path, content }
router.post('/write', (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: 'path required' });
    try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content || '', 'utf-8');
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/files/rename  { oldPath, newPath }
router.post('/rename', (req, res) => {
    const { oldPath, newPath } = req.body;
    try {
        fs.renameSync(oldPath, newPath);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/files/delete?path=<absolute-path>
router.delete('/delete', (req, res) => {
    const filePath = req.query.path;
    try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) fs.rmSync(filePath, { recursive: true, force: true });
        else fs.unlinkSync(filePath);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/files/mkdir  { path }
router.post('/mkdir', (req, res) => {
    try {
        fs.mkdirSync(req.body.path, { recursive: true });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/files/pick-folder  — opens native Windows folder browser dialog
router.get('/pick-folder', (req, res) => {
    const { exec } = require('child_process');
    const os = require('os');
    const tmp = require('path').join(os.tmpdir(), '_dualmind_picker.ps1');
    const script = [
        'Add-Type -AssemblyName System.Windows.Forms',
        '$dlg = New-Object System.Windows.Forms.FolderBrowserDialog',
        '$dlg.Description = "Select workspace folder"',
        '$dlg.ShowNewFolderButton = $true',
        '$form = New-Object System.Windows.Forms.Form',
        '$form.TopMost = $true', // Bring dialogue to front!
        '$form.WindowState = [System.Windows.Forms.FormWindowState]::Minimized',
        'if ($dlg.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {',
        '    Write-Output $dlg.SelectedPath',
        '}',
    ].join('\n');
    require('fs').writeFileSync(tmp, script, 'utf-8');

    // Execute asynchronously (not spawnSync) and with -Sta flag required by WinForms UI!
    exec(`powershell -Sta -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "${tmp}"`,
        { encoding: 'utf-8', timeout: 60000 },
        (err, stdout) => {
            if (err) {
                return res.json({ path: null, cancelled: true });
            }
            const picked = (stdout || '').trim();
            if (picked) res.json({ path: picked });
            else res.json({ path: null, cancelled: true });
        }
    );
});

module.exports = router;

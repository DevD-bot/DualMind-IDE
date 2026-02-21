const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const router = express.Router();

const LANG_RUNNERS = {
    javascript: { cmd: 'node', ext: '.js' },
    typescript: { cmd: 'npx ts-node', ext: '.ts' },
    python: { cmd: 'python', ext: '.py' },
    python3: { cmd: 'python3', ext: '.py' },
    go: { cmd: 'go run', ext: '.go' },
    bash: { cmd: 'bash', ext: '.sh' },
    cpp: { cmd: null, ext: '.cpp' }, // requires compile step
};

// POST /api/execute  { language, code, socketId }
router.post('/', (req, res) => {
    const { language = 'javascript', code, socketId } = req.body;
    const io = global._io;

    const emit = (event, data) => {
        if (socketId && io) io.to(socketId).emit(event, data);
    };

    const runner = LANG_RUNNERS[language.toLowerCase()];
    if (!runner) return res.status(400).json({ error: `Language '${language}' not supported` });

    // Write code to temp file
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `dualmind_exec_${Date.now()}${runner.ext}`);
    try {
        fs.writeFileSync(tmpFile, code, 'utf-8');
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

    const [cmd, ...cmdArgs] = runner.cmd.split(' ');
    const proc = spawn(cmd, [...cmdArgs, tmpFile], {
        timeout: 30000,
        env: { ...process.env, NODE_ENV: 'sandbox' },
    });

    res.json({ ok: true, pid: proc.pid });

    proc.stdout.on('data', d => emit('terminal:stdout', d.toString()));
    proc.stderr.on('data', d => emit('terminal:stderr', d.toString()));
    proc.on('close', code => {
        emit('terminal:exit', { code });
        try { fs.unlinkSync(tmpFile); } catch { }
    });
    proc.on('error', e => emit('terminal:error', e.message));
});

module.exports = router;

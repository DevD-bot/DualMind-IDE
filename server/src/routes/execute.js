const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const router = express.Router();

const LANG_DOCKER = {
    javascript: { image: 'node:18', cmd: 'node code.js', ext: '.js' },
    typescript: { image: 'node:18', cmd: 'npx ts-node code.ts', ext: '.ts' },
    python: { image: 'python:3.9-slim', cmd: 'python code.py', ext: '.py' },
    python3: { image: 'python:3.9-slim', cmd: 'python3 code.py', ext: '.py' },
    go: { image: 'golang:1.20', cmd: 'go run code.go', ext: '.go' },
    bash: { image: 'alpine', cmd: 'sh code.sh', ext: '.sh' },
    cpp: { image: 'gcc', cmd: 'g++ code.cpp -o out && ./out', ext: '.cpp' },
};

// POST /api/execute  { language, code, socketId }
router.post('/', (req, res) => {
    const { language = 'javascript', code, socketId } = req.body;
    const io = global._io;

    const emit = (event, data) => {
        if (socketId && io) io.to(socketId).emit(event, data);
    };

    const runner = LANG_DOCKER[language.toLowerCase()];
    if (!runner) return res.status(400).json({ error: `Language '${language}' not supported` });

    // Create a unique temporary directory for the execution
    const execId = `dualmind_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const execDir = path.join(os.tmpdir(), execId);

    try {
        fs.mkdirSync(execDir, { recursive: true });
        fs.writeFileSync(path.join(execDir, `code${runner.ext}`), code, 'utf-8');
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

    const dockerArgs = [
        'run', '--rm',
        '-v', `${execDir}:/app`,
        '-w', '/app',
        // Optional resource limits: '-m', '256m', '--cpus', '1',
        runner.image,
        'sh', '-c', runner.cmd
    ];

    const proc = spawn('docker', dockerArgs, { timeout: 30000 });

    res.json({ ok: true, pid: proc.pid });

    proc.stdout.on('data', d => emit('terminal:stdout', d.toString()));
    proc.stderr.on('data', d => emit('terminal:stderr', d.toString()));
    proc.on('close', code => {
        emit('terminal:exit', { code });
        try { fs.rmSync(execDir, { recursive: true, force: true }); } catch { }
    });
    proc.on('error', e => emit('terminal:error', e.message));
});

module.exports = router;

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');
const os = require('os');
const pty = require('node-pty');


const filesRouter = require('./routes/files');
const executeRouter = require('./routes/execute');
const gitRouter = require('./routes/git');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Attach io to every request so routes can emit
app.use((req, _, next) => { req.io = io; next(); });

app.use('/api/files', filesRouter);
app.use('/api/execute', executeRouter);
app.use('/api/git', gitRouter);

app.get('/', (_, res) => res.json({
    name: 'DualMind IDE — Backend API',
    status: '✅ Running',
    version: '2.0.0',
    endpoints: ['/api/files', '/api/execute', '/api/git', '/health'],
    time: new Date().toISOString()
}));

app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

io.on('connection', socket => {
    console.log('[WS] client connected:', socket.id);

    let ptyProcess = null;

    socket.on('terminal:spawn', ({ cwd, cols, rows }) => {
        if (ptyProcess) return;
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: cols || 80,
            rows: rows || 24,
            cwd: cwd || process.env.HOME || process.cwd(),
            env: process.env
        });

        ptyProcess.onData(data => {
            socket.emit('terminal:data', data);
        });

        ptyProcess.onExit(() => {
            socket.emit('terminal:exit');
            ptyProcess = null;
        });
    });

    socket.on('terminal:data', (data) => {
        if (ptyProcess) ptyProcess.write(data);
    });

    socket.on('terminal:resize', ({ cols, rows }) => {
        if (ptyProcess) {
            try { ptyProcess.resize(cols, rows); } catch (e) { }
        }
    });

    socket.on('disconnect', () => {
        console.log('[WS] client disconnected:', socket.id);
        if (ptyProcess) ptyProcess.kill();
    });
});

// Make io accessible globally for execute route
global._io = io;

const PORT = process.env.PORT || 3001;

// Setup Yjs Websocket server sharing the same port
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (request, socket, head) => {
    if (request.url.startsWith('/yjs')) {
        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request);
        });
    }
});
wss.on('connection', (ws, req) => {
    setupWSConnection(ws, req);
});

server.listen(PORT, () => console.log(`[DualMind Server] running on http://localhost:${PORT}`));

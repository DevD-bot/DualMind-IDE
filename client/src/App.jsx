import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStore } from './store/index.js';
import Shell from './components/Layout/Shell.jsx';
import './index.css';

export default function App() {
  const setSocketId = useStore(s => s.setSocketId);
  const addTerminalLine = useStore(s => s.addTerminalLine);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:3001`);
    socketRef.current = socket;
    socket.on('connect', () => setSocketId(socket.id));
    socket.on('terminal:stdout', d => addTerminalLine({ type: 'out', text: d }));
    socket.on('terminal:stderr', d => addTerminalLine({ type: 'err', text: d }));
    socket.on('terminal:exit', d => addTerminalLine({ type: 'exit', text: `\nProcess exited (code ${d.code})\n` }));
    socket.on('terminal:error', d => addTerminalLine({ type: 'err', text: `Error: ${d}` }));
    return () => socket.disconnect();
  }, []);

  return <Shell />;
}

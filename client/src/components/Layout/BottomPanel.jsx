import React from 'react';
import { useStore } from '../../store/index.js';
import Terminal from '../Terminal/Terminal.jsx';

export default function BottomPanel() {
    const toggleBottomPanel = useStore(s => s.toggleBottomPanel);
    return (
        <div className="bottom-panel">
            <div className="bp-tabs">
                <span className="bp-tab bp-tab-active">Terminal</span>
                <button className="bp-close" onClick={toggleBottomPanel}>✕</button>
            </div>
            <Terminal />
        </div>
    );
}

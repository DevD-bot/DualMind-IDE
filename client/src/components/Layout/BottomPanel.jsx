import React, { useRef, useEffect } from 'react';
import { useStore } from '../../store/index.js';
import Terminal from '../Terminal/Terminal.jsx';

export default function BottomPanel() {
    const toggleBottomPanel = useStore(s => s.toggleBottomPanel);
    const bottomPanelHeight = useStore(s => s.bottomPanelHeight);
    const setBottomPanelHeight = useStore(s => s.setBottomPanelHeight);
    const isDragging = useRef(false);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current) return;
            const newHeight = window.innerHeight - e.clientY - 22; // Subtract status bar (22px)
            if (newHeight > 100 && newHeight < window.innerHeight - 100) {
                setBottomPanelHeight(newHeight);
            }
        };
        const onMouseUp = () => {
            if (isDragging.current) {
                isDragging.current = false;
                document.body.style.cursor = 'default';
                // Trigger global resize event to refresh xterm
                window.dispatchEvent(new Event('resize'));
            }
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [setBottomPanelHeight]);

    return (
        <div className="bottom-panel" style={{ height: bottomPanelHeight, position: 'relative' }}>
            <div
                className="bp-resizer"
                onMouseDown={() => {
                    isDragging.current = true;
                    document.body.style.cursor = 'row-resize';
                }}
            />
            <div className="bp-tabs">
                <span className="bp-tab bp-tab-active">Terminal</span>
                <button className="bp-close" onClick={toggleBottomPanel}>✕</button>
            </div>
            <Terminal />
        </div>
    );
}

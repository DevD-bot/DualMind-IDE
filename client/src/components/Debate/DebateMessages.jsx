import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/index.js';

const TYPE_CLASSES = {
    archie: 'dm-archie', optix: 'dm-optix', judge: 'dm-judge',
    plan: 'dm-plan', error: 'dm-error', divider: 'dm-divider'
};

function DebateMessage({ msg }) {
    if (msg.type === 'divider') {
        return <div className="dm-divider-row"><span>── {msg.filename} ──</span></div>;
    }
    return (
        <div className={`dm-msg ${TYPE_CLASSES[msg.type] || ''}`}>
            <div className="dm-header">
                <span className="dm-agent">{msg.label}</span>
                {msg.tag && <span className="dm-tag">{msg.tag}</span>}
            </div>
            <div className="dm-body" dangerouslySetInnerHTML={{
                __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                    .replace(/\n/g, '<br/>')
            }} />
        </div>
    );
}

export default function DebateMessages() {
    const messages = useStore(s => s.debateMessages);
    const isDebating = useStore(s => s.isDebating);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    if (!messages.length && !isDebating) {
        return (
            <div className="dm-empty">
                <div className="dm-empty-icon">⚔</div>
                <p>Archie and Optix are ready to debate.<br />Enter a prompt and click Debate.</p>
            </div>
        );
    }
    return (
        <div className="dm-scroll">
            {messages.map(m => <DebateMessage key={m.id} msg={m} />)}
            {isDebating && (
                <div className="dm-typing">
                    <span className="dm-dot"></span><span className="dm-dot"></span><span className="dm-dot"></span>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}

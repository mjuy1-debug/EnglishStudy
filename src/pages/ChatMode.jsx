import React from 'react';
import ChatInterface from '../components/ChatInterface';

const ChatMode = () => {
    return (
        <div className="path-page animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="section-header" style={{ paddingBottom: '0.5rem' }}>
                <h2>AI 튜터</h2>
            </div>
            <ChatInterface />
        </div>
    );
};

export default ChatMode;

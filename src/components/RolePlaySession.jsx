import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, ArrowLeft, Volume2 } from 'lucide-react';
import { sendMessageToAI } from '../services/aiService';
import { speakText } from '../services/ttsService'; // Added TTS import
import './ChatInterface.css'; // Reuse chat styles for consistency

const RolePlaySession = ({ scenario, onExit }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            english: scenario.initialMessage.english,
            korean: scenario.initialMessage.korean
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-speak whenever a new assistant message is added
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            // Small delay for natural feel
            setTimeout(() => {
                speakText(lastMsg.english);
            }, 500);
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendMessageToAI(input, messages);
            setMessages(prev => [...prev, { role: 'assistant', ...response }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="roleplay-header">
                <button onClick={onExit} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h3 className="roleplay-title">{scenario.emoji} {scenario.title}</h3>
                    <p className="roleplay-mission">Mission: {scenario.mission}</p>
                </div>
            </div>

            <div className="messages-area">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.role}`}>
                        {msg.role === 'assistant' ? (
                            <>
                                <div className="bubble-content assistant">
                                    <span className="role-badge">{scenario.aiRole}</span>
                                    <p className="msg-en">{msg.english}</p>
                                    <p className="msg-ko">{msg.korean}</p>
                                </div>
                                <button
                                    className="action-btn"
                                    onClick={() => speakText(msg.english)}
                                    aria-label="Play Audio"
                                    style={{ marginTop: '0.25rem', marginLeft: '0.5rem' }}
                                >
                                    <Volume2 size={16} />
                                </button>
                            </>
                        ) : (
                            <div className="bubble-content user">
                                <p>{msg.content}</p>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="message-bubble assistant">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Area */}
            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].suggestions && (
                <div className="suggestions-container">
                    {messages[messages.length - 1].suggestions.map((sugg, idx) => {
                        const isObj = typeof sugg === 'object';
                        const text = isObj ? sugg.english : sugg;
                        const sub = isObj ? sugg.korean : null;

                        return (
                            <button
                                key={idx}
                                className="suggestion-chip"
                                onClick={() => {
                                    setInput(text);
                                    setTimeout(() => document.querySelector('.send-btn').click(), 0);
                                }}
                            >
                                <span className="sugg-en">{text}</span>
                                {sub && <span className="sugg-ko">{sub}</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            <form className="input-area" onSubmit={handleSend}>
                <button type="button" className="mic-btn">
                    <Mic size={20} />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    disabled={isLoading}
                />
                <button type="submit" className="send-btn" disabled={!input.trim() || isLoading}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default RolePlaySession;

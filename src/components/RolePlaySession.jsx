import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, ArrowLeft, Volume2 } from 'lucide-react';
import { sendMessageToAI } from '../services/aiService';
import { speakText } from '../services/ttsService'; // Added TTS import
import './ChatInterface.css'; // Reuse chat styles for consistency

import useSpeechRecognition from '../hooks/useSpeechRecognition';

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

    const submitMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendMessageToAI(text, messages);
            setMessages(prev => [...prev, { role: 'assistant', ...response }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        submitMessage(input);
    };

    const handleSpeechEnd = (text) => {
        if (text && text.trim()) {
            setInput(text);
            submitMessage(text);
        }
    };

    const { isListening, startListening } = useSpeechRecognition(handleSpeechEnd);

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
                                    submitMessage(text);
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
                <button
                    type="button"
                    className={`mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={startListening}
                    style={{ backgroundColor: isListening ? '#ef4444' : undefined, color: isListening ? 'white' : undefined }}
                >
                    <Mic size={20} />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Type your response..."}
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

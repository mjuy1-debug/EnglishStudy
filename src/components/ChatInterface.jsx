import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Star } from 'lucide-react';
import { sendMessageToAI } from '../services/aiService';
import { getBookmarks, addBookmark, removeBookmark, isBookmarked } from '../services/storageService';
import { incrementSpeakingCount } from '../services/userService';
import { speakText } from '../services/ttsService';
import './ChatInterface.css';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            english: "Hi there! Let's practice English. What's on your mind?",
            korean: "안녕하세요! 영어를 연습해봐요. 무슨 생각을 하고 계신가요?",
            suggestions: [
                { english: "I want to study English.", korean: "영어 공부를 하고 싶어요." },
                { english: "How are you today?", korean: "오늘 기분 어때요?" },
                { english: "Tell me a joke.", korean: "농담 하나 해주세요." }
            ]
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [, forceUpdate] = useState(0);
    const messagesEndRef = useRef(null);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-speak whenever a new assistant message is added
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            // Check if it's the initial message or a response
            // Add small delay for natural feel
            const timer = setTimeout(() => {
                speakText(lastMsg.english);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const submitMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Gamification: Count this as speaking
        incrementSpeakingCount(1);

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

    // STT Hook
    // Pass handleSpeechEnd to auto-send when speech stops
    const { isListening, transcript, startListening, stopListening, hasRecognition } = useSpeechRecognition(handleSpeechEnd);

    // Sync transcript to input while listening for visual feedback
    useEffect(() => {
        if (isListening && transcript) {
            setInput(transcript);
        }
    }, [isListening, transcript]);

    const toggleBookmark = (msg) => {
        if (isBookmarked(msg.english)) {
            const saved = getBookmarks().find(b => b.english === msg.english);
            if (saved) removeBookmark(saved.id);
        } else {
            addBookmark(msg);
        }
        forceUpdate(prev => prev + 1);
    };

    return (
        <div className="chat-container">
            <div className="messages-area">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.role}`}>
                        {msg.role === 'assistant' ? (
                            <>
                                <div className="bubble-content assistant">
                                    <p className="msg-en">{msg.english}</p>
                                    <p className="msg-ko">{msg.korean}</p>
                                    {msg.correction && (
                                        <div className="correction-box">
                                            <span className="correction-label">Tip:</span> {msg.correction}
                                        </div>
                                    )}
                                </div>
                                <div className="msg-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '0.5rem' }}>
                                    <button
                                        className="action-btn"
                                        onClick={() => speakText(msg.english)}
                                        aria-label="Play Audio"
                                    >
                                        <Volume2 size={16} />
                                    </button>
                                    <button
                                        className={`action-btn ${isBookmarked(msg.english) ? 'active' : ''}`}
                                        onClick={() => toggleBookmark(msg)}
                                        aria-label="Bookmark"
                                        style={{ color: isBookmarked(msg.english) ? '#f59e0b' : 'inherit' }}
                                    >
                                        <Star size={16} fill={isBookmarked(msg.english) ? '#f59e0b' : 'none'} />
                                    </button>
                                </div>
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
                <button
                    type="button"
                    className={`mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={handleMicClick}
                    disabled={!hasRecognition}
                    style={{ position: 'relative' }}
                >
                    <Mic size={20} color={isListening ? '#ef4444' : 'currentColor'} />
                    {isListening && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            animation: 'pulse 1s infinite'
                        }}></span>
                    )}
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "메시지를 입력하세요..."}
                    disabled={isLoading}
                />
                <button type="submit" className="send-btn" disabled={!input.trim() || isLoading}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;

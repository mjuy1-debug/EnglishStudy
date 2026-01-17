import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DailyBibleCard from '../components/DailyBibleCard';
import DailyGoalCard from '../components/DailyGoalCard';
import { getUser, subscribeUser } from '../services/userService';
import './HomeTab.css';

const HomeTab = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUser());

    useEffect(() => {
        // Subscribe to user updates (e.g. name change, level up)
        const unsubscribe = subscribeUser((updatedUser) => {
            setUser(updatedUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="path-page animate-fade-in home-container">
            <div className="home-header">
                <h2>Hello, {user.name}! 👋</h2>
                <p>Ready to speak English today?</p>
            </div>

            <DailyGoalCard />
            <DailyBibleCard />

            <div style={{ marginTop: '2rem' }}>
                <h3 className="section-title">Start Learning</h3>

                <div className="action-grid">
                    <button
                        className="action-card card-freetalk"
                        onClick={() => navigate('/chat')}
                    >
                        <span className="card-icon">🗣️</span>
                        <span className="card-title">FREE TALKING</span>
                        <p className="card-desc">AI와 자유롭게 대화하기</p>
                    </button>

                    <button
                        className="action-card card-roleplay"
                        onClick={() => navigate('/roleplay')}
                    >
                        <span className="card-icon">🎭</span>
                        <span className="card-title">ROLE PLAY</span>
                        <p className="card-desc">실전 상황극 연습</p>
                    </button>

                    <button
                        className="action-card card-pattern"
                        style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                        onClick={() => navigate('/pattern')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                            <span className="card-icon" style={{ marginBottom: 0 }}>🔁</span>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <span className="card-title" style={{ display: 'block' }}>DAILY PATTERN</span>
                                <p className="card-desc">오늘의 핵심 패턴 연습</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <button
                        className="action-card card-review"
                        onClick={() => navigate('/review')}
                    >
                        <span className="card-icon">⭐</span>
                        <span className="card-title">MY VOCABULARY</span>
                        <p className="card-desc">나만의 단어장 복습</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;

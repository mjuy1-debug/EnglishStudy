import React, { useState } from 'react';
import { Volume2, Trash2, ArrowLeft, Star, Play, Mic, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, removeBookmark } from '../services/storageService';
import { speakText } from '../services/ttsService';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const ReviewPage = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState(() => getBookmarks());
    const [isQuizMode, setIsQuizMode] = useState(false);

    // Quiz State
    const [quizCards, setQuizCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quizStatus, setQuizStatus] = useState('question'); // 'question', 'listening', 'success', 'fail'
    const [score, setScore] = useState(0);

    // STT
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    const loadBookmarks = () => {
        setBookmarks(getBookmarks());
    };

    const handleDelete = (id) => {
        removeBookmark(id);
        loadBookmarks();
    };

    const startQuiz = () => {
        if (bookmarks.length === 0) return;
        // Shuffle cards
        const shuffled = [...bookmarks].sort(() => 0.5 - Math.random());
        setQuizCards(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setQuizStatus('question');
        setIsQuizMode(true);
    };

    const handleSpeakAnswer = () => {
        if (isListening) {
            stopListening();
            checkAnswer(transcript);
        } else {
            startListening();
            setQuizStatus('listening');
        }
    };

    // Auto-check when transcript updates significantly? 
    // For now, let's stick to manual stop or simple check logic if needed.
    // But better reuse the pattern from PatternPractice or generic approach.
    // Here we'll check when user stops manually or we can check periodically if we want real-time.
    // Let's rely on manual toggle for better control in this prompt interactions.

    // Actually, users prefer auto-stop often. Let's try: if silence? No, API handles some.
    // Let's keep manual toggle 'Done' or similar for now, OR check on stop.
    // Update: Using manual button tap to stop & check is reliable.

    const checkAnswer = (spokenText) => {
        const target = quizCards[currentIndex].english;
        const cleanSpoken = spokenText.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Loose matching
        if (cleanSpoken.length > 2 && (cleanTarget.includes(cleanSpoken) || cleanSpoken.includes(cleanTarget))) {
            setQuizStatus('success');
            speakText("Correct!");
            setScore(prev => prev + 1);
        } else {
            setQuizStatus('fail');
            speakText("Nice try, let's listen.");
            setTimeout(() => speakText(target), 1000);
        }
    };

    const nextCard = () => {
        if (currentIndex < quizCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setQuizStatus('question');
        } else {
            setQuizStatus('complete');
            speakText(`Quiz complete! You got ${score + (quizStatus === 'success' ? 0 : 0)} out of ${quizCards.length}`);
        }
    };

    const exitQuiz = () => {
        setIsQuizMode(false);
        setQuizStatus('question');
    };

    // ----- RENDER -----

    if (isQuizMode) {
        if (quizStatus === 'complete') {
            return (
                <div className="path-page animate-fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    <CheckCircle size={80} color="#10b981" style={{ marginBottom: '1rem' }} />
                    <h2>퀴즈 완료!</h2>
                    <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                        총 {quizCards.length}문제 중 <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{score}</span>개 성공
                    </p>
                    <button className="btn-primary" onClick={exitQuiz}>목록으로 돌아가기</button>
                    <button className="action-btn" style={{ marginTop: '1rem' }} onClick={startQuiz}>다시 하기</button>
                </div>
            );
        }

        const currentCard = quizCards[currentIndex];

        return (
            <div className="path-page animate-fade-in">
                <div className="section-header">
                    <button onClick={exitQuiz} className="back-btn"><ArrowLeft size={24} /></button>
                    <span>Speaking Quiz ({currentIndex + 1}/{quizCards.length})</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#6366f1' }}>{score} pts</span>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    {/* HINT / QUESTION AREA */}
                    <div className="card" style={{ width: '100%', minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>이 문장을 영어로 말해보세요</p>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', wordBreak: 'keep-all', textAlign: 'center' }}>
                            {currentCard.korean}
                        </h2>
                    </div>

                    {/* FEEDBACK AREA */}
                    <div style={{ minHeight: '60px', textAlign: 'center' }}>
                        {quizStatus === 'success' && (
                            <div className="animate-fade-in" style={{ color: '#10b981' }}>
                                <CheckCircle size={40} style={{ margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentCard.english}</p>
                            </div>
                        )}
                        {quizStatus === 'fail' && (
                            <div className="animate-fade-in" style={{ color: '#ef4444' }}>
                                <XCircle size={40} style={{ margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentCard.english}</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    내가 말한 것: "{transcript || '...'}"
                                </p>
                            </div>
                        )}
                        {(quizStatus === 'question' || quizStatus === 'listening') && (
                            <p style={{ fontSize: '1.1rem', color: isListening ? '#ef4444' : 'var(--text-tertiary)', fontWeight: '500' }}>
                                {isListening ? transcript || "듣고 있어요..." : "마이크를 누르고 말하세요"}
                            </p>
                        )}
                    </div>

                    {/* CONTROLS */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {quizStatus === 'success' || quizStatus === 'fail' ? (
                            <button className="btn-primary" style={{ width: '200px' }} onClick={nextCard}>
                                다음 문제 <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        ) : (
                            <button
                                className={`mic-btn-large ${isListening ? 'listening' : ''}`}
                                onClick={handleSpeakAnswer}
                                style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: isListening ? '#ef4444' : 'var(--primary-color)',
                                    color: 'white', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Mic size={32} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="path-page animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} className="back-btn" style={{ padding: '0.25rem' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>나만의 문장장</h2>
            </div>

            {/* ACTION BAR */}
            <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                <button
                    onClick={startQuiz}
                    disabled={bookmarks.length === 0}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: bookmarks.length === 0 ? 0.5 : 1
                    }}
                >
                    <Play size={20} fill="currentColor" />
                    Speaking Quiz 시작하기
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
                {bookmarks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>
                        <Star size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>아직 저장된 문장이 없습니다.</p>
                        <p style={{ fontSize: '0.9rem' }}>채팅에서 별표(⭐)를 눌러 저장해보세요!</p>
                    </div>
                ) : (
                    bookmarks.map((item) => (
                        <div key={item.id} className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
                            <button
                                onClick={() => handleDelete(item.id)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#94a3b8' }}
                            >
                                <Trash2 size={18} />
                            </button>

                            <div style={{ paddingRight: '2rem' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{item.english}</p>
                                <p style={{ color: '#64748b' }}>{item.korean}</p>
                            </div>

                            <button
                                onClick={() => speakText(item.english)}
                                style={{
                                    marginTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--primary-color)',
                                    fontWeight: '500'
                                }}
                            >
                                <Volume2 size={18} /> 듣기
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewPage;

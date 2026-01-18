import React, { useState } from 'react';
import { ArrowLeft, Mic, Volume2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRandomPattern } from '../data/patterns';
import { speakText } from '../services/ttsService';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const PatternDrill = () => {
    const navigate = useNavigate();
    const [currentPattern, setCurrentPattern] = useState(() => getRandomPattern());
    const [step, setStep] = useState(0); // 0: Intro, 1..3: Practice
    const [isComplete, setIsComplete] = useState(false);
    const [feedback, setFeedback] = useState(null); // null, 'correct', 'retry'

    // Define currentExample based on step
    const currentExample = step > 0 ? currentPattern.examples[step - 1] : null;

    const nextStep = () => {
        if (step < currentPattern.examples.length) {
            setStep(step + 1);
            setFeedback(null);
        } else {
            setIsComplete(true);
            speakText("Lesson complete!");
        }
    };

    const [feedbackMessage, setFeedbackMessage] = useState('');

    const checkAnswer = (spokenText) => {
        if (!spokenText) return;

        // If we are not in practice step, ignore
        if (step === 0 || isComplete || !currentExample) return;

        const cleanTranscript = spokenText.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
        const cleanTarget = currentExample.en.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

        // 1. Calculate simple overlap
        const spokenWords = cleanTranscript.split(/\s+/);
        const targetWords = cleanTarget.split(/\s+/);

        let matchCount = 0;
        spokenWords.forEach(word => {
            if (targetWords.includes(word)) matchCount++;
        });

        const accuracy = matchCount / targetWords.length;

        // Relaxed criteria: 60% words match OR transcript contains the core pattern (simplistic check)
        const passed = accuracy >= 0.6 || cleanTarget === cleanTranscript;

        if (passed) {
            setFeedback('correct');
            setFeedbackMessage('');
            speakText("Great job!");
            setTimeout(() => {
                nextStep();
            }, 1500);
        } else {
            setFeedback('retry');
            setFeedbackMessage(`You said: "${spokenText}"`);
            speakText("Let's try that again. Listen closely.");
        }
    };

    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition(checkAnswer);

    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            setFeedback(null);
            startListening();
        }
    };

    const handleRestart = () => {
        setCurrentPattern(getRandomPattern());
        setStep(0);
        setIsComplete(false);
        setFeedback(null);
    };

    if (isComplete) {
        return (
            <div className="path-page animate-fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <CheckCircle size={80} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h2>패턴 학습 완료!</h2>
                <p>오늘의 중요 패턴을 마스터하셨어요.</p>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleRestart}>다른 패턴 더 연습하기</button>
                    <button className="card" onClick={() => navigate('/')}>홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="path-page animate-fade-in">
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={24} /></button>
                <h2>패턴 드릴</h2>
            </div>

            {step === 0 ? (
                // Introduction Step
                <div style={{ marginTop: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <p style={{ color: 'var(--primary-color)', fontWeight: '700', marginBottom: '0.5rem' }}>오늘의 핵심 패턴</p>
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{currentPattern.pattern}</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>"{currentPattern.meaning}"</p>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={() => setStep(1)}>
                        연습 시작하기
                    </button>
                </div>
            ) : (
                // Practice Steps
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.5rem' }}>
                        <span>Step {step} / 3</span>
                        <span>{currentPattern.pattern}</span>
                    </div>

                    <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {currentExample.ko}
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            {feedback === 'correct' ? (
                                <h3 style={{ color: '#10b981', fontSize: '1.4rem' }}>{currentExample.en}</h3>
                            ) : (
                                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.4rem' }}>
                                    {isListening ? transcript || "말씀해주세요..." : "__________"}
                                </h3>
                            )}
                        </div>

                        <button
                            className={`btn-primary ${isListening ? 'listening-pulse' : ''}`}
                            style={{
                                borderRadius: '50%',
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isListening ? '#ef4444' : 'var(--primary-color)'
                            }}
                            onClick={handleToggleListening}
                        >
                            <Mic size={32} />
                        </button>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                            {isListening ? "듣고 있어요..." : "버튼을 누르고 영어로 말해보세요"}
                        </p>

                        {feedback === 'retry' && (
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                                <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.8rem' }}>다시 한번 시도해보세요!</p>
                                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', minWidth: '50px', color: '#666' }}>정답:</span>
                                        <span style={{ color: '#059669', fontWeight: '500' }}>{currentExample.en}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', minWidth: '50px', color: '#666' }}>인식:</span>
                                        <span style={{ color: '#dc2626' }}>{feedbackMessage.replace('You said: ', '').replace(/"/g, '')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => speakText(currentExample.en)}
                            style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}
                        >
                            <Volume2 size={18} /> 정답 듣기
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .listening-pulse {
                    animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
};

export default PatternDrill;

import React, { useState, useEffect } from 'react';
import { RefreshCw, BookOpen, Heart, AlertCircle } from 'lucide-react';
import { getRandomVerse, saveVerseToHistory } from '../data/bibleVerses';
import { getDailyVerseFromAI } from '../services/aiService';
import './DailyBibleCard.css';

const DailyBibleCard = () => {
    const [verse, setVerse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    const handleRefresh = async () => {
        if (loading || cooldown > 0) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            // Try AI generation first
            const aiVerse = await getDailyVerseFromAI();

            if (aiVerse) {
                setVerse(aiVerse);
                localStorage.setItem('speakflow_daily_verse', JSON.stringify(aiVerse));
                saveVerseToHistory(aiVerse); // Accumulate for offline random
                setCooldown(10); // 10s safety cooldown
            } else {
                // Determine why AI failed? (Likely network or key)
                console.warn("AI returned null, using fallback.");
                const fallback = getRandomVerse();
                setVerse(fallback);
                localStorage.setItem('speakflow_daily_verse', JSON.stringify(fallback));
                setErrorMsg("Offline / Fallback Data");
            }
        } catch (error) {
            console.error("Failed to fetch verse:", error);
            const fallback = getRandomVerse();
            setVerse(fallback);
            localStorage.setItem('speakflow_daily_verse', JSON.stringify(fallback));
            setErrorMsg("Network Error");
        } finally {
            setLoading(false);
        }
    };

    // Load initial verse from storage or fetch if empty
    useEffect(() => {
        const savedVerse = localStorage.getItem('speakflow_daily_verse');
        if (savedVerse) {
            try {
                setVerse(JSON.parse(savedVerse));
            } catch {
                handleRefresh();
            }
        } else {
            handleRefresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cooldown timer
    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);



    if (!verse) return <div className="bible-card skeleton"></div>;

    return (
        <div className="bible-card bounce-in">
            <div className="bible-header">
                <div className="title-row">
                    <BookOpen size={18} className="icon-main" />
                    <h3>오늘의 말씀</h3>
                    {errorMsg && (
                        <span style={{ fontSize: '0.7rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px' }}>
                            <AlertCircle size={10} /> {errorMsg}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading || cooldown > 0}
                    className={`refresh-btn ${loading ? 'spinning' : ''}`}
                    aria-label="New Verse"
                    style={{ cursor: (loading || cooldown > 0) ? 'not-allowed' : 'pointer' }}
                >
                    {cooldown > 0 ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{cooldown}</span>
                    ) : (
                        <RefreshCw size={18} />
                    )}
                </button>
            </div>

            <div className={`bible-content ${loading ? 'fade-out' : 'fade-in'}`}>
                <p className="verse-en">"{verse.verse}"</p>
                <p className="verse-ref">- {verse.reference}</p>

                <div className="divider"></div>

                <p className="verse-ko">{verse.korean || "번역을 불러오는 중..."}</p>

                {verse.reflection && (
                    <div className="reflection-box">
                        <Heart size={14} className="icon-heart" />
                        <span>{verse.reflection}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyBibleCard;

import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getUser } from '../services/userService';
import './DailyGoalCard.css';

const DailyGoalCard = () => {
    const [user, setUser] = useState(getUser());
    const { dailyProgress, stats, level, xp, nextLevelXp } = user;

    // Refresh on mount to get latest inputs from other pages
    useEffect(() => {
        const interval = setInterval(() => {
            const fresher = getUser();
            // detailed comparison or just refetch
            if (fresher.dailyProgress.count !== dailyProgress.count || fresher.xp !== xp || fresher.stats.daysStreak !== stats.daysStreak) {
                setUser(fresher);
            }
        }, 1000); // Simple polling for this MVP demo
        return () => clearInterval(interval);
    }, [dailyProgress.count, xp, stats.daysStreak]);

    const percentage = Math.min(100, Math.round((dailyProgress.count / dailyProgress.target) * 100));
    const xpPercentage = Math.min(100, Math.round((xp / nextLevelXp) * 100));
    const isGoalMet = dailyProgress.count >= dailyProgress.target;

    // SVG Circle Math
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="daily-goal-card animate-fade-in">
            <div className="goal-content">
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className="level-badge">Lv.{level}</span>
                        <div className="xp-bar-container">
                            <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.2rem', color: 'white' }}>
                        {isGoalMet ? "Goal Achieved! 🎉" : "Daily Speaking"}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                        {isGoalMet ? "Great job today!" : `${Math.max(0, dailyProgress.target - dailyProgress.count)} more to go`}
                    </p>

                    <div className="streak-badge">
                        <Flame size={16} fill="#fbbf24" color="#fbbf24" />
                        <span style={{ color: "white", fontWeight: '700' }}>
                            {stats.daysStreak} Day Streak
                        </span>
                    </div>
                </div>

                <div className="ring-container">
                    <svg
                        className="progress-ring"
                        width="90"
                        height="90"
                    >
                        <circle
                            className="progress-ring__circle-bg"
                            strokeWidth="8"
                            fill="transparent"
                            r={radius}
                            cx="45"
                            cy="45"
                        />
                        <circle
                            className="progress-ring__circle"
                            stroke="url(#ringGradient)"
                            strokeWidth="8"
                            fill="transparent"
                            r={radius}
                            cx="45"
                            cy="45"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="ring-text">
                        <span className="ring-count">{dailyProgress.count}</span>
                        <span className="ring-target">/{dailyProgress.target}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyGoalCard;

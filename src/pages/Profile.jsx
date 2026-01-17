import React, { useState, useRef, useEffect } from 'react';
import { Settings, Award, Calendar, BarChart2, Camera, Edit2, Check, X, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, getUsers, switchUser, createNewUser, subscribeUser } from '../services/userService';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUser());
    const [usersList, setUsersList] = useState(getUsers());
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user.name);
    const [showAccounts, setShowAccounts] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Subscribe to changes
        const unsubscribe = subscribeUser((updatedUser) => {
            setUser(updatedUser);
            setEditName(updatedUser.name); // Sync edit name
            setUsersList(getUsers()); // Refresh list in case of new user/switch
        });
        return () => unsubscribe();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                updateUser({ avatar: base64String }); // Listener will update state
            };
            reader.readAsDataURL(file);
        }
    };

    const saveName = () => {
        if (editName.trim()) {
            updateUser({ name: editName });
            setIsEditing(false);
        }
    };

    const cancelEdit = () => {
        setEditName(user.name);
        setIsEditing(false);
    };

    const handleAddAccount = () => {
        const name = window.prompt("새로운 사용자 이름을 입력하세요:");
        if (name && name.trim()) {
            createNewUser(name.trim());
            // Listener will handle the update
        }
    };

    const handleSwitchAccount = (targetId) => {
        if (targetId === user.id) return;
        switchUser(targetId);
    };

    return (
        <div className="path-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
            <div className="section-header">
                <h2>내 프로필</h2>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '2.5rem' }}>👤</span>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '0.3rem',
                            borderRadius: '50%',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Camera size={14} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                                style={{
                                    fontSize: '1.1rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid var(--primary-color)',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                            <button onClick={saveName} style={{ color: 'var(--primary-color)' }}><Check size={20} /></button>
                            <button onClick={cancelEdit} style={{ color: '#ef4444' }}><X size={20} /></button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{user.name}</h3>
                                <button onClick={() => setIsEditing(true)} style={{ color: 'var(--text-tertiary)' }}>
                                    <Edit2 size={16} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Level {user.level} • Passionate Learner</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}><Calendar size={24} /></div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0.5rem 0' }}>{user.stats.daysStreak}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>연속 학습일</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--secondary-color)', marginBottom: '0.5rem' }}><Award size={24} /></div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0.5rem 0' }}>{user.stats.wordsLearned}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>학습 단어</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                    <BarChart2 size={18} /> 주간 학습 현황
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', paddingBottom: '0.5rem' }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                            <div
                                style={{
                                    width: '8px',
                                    height: `${[40, 70, 30, 85, 50, 20, 10][i]}%`,
                                    backgroundColor: i === 3 ? 'var(--primary-color)' : '#e2e8f0',
                                    borderRadius: '4px'
                                }}
                            ></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Management Section */}
            <div className="card" style={{ marginTop: '1rem', padding: '0' }}>
                <button
                    onClick={() => setShowAccounts(!showAccounts)}
                    style={{ width: '100%', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        <Users size={20} /> 계정 전환
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', transform: showAccounts ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.2s' }}>&gt;</span>
                </button>

                {showAccounts && (
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            {usersList.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => handleSwitchAccount(u.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: u.id === user.id ? 'var(--primary-color)' : '#f8fafc',
                                        color: u.id === user.id ? 'white' : 'inherit',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                    }}>
                                        {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%' }} /> : '👤'}
                                    </div>
                                    <span style={{ flex: 1, fontWeight: '500' }}>{u.name}</span>
                                    {u.id === user.id && <Check size={16} />}
                                </button>
                            ))}

                            <button
                                onClick={handleAddAccount}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px dashed #cbd5e1',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    marginTop: '0.5rem'
                                }}
                            >
                                <Plus size={16} /> 계정 추가
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <button
                className="card"
                style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '1rem 1.5rem' }}
                onClick={() => navigate('/settings')}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                    <Settings size={20} /> 설정
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>&gt;</span>
            </button>
        </div>
    );
};

export default Profile;

import React, { useState } from 'react';
import { ArrowLeft, Moon, Bell, RefreshCw, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, resetUserProgress } from '../services/userService';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());

  const handleToggle = (key) => {
    const newSettings = { ...user.settings, [key]: !user.settings[key] };
    const updated = updateUser({ settings: newSettings });
    setUser(updated);

    // Apply theme immediately (simplified logic)
    if (key === 'darkMode') {
      // In a real app, you'd use a context or global class
      alert('다크 모드 설정이 저장되었습니다. (실제 적용은 테마 시스템 연동 필요)');
    }
  };

  const handleReset = () => {
    if (window.confirm('모든 학습 기록을 초기화하시겠습니까?')) {
      const reset = resetUserProgress();
      setUser(reset);
      alert('초기화되었습니다.');
    }
  };

  return (
    <div className="path-page animate-fade-in">
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="back-btn" style={{ padding: '0.25rem' }}>
          <ArrowLeft size={24} />
        </button>
        <h2>설정</h2>
      </div>

      <div className="setting-section" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>앱 설정</h3>

        <div className="card setting-item">
          <div className="setting-icon"><Moon size={20} /></div>
          <div className="setting-info">
            <span>다크 모드</span>
          </div>
          <div className={`toggle-switch ${user.settings.darkMode ? 'active' : ''}`} onClick={() => handleToggle('darkMode')}>
            <div className="toggle-knob"></div>
          </div>
        </div>

        <div className="card setting-item">
          <div className="setting-icon"><Bell size={20} /></div>
          <div className="setting-info">
            <span>알림 설정</span>
            <p>매일 학습 알림 받기</p>
          </div>
          <div className={`toggle-switch ${user.settings.notifications ? 'active' : ''}`} onClick={() => handleToggle('notifications')}>
            <div className="toggle-knob"></div>
          </div>
        </div>
      </div>

      <div className="setting-section" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>데이터 관리</h3>

        <button className="card setting-item clickable" onClick={handleReset}>
          <div className="setting-icon" style={{ color: '#ef4444' }}><RefreshCw size={20} /></div>
          <div className="setting-info">
            <span style={{ color: '#ef4444' }}>학습 기록 초기화</span>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
        </button>

        <button className="card setting-item clickable" style={{ marginTop: '0.5rem' }}>
          <div className="setting-icon" style={{ color: '#ef4444' }}><Trash2 size={20} /></div>
          <div className="setting-info">
            <span style={{ color: '#ef4444' }}>계정 삭제</span>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>

      <style>{`
        .setting-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }
        .clickable:active {
          transform: scale(0.98);
          background-color: var(--bg-tertiary);
        }
        .setting-icon {
          color: var(--text-secondary);
        }
        .setting-info {
          flex: 1;
        }
        .setting-info span {
          display: block;
          font-weight: 500;
        }
        .setting-info p {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }
        .toggle-switch {
          width: 50px;
          height: 28px;
          background-color: var(--bg-tertiary);
          border-radius: 14px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .toggle-switch.active {
          background-color: var(--primary-color);
        }
        .toggle-knob {
          width: 24px;
          height: 24px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .toggle-switch.active .toggle-knob {
          transform: translateX(22px);
        }
      `}</style>
    </div>
  );
};

export default Settings;

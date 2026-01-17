import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Drama, User } from 'lucide-react';
import './Layout.css'; // We'll create this for specific layout styles if needed, or use inline/global

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/chat', label: '레슨/채팅', icon: MessageCircle },
    { path: '/roleplay', label: '롤플레이', icon: Drama },
    { path: '/profile', label: '프로필', icon: User },
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="app-layout container">
      <header className="app-header">
        {/* Dynamic Header could go here */}
        <h1 className="logo-text">SpeakFlow</h1>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomeTab from './pages/HomeTab';
import ChatMode from './pages/ChatMode';
import RolePlayMode from './pages/RolePlayMode';
import ReviewPage from './pages/ReviewPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PatternDrill from './pages/PatternDrill';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeTab />} />
          <Route path="chat" element={<ChatMode />} />
          <Route path="roleplay" element={<RolePlayMode />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="pattern" element={<PatternDrill />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

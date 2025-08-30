import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/HomePage'
import About from './pages/AboutPage'
import Account from './pages/AccountPage';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Aurora from './components/Aurora'
import { Avatar } from '@mui/material';
import FlowingMenu from './components/FlowingMenu'
import authService from './services/authService';
import KeywordInsightsPage from './pages/KeywordInsightsPage';
import ReadabilityScorePage from './pages/ReadabilityScorePage';


function AppContent() {
  const items = [
    { label: "Home", href: '/' },
    { label: "About", href: '/about' },
    { label: "Keyword Insights", href: '/keyword-insights' },
    { label: "Readability Score", href: '/readability-score' },
  ];
  
  const path = window.location.pathname;
  const initialActiveIndex = items.findIndex(item => item.href === path);

  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  
  // Listen for authentication changes
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(authService.isAuthenticated());
      setUser(authService.getCurrentUser());
    };
    
    // Check auth status on mount
    checkAuthStatus();
    
    // Set up periodic check for auth status changes
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if backend logout fails
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const getMenuItems = () => {
    if (isLoggedIn) {
      return [
        { link: '/account', text: 'Account', action: () => { navigate('/account'); handleMenuClose(); } },
        { link: '#', text: 'Log Out', action: () => { handleLogout(); handleMenuClose(); } },
      ];
    } else {
      return [
        { link: '/login', text: 'Login', action: () => { navigate('/login'); handleMenuClose(); } },
        { link: '/register', text: 'Register', action: () => { navigate('/register'); handleMenuClose(); } },
      ];
    }
  };
  const [menuOpen, setMenuOpen] = React.useState(false);

  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const [message, setMessage] = useState("");


  const getAvatarInitials = () => {
    if (user) {
      // Try different name fields from Django user model
      const name = user.username || user.first_name || user.email?.split('@')[0] || 'User';
      if (user.first_name && user.last_name) {
        return (user.first_name[0] + user.last_name[0]).toUpperCase();
      }
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'G';
  };

  return (
      <div className="app-container">
        <div className="aurora-background">
          <Aurora
            colorStops={["#667eea", "#764ba2", "#667eea", "#764ba2"]}
            blend={0.3}
            amplitude={0.8}
            speed={0.5}
          />
        </div>
        <nav className="main-nav">
          {items.map((item, idx) => (
            <Link
              key={item.href}
              to={item.href}
              className={`nav-link ${initialActiveIndex === idx ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="user-menu-container">
          <div
            ref={menuRef}
            className="user-menu-wrapper"
          >
            <Avatar
              className='user-avatar'
              onClick={() => setMenuOpen((open) => !open)}
            >
              {getAvatarInitials()}
            </Avatar>
            {menuOpen && (
              <div className='dropdown-menu'>
                <FlowingMenu 
                  items={getMenuItems()} 
                />
              </div>
            )}
          </div>
        </div>
        <div className="page-content">
          <Routes>
            {items.map(item => (
              <Route
                key={item.href}
                path={item.href}
                element={
                  item.href === '/' ? <Home /> :
                  item.href === '/about' ? <About /> :
                  item.href === '/keyword-insights' ? <KeywordInsightsPage /> :
                  item.href === '/readability-score' ? <ReadabilityScorePage /> :
                  null
                }
              />
            ))}
            <Route path='/account' element={<Account user={user} />} />
            <Route path='/login' element={<Login onLogin={handleLogin} />} />
            <Route path='/register' element={<Register onLogin={handleLogin} />} />
          </Routes>
        </div>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App

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
import axios from "axios";

function AppContent() {
  const items = [
    { label: "Home", href: '/' },
    { label: "About", href: '/about' },
  ];
  
  const path = window.location.pathname;
  const initialActiveIndex = items.findIndex(item => item.href === path);

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/');
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

  useEffect(() => {
    axios
    .get("http://127.0.0.1:8000/health/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  }, []);

  const getAvatarInitials = () => {
    if (user && user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
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
                  null
                }
              />
            ))}
            <Route path='/account' element={<Account user={user} />} />
            <Route path='/login' element={<Login onLogin={handleLogin} />} />
            <Route path='/register' element={<Register onLogin={handleLogin} />} />
          </Routes>
        </div>
        <div className="server-status">{message ? message : "Loading..."}</div>
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

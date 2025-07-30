import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, href } from 'react-router-dom'
import './App.css'
import Home from './pages/HomePage'
import About from './pages/AboutPage'
import Account from './pages/AccountPage';
import Aurora from './components/Aurora'
import { Avatar } from '@mui/material';
import FlowingMenu from './components/FlowingMenu'
import axios from "axios";

function App() {
  const items = [
    { label: "Home", href: '/' },
    { label: "About", href: '/about' },
  ];
  
  const path = window.location.pathname;
  const initialActiveIndex = items.findIndex(item => item.href === path);

  const MenuItems = [
    { link: '/account', text: 'Account' },
    { link: '#', text: 'Log Out' },
  ];
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

  return (
    <Router>
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
            <a
              key={item.href}
              href={item.href}
              className={`nav-link ${initialActiveIndex === idx ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="user-menu-container">
          <div
            ref={menuRef}
            className="user-menu-wrapper"
          >
            <Avatar
              className="user-avatar"
              onClick={() => setMenuOpen((open) => !open)}
            >
              AJ
            </Avatar>
            {menuOpen && (
              <div className="dropdown-menu">
                <FlowingMenu items={MenuItems} />
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
            <Route path="/account" element={<Account />} />
          </Routes>
        </div>
        <div className="server-status">{message ? message : "Loading..."}</div>
      </div>
    </Router>
  )
}

export default App

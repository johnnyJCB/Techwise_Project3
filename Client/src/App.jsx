import React from 'react';
import { BrowserRouter as Router, Routes, Route, href } from 'react-router-dom'
import './App.css'
import Home from './pages/HomePage'
import About from './pages/AboutPage'
import Account from './pages/AccountPage';
import Aurora from './components/Aurora'
import { Avatar } from '@mui/material';
import FlowingMenu from './components/FlowingMenu'

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

  return (
    <Router>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
          <Aurora
            colorStops={["#7F00FF", "#E100FF", "#00C9FF", "#92FE9D"]}
            blend={0.6}
            amplitude={1.2}
            speed={0.7}
          />
        </div>
        <nav
          style={{
            position: 'relative',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'fit-content',
            padding: '100px',
            zIndex: 10,
            display: 'flex',
            gap: '16px',
          }}
        >
          {items.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                color: initialActiveIndex === idx ? '#7F00FF' : '#222',
                fontWeight: initialActiveIndex === idx ? 'bold' : 'normal',
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 18px',
                cursor: 'pointer',
                boxShadow: initialActiveIndex === idx ? '0 2px 8px #7F00FF33' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '40px',
          padding: '10px',
          zIndex: 10,
        }}>
          <div
            ref={menuRef}
            style={{ position: 'relative', display: 'inline-block', }}
          >
            <Avatar
              sx={{ width: 50, height: 50, cursor: 'pointer', boxShadow: '0 4px 10px rgb(127, 0, 255)', }}
              onClick={() => setMenuOpen((open) => !open)}
            >
              A
            </Avatar>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '60px',
                  right: -35,
                  background: 'rgba(0, 0, 0, 0.95)',
                  boxShadow: '0 2px 8px rgb(127, 0, 255)',
                  borderRadius: '8px',
                  padding: '12px',
                  zIndex: 20,
                  height: '100px',
                  width: '100px',
                }}
              >
                <FlowingMenu items={MenuItems} />
              </div>
            )}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
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
      </div>
    </Router>
  )
}

export default App

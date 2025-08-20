import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import sentimentService from '../services/sentimentService'
import authService from '../services/authService'

function Home() {
    const [message, setMessage] = useState('');
    const [vibeResult, setVibeResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();


    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };
        
        checkAuth();
        
        // Set up periodic check for auth status changes
        const interval = setInterval(checkAuth, 1000);
        
        return () => clearInterval(interval);
    }, []);

    const analyzeVibe = async () => {
        if (!message.trim()) return;
        
        // Check authentication before proceeding
        if (!authService.isAuthenticated()) {
            setError('You must be logged in to analyze sentiment. Please sign in to continue.');
            return;
        }
        
        setIsAnalyzing(true);
        setError(null);
        
        try {
            // Use sentimentService instead of direct axios call
            const result = await sentimentService.analyzeSentiment(message);
            setVibeResult(result);
        } catch (err) {
            console.error('Sentiment Analysis Error:', err);
            setError(err.message || 'Failed to analyze message. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <div className="home-page">
            <div className="home-header">
                <h1>VibeChecker</h1>
                <h3>Enable more thoughtful and informed responses through real-time emotional intelligence tools.</h3>
            </div>
            
            <div className="home-content">
                <div className="message-input-section">
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={isAuthenticated ? 
                            "Type your message here and discover its emotional vibe..." : 
                            "Sign in to start analyzing sentiment..."
                        }
                        className="message-textarea"
                        disabled={!isAuthenticated}
                    />
                    
                    {isAuthenticated ? (
                        <button 
                            onClick={analyzeVibe}
                            disabled={!message.trim() || isAnalyzing}
                            className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Vibe'}
                        </button>
                    ) : (
                        <button 
                            onClick={handleSignIn}
                            className="analyze-btn"
                        >
                            Sign In to Analyze
                        </button>
                    )}
                </div>
                
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                        {error.includes('sign in') && (
                            <button 
                                onClick={handleSignIn}
                                style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                Go to Sign In
                            </button>
                        )}
                    </div>
                )}
                
                {!isAuthenticated && !error && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem', 
                        background: 'rgba(102, 126, 234, 0.1)', 
                        borderRadius: '10px', 
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        marginTop: '1rem'
                    }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 1rem 0' }}>
                            🔒 Sign in to unlock sentiment analysis features
                        </p>
                        <button 
                            onClick={handleSignIn}
                            style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.75rem 1.5rem', 
                                borderRadius: '10px', 
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Sign In Now
                        </button>
                    </div>
                )}
                
                {vibeResult && (
                    <div className="vibe-result">
                        <div className="result-header">
                            <span className={`vibe-badge vibe-${vibeResult.color}`}>
                                {vibeResult.vibe}
                            </span>
                            <span className="confidence-score">
                                {vibeResult.confidence}% Confident
                            </span>
                        </div>
                        <p className="vibe-analysis">{vibeResult.analysis}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home

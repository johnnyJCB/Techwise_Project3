import { useState } from 'react'
import axios from 'axios'
import '../App.css'

function Home() {
    const [message, setMessage] = useState('');
    const [vibeResult, setVibeResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const mapResultToVibe = (mlResult) => {
        const mapping = {
            0: { label: 'Unprofessional', color: 'negative' },
            1: { label: 'Somewhat Professional', color: 'neutral' },
            2: { label: 'Highly Professional', color: 'positive' }
        };
        return mapping[mlResult] || { label: 'Unknown', color: 'neutral' };
    };

    const analyzeVibe = async () => {
        if (!message.trim()) return;
        
        setIsAnalyzing(true);
        setError(null);
        
        try {
            const response = await axios.post('http://localhost:8000/api/v1.0/sentiment_model/', {
                query: message
            });
            
            if (response.data.error) {
                throw new Error(response.data.message);
            }
            
            const vibeInfo = mapResultToVibe(response.data.data);
            
            setVibeResult({
                vibe: vibeInfo.label,
                color: vibeInfo.color,
                confidence: 85, // Default confidence since API doesn't provide it
                analysis: response.data.message,
                rawData: response.data.data
            });
        } catch (err) {
            console.error('API Error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to analyze message. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getAnalysisText = (vibe) => {
        const analyses = {
            'Highly Professional': 'Your message conveys professionalism and clarity. Perfect for business communications!',
            'Somewhat Professional': 'Your message maintains a balanced tone. Consider refining for more formal contexts.',
            'Unprofessional': 'Your message may benefit from more professional language and tone.'
        };
        return analyses[vibe] || 'Analysis complete.';
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
                        placeholder="Type your message here and discover its emotional vibe..."
                        className="message-textarea"
                    />
                    
                    <button 
                        onClick={analyzeVibe}
                        disabled={!message.trim() || isAnalyzing}
                        className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Vibe'}
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
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

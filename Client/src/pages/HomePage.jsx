import { useState } from 'react'
import '../App.css'

function Home() {
    const [message, setMessage] = useState('');
    const [vibeResult, setVibeResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeVibe = () => {
        if (!message.trim()) return;
        
        setIsAnalyzing(true);
        // Simulate API call with timeout
        setTimeout(() => {
            const vibes = ['Positive', 'Neutral', 'Negative'];
            const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
            const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
            
            setVibeResult({
                vibe: randomVibe,
                confidence: confidence,
                analysis: getAnalysisText(randomVibe)
            });
            setIsAnalyzing(false);
        }, 1500);
    };

    const getAnalysisText = (vibe) => {
        const analyses = {
            'Positive': 'Your message conveys optimism and enthusiasm. Great for motivating and inspiring others!',
            'Neutral': 'Your message maintains a balanced, professional tone. Perfect for formal communications.',
            'Negative': 'Your message may come across as critical or pessimistic. Consider softening the tone for better reception.'
        };
        return analyses[vibe];
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
                
                {vibeResult && (
                    <div className="vibe-result">
                        <div className="result-header">
                            <span className={`vibe-badge vibe-${vibeResult.vibe.toLowerCase()}`}>
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

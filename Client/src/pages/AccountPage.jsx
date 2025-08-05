import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Account({ user }) {
    const navigate = useNavigate();
    
    console.log('Account page user prop:', user); // Debug log
    
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            console.log('No user found, redirecting to login');
            navigate('/login');
        }
    }, [user, navigate]);
    
    // Use actual user data or fallback to guest
    const userData = user ? {
        ...user,
        totalConversations: user.totalConversations || 5, // Default to 5 for demo
        Vibes: user.Vibes || ["Positive", "Neutral", "Negative"]
    } : {
        name: "Guest User",
        email: "guest@vibecheck.com",
        joinDate: "Not available",
        totalConversations: 0,
        Vibes: ["Positive", "Neutral", "Negative"]
    };
    
    console.log('Account page userData:', userData); // Debug log
    
    // Don't render if no user (will redirect)
    if (!user) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // history for showcase
    const pastConversations = [
        {
            id: 1,
            date: "2025-08-04",
            vibe: "Neutral",
            preview: "Looking for some relaxing music for studying...",
            duration: "15 min"
        },
        {
            id: 2,
            date: "2025-08-03",
            vibe: "Positive",
            preview: "Need uplifting music that gets me motivated...",
            duration: "8 min"
        },
        {
            id: 3,
            date: "2025-08-03",
            vibe: "Neutral",
            preview: "Help me find background music for working...",
            duration: "22 min"
        },
        {
            id: 4,
            date: "2025-08-01",
            vibe: "Negative",
            preview: "Feeling down, need some emotional music...",
            duration: "12 min"
        },
        {
            id: 5,
            date: "2025-08-01",
            vibe: "Positive",
            preview: "Happy songs to brighten my mood today...",
            duration: "6 min"
        }
    ];

    // Find the most common vibe
    const vibeCounts = userData.Vibes.reduce((acc, vibe) => {
        acc[vibe] = (acc[vibe] || 0) + pastConversations.filter(c => c.vibe === vibe).length;
        return acc;
    }, {});
    const mostCommonVibe = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return (
        <div className="account-page">
            <div className="account-container">
                <div className="account-header">
                    <div className="profile-section">
                        <div className="profile-avatar">
                            <span className="avatar-initials">{userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                        </div>
                        <div className="profile-info">
                            <h1>{userData.name}</h1>
                            <p className="email">{userData.email}</p>
                            <p className="join-date">Member since {userData.joinDate}</p>
                        </div>
                    </div>
                </div>

                <div className="account-stats">
                    <div className="stat-card">
                        <h3>{userData.totalConversations}</h3>
                        <p>Total Conversations</p>
                    </div>
                    <div className="stat-card">
                        <h3>{mostCommonVibe}</h3>
                        <p>Most Common Vibe</p>
                    </div>
                </div>


                <div className="conversation-history">
                    <h2>Recent Conversations</h2>
                    <div className="conversations-list">
                        {pastConversations.map((conversation) => (
                            <div key={conversation.id} className="conversation-item">
                                <div className="conversation-header">
                                    <span className={`conversation-vibe vibe-${conversation.vibe.toLowerCase()}`}>{conversation.vibe}</span>
                                    <span className="conversation-date">{conversation.date}</span>
                                </div>
                                <p className="conversation-preview">{conversation.preview}</p>
                                <div className="conversation-footer">
                                    <span className="conversation-duration">Duration: {conversation.duration}</span>
                                    <button className="view-btn" disabled>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account

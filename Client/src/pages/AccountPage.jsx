import { useState } from 'react'
import '../App.css'

function Account() {
    // data for showcase
    const userData = {
        name: "Alex Johnson",
        email: "alex.johnson@email.com",
        joinDate: "January 2024",
        totalConversations: 47,
        Vibes: ["Positive", "Neutral", "Negative"]
    };

    // history for showcase
    const pastConversations = [
        {
            id: 1,
            date: "2024-07-29",
            vibe: "Neutral",
            preview: "Looking for some relaxing music for studying...",
            duration: "15 min"
        },
        {
            id: 2,
            date: "2024-07-28",
            vibe: "Positive",
            preview: "Need uplifting music that gets me motivated...",
            duration: "8 min"
        },
        {
            id: 3,
            date: "2024-07-27",
            vibe: "Neutral",
            preview: "Help me find background music for working...",
            duration: "22 min"
        },
        {
            id: 4,
            date: "2024-07-25",
            vibe: "Negative",
            preview: "Feeling down, need some emotional music...",
            duration: "12 min"
        },
        {
            id: 5,
            date: "2024-07-24",
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
                            <span className="avatar-initials">{userData.name.split(' ').map(n => n[0]).join('')}</span>
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
                    <div className="stat-card">
                        <h3>4.8</h3>
                        <p>Avg. Rating</p>
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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import authService from '../services/authService'

function Account({ user }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [sentimentHistory, setSentimentHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user && !authService.isAuthenticated()) {
            console.log('No user found, redirecting to login');
            navigate('/login');
            return;
        }
        
        // Load user data from backend
        loadUserData();
    }, [user, navigate]);
    
    const loadUserData = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            // Get current user data
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('No authenticated user');
            }
            
            // Get updated user profile from backend (getUserProfile will extract ID automatically)
            const profileData = await authService.getUserProfile();
            
            // Merge backend data with localStorage data to get all available fields
            const mergedUserData = {
                ...currentUser, // Start with localStorage data (has more fields)
                ...profileData  // Override with backend data where available
            };
            
            setUserData(mergedUserData);
            
            // Get user's sentiment history
            const history = await authService.getUserSentimentHistory();
            setSentimentHistory(history);
            
        } catch (error) {
            console.error('Error loading user data:', error);
            setError('Failed to load user data');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Don't render if no user (will redirect)
    if (!user && !authService.isAuthenticated()) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <p>Loading user data...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <p>Error: {error}</p>
                    <button onClick={loadUserData}>Retry</button>
                </div>
            </div>
        );
    }

    // Process real sentiment history
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Unknown date';
        }
    };
    
    // Calculate statistics from real data
    const totalConversations = sentimentHistory.length;
    
    // Find the most common sentiment
    const sentimentCounts = sentimentHistory.reduce((acc, item) => {
        const sentiment = item.sentiment || 'Unknown';
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
    }, {});
    
    const mostCommonSentiment = Object.entries(sentimentCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Format join date - fallback for admin users
    const joinDate = userData?.date_joined ? 
        formatDate(userData.date_joined) : 
        (userData?.username === 'admin' ? 'Initial Setup' : 'Unknown');
    
    // Determine user role - fallback logic for admin users
    const isAdmin = userData?.is_superuser || userData?.username === 'admin';
    const isStaff = userData?.is_staff || userData?.username === 'admin';
    
    // Get username for display
    const displayName = userData?.username || userData?.first_name || userData?.email?.split('@')[0] || 'User';
    const userEmail = userData?.email || 'No email provided';
    
    // Get user initials
    const getInitials = () => {
        if (userData?.first_name && userData?.last_name) {
            return (userData.first_name[0] + userData.last_name[0]).toUpperCase();
        }
        return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="account-page">
            <div className="account-container">
                <div className="account-header">
                    <div className="profile-section">
                        <div className="profile-avatar">
                            <span className="avatar-initials">{getInitials()}</span>
                        </div>
                        <div className="profile-info">
                            <h1>{displayName}</h1>
                            <p className="email">{userEmail}</p>
                            <p className="join-date">Member since {joinDate}</p>
                            {isAdmin && <p className="staff-badge">👑 Administrator</p>}
                            {isStaff && !isAdmin && <p className="staff-badge">⭐ Staff Member</p>}
                        </div>
                    </div>
                </div>

                <div className="account-stats">
                    <div className="stat-card">
                        <h3>{totalConversations}</h3>
                        <p>Total Analyses</p>
                    </div>
                    <div className="stat-card">
                        <h3>{mostCommonSentiment}</h3>
                        <p>Most Common Sentiment</p>
                    </div>
                </div>


                <div className="conversation-history">
                    <h2>All Sentiment Analyses</h2>
                    <div className="conversations-list">
                        {sentimentHistory.length === 0 ? (
                            <div className="no-conversations">
                                <p>No sentiment analyses yet. Try analyzing some text!</p>
                            </div>
                        ) : (
                            sentimentHistory.slice(0, 10).map((item, index) => (
                                <div key={item.id || index} className="conversation-item">
                                    <div className="conversation-header">
                                        <span className={`conversation-vibe vibe-${(item.sentiment || 'neutral').toLowerCase()}`}>
                                            {item.sentiment || 'Unknown'}
                                        </span>
                                        <span className="conversation-date">
                                            {formatDate(item.created_at || new Date())}
                                        </span>
                                        {item.certainty && (
                                            <span className="certainty-badge">
                                                {item.certainty}% confident
                                            </span>
                                        )}
                                    </div>
                                    <p className="conversation-preview">
                                        <strong>Query:</strong> {item.query || 'No query recorded'}
                                    </p>
                                    {item.message && (
                                        <p className="conversation-analysis">
                                            <strong>Analysis:</strong> {item.message}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account

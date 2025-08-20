import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

class SentimentService {
    constructor() {
        // Set default timeout for AI processing
        this.timeout = 30000; // 30 seconds
    }

    // Analyze sentiment with authentication
    async analyzeSentiment(query) {
        try {
            // Check if user is authenticated
            if (!authService.isAuthenticated()) {
                throw new Error('You must be logged in to analyze sentiment. Please sign in to continue.');
            }

            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('Authentication error. Please sign in again.');
            }

            // Get auth token
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('Authentication token missing. Please sign in again.');
            }

            // Make authenticated request to sentiment analysis endpoint
            const response = await axios.post(
                `${API_BASE_URL}/api/v1.0/sentiment_model/`,
                { query: query.trim() },
                {
                    headers: {
                        'Authorization': `Basic ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            return this.processSentimentResponse(response.data);
        } catch (error) {
            console.error('Sentiment analysis error:', error);
            
            // Handle specific error types
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. The AI is taking too long to respond. Please try again.');
            }
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Clear invalid auth and redirect to login
                await authService.logout();
                throw new Error('Authentication failed. Please sign in again to continue.');
            }
            
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (errorData.message) {
                    throw new Error(errorData.message);
                }
                throw new Error('Invalid request. Please check your input and try again.');
            }
            
            if (error.response?.status === 500) {
                throw new Error('Server error. The AI service may be temporarily unavailable. Please try again later.');
            }
            
            // If it's already a formatted error message, use it
            if (error.message && !error.response) {
                throw error;
            }
            
            // Default error message
            throw new Error('Failed to analyze sentiment. Please try again.');
        }
    }

    // Process the response from the sentiment analysis API
    processSentimentResponse(data) {
        const { sentiment, certainty, message: analysisMessage, full_message } = data;
        
        // Map sentiment to color classes
        const sentimentColorMap = {
            'Positive': 'positive',
            'Negative': 'negative', 
            'Neutral': 'neutral',
            'Other': 'neutral'
        };

        return {
            vibe: sentiment || 'Unknown',
            color: sentimentColorMap[sentiment] || 'neutral',
            confidence: certainty || 0,
            analysis: analysisMessage || 'No analysis provided',
            fullMessage: full_message || '',
            rawData: data
        };
    }

    // Check if the sentiment service is available (user is authenticated)
    isAvailable() {
        return authService.isAuthenticated();
    }

    // Get authentication status message for UI
    getAuthStatusMessage() {
        if (!authService.isAuthenticated()) {
            return 'Please sign in to analyze sentiment';
        }
        return null;
    }
}

// Create singleton instance
const sentimentService = new SentimentService();
export default sentimentService;

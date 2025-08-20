import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

class AuthService {
    constructor() {
        this.token = null;
        this.user = null;
        this.loadFromStorage();
    }

    // Load authentication data from localStorage
    loadFromStorage() {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
            this.user = JSON.parse(storedUser);
            this.token = storedToken;
            this.setAuthHeader();
        }
    }

    // Set authorization header for axios requests
    setAuthHeader() {
        if (this.token) {
            axios.defaults.headers.common['Authorization'] = `Basic ${this.token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    // Create basic auth token
    createAuthToken(username, password) {
        return btoa(`${username}:${password}`);
    }

    // Login with username and password
    async login(username, password) {
        try {
            const authToken = this.createAuthToken(username, password);
            
            // Set temporary auth header
            const tempHeaders = {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            };

            // Try to get user list to verify credentials
            const response = await axios.get(`${API_BASE_URL}/users/`, { headers: tempHeaders });
            
            // Find the current user from the response
            const currentUser = response.data.results?.find(user => user.username === username) || response.data.find(user => user.username === username);
            
            if (!currentUser) {
                throw new Error('User not found');
            }

            // Store authentication data
            this.user = currentUser;
            this.token = authToken;
            
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('isLoggedIn', 'true');
            
            this.setAuthHeader();
            
            return currentUser;
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('Invalid username or password');
            }
            throw new Error('Login failed. Please try again.');
        }
    }

    // Register new user (staff only)
    async register(userData) {
        try {
            if (!this.isAuthenticated() || !this.user?.is_staff) {
                throw new Error('Only staff users can create new accounts');
            }

            const response = await axios.post(`${API_BASE_URL}/users/`, {
                username: userData.username,
                email: userData.email,
                password: userData.password
            });

            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response?.status === 403) {
                throw new Error('Only staff users can create new accounts');
            }
            if (error.response?.status === 400) {
                const errors = error.response.data;
                if (errors.username) {
                    throw new Error(`Username error: ${errors.username[0]}`);
                }
                if (errors.email) {
                    throw new Error(`Email error: ${errors.email[0]}`);
                }
                if (errors.password) {
                    throw new Error(`Password error: ${errors.password[0]}`);
                }
            }
            throw new Error('Registration failed. Please try again.');
        }
    }

    // Logout
    async logout() {
        try {
            // Try to call Django's logout endpoint if available
            await axios.post(`${API_BASE_URL}/api-auth/logout/`).catch(() => {
                // Ignore errors - we'll clear local state anyway
            });
        } catch (error) {
            console.log('Logout endpoint error (ignoring):', error);
        }
        
        // Clear local authentication state
        this.user = null;
        this.token = null;
        
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('isLoggedIn');
        
        this.setAuthHeader();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.user && this.token);
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get user's sentiment responses
    // Note: Backend doesn't include user field in responses, so returning all responses
    async getUserSentimentHistory() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }

            console.log('Fetching sentiment history...');
            const response = await axios.get(`${API_BASE_URL}/sentiment/`);
            console.log('Sentiment history response:', response.data);
            
            // Check if response has results array or is direct array
            const allResponses = response.data.results || response.data;
            console.log('All sentiment responses:', allResponses);
            
            // Since backend doesn't include user field in sentiment responses,
            // we return all responses for now
            return allResponses || [];
        } catch (error) {
            console.error('Error fetching sentiment history:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            return [];
        }
    }

    // Extract user ID from URL or use direct ID
    getUserId(user = null) {
        const targetUser = user || this.user;
        if (!targetUser) return null;
        
        // If user has direct id or pk property, use it
        if (targetUser.id) return targetUser.id;
        if (targetUser.pk) return targetUser.pk;
        
        // Extract ID from URL if present (e.g., 'http://127.0.0.1:8000/users/1/' -> '1')
        if (targetUser.url) {
            const urlMatch = targetUser.url.match(/users\/(\d+)\/$/);
            if (urlMatch) {
                return parseInt(urlMatch[1], 10);
            }
        }
        
        return null;
    }

    // Get user profile data
    async getUserProfile(userId = null) {
        try {
            console.log('Full user object:', this.user);
            console.log('User keys:', this.user ? Object.keys(this.user) : 'No user');
            
            const targetId = userId || this.getUserId();
            console.log('Extracted user ID:', targetId);
            
            if (!targetId) {
                console.error('No user ID provided. Current user:', this.user);
                throw new Error('No user ID provided');
            }

            console.log('Fetching user profile for ID:', targetId);
            const response = await axios.get(`${API_BASE_URL}/users/${targetId}/`);
            console.log('User profile response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    }

    // Update user profile
    async updateUserProfile(userData) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }

            const userId = this.getUserId();
            if (!userId) {
                throw new Error('Cannot determine user ID for profile update');
            }

            const response = await axios.put(`${API_BASE_URL}/users/${userId}/`, userData);
            
            // Update local user data
            this.user = { ...this.user, ...response.data };
            localStorage.setItem('user', JSON.stringify(this.user));
            
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
}

// Create singleton instance
const authService = new AuthService();
export default authService;

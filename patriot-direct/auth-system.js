/**
 * Authentication System - Route Protection
 * Add this script to EVERY HTML page except index.html (login page)
 * This will redirect unauthorized users back to login
 */

window.AuthSystem = {
    // Storage keys
    STORAGE_KEYS: {
        IS_LOGGED_IN: 'isLoggedIn',
        LOGIN_TIME: 'loginTime',
        LAST_ACTIVITY: 'lastActivity'
    },

    // Session timeout (in milliseconds) - 30 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000,

    /**
     * Initialize authentication system
     */
    init() {
        console.log('Auth System: Initializing...');
        this.checkAuthentication();
        this.setupActivityTracking();
        this.setupPeriodicCheck();
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        const isLoggedIn = localStorage.getItem(this.STORAGE_KEYS.IS_LOGGED_IN);
        const loginTime = localStorage.getItem(this.STORAGE_KEYS.LOGIN_TIME);
        const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY);

        // Check if login flag exists
        if (isLoggedIn !== '1') {
            console.log('Auth System: No login flag found');
            return false;
        }

        // Check if session has expired
        if (this.isSessionExpired(loginTime, lastActivity)) {
            console.log('Auth System: Session expired');
            this.logout();
            return false;
        }

        // Update last activity
        this.updateLastActivity();
        return true;
    },

    /**
     * Check if session has expired
     * @param {string} loginTime - Login timestamp
     * @param {string} lastActivity - Last activity timestamp
     * @returns {boolean} True if expired
     */
    isSessionExpired(loginTime, lastActivity) {
        if (!loginTime) return true;

        const loginTimestamp = parseInt(loginTime);
        const lastActivityTimestamp = parseInt(lastActivity) || loginTimestamp;
        const currentTime = Date.now();

        // Check if session has been inactive for too long
        return (currentTime - lastActivityTimestamp) > this.SESSION_TIMEOUT;
    },

    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    },

    /**
     * Set user as logged in
     * Call this from the login page after successful authentication
     */
    login() {
        const currentTime = Date.now().toString();
        localStorage.setItem(this.STORAGE_KEYS.IS_LOGGED_IN, '1');
        localStorage.setItem(this.STORAGE_KEYS.LOGIN_TIME, currentTime);
        localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, currentTime);
        console.log('Auth System: User logged in');
    },

    /**
     * Log out user and clear session data
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.IS_LOGGED_IN);
        localStorage.removeItem(this.STORAGE_KEYS.LOGIN_TIME);
        localStorage.removeItem(this.STORAGE_KEYS.LAST_ACTIVITY);
        
        // Optional: Clear other user data
        localStorage.removeItem('account_balance');
        localStorage.removeItem('account_transactions');
        localStorage.removeItem('accounts');
        localStorage.removeItem('currentAccount');
        
        console.log('Auth System: User logged out');
    },

    /**
     * Check authentication and redirect if necessary
     */
    checkAuthentication() {
        // Skip authentication check for login page
        if (this.isLoginPage()) {
            console.log('Auth System: On login page, skipping auth check');
            return;
        }

        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            console.log('Auth System: User not authenticated, redirecting to login');
            this.redirectToLogin();
            return;
        }

        console.log('Auth System: User authenticated');
    },

    /**
     * Check if current page is login page
     * @returns {boolean} True if on login page
     */
    isLoginPage() {
        const currentPage = window.location.pathname;
        const loginPages = [
            '/index.html',
            '/',
            '/login.html',
            'index.html',
            'login.html'
        ];
        
        return loginPages.some(page => 
            currentPage === page || 
            currentPage.endsWith(page) ||
            (currentPage === '/' && page === '/index.html')
        );
    },

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        // Show brief message before redirect (optional)
        if (document.body) {
            this.showRedirectMessage();
        }
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    /**
     * Show redirect message (optional)
     */
    showRedirectMessage() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        // Create message
        const message = document.createElement('div');
        message.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            margin: 1rem;
        `;
        
        message.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h2 style="margin-bottom: 1rem; color: #fff;">Session Expired</h2>
            <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 1rem;">
                Please log in to access this page
            </p>
            <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">
                Redirecting to login...
            </div>
        `;

        overlay.appendChild(message);
        document.body.appendChild(overlay);
    },

    /**
     * Setup activity tracking to prevent session timeout
     */
    setupActivityTracking() {
        const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        let activityTimeout;

        const handleActivity = () => {
            // Throttle activity updates to prevent excessive localStorage writes
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                if (this.isAuthenticated()) {
                    this.updateLastActivity();
                }
            }, 5000); // Update every 5 seconds at most
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });
    },

    /**
     * Setup periodic authentication check
     */
    setupPeriodicCheck() {
        // Check authentication every minute
        setInterval(() => {
            if (!this.isLoginPage() && !this.isAuthenticated()) {
                console.log('Auth System: Periodic check failed, redirecting');
                this.redirectToLogin();
            }
        }, 60000); // Check every minute
    },

    /**
     * Force logout (can be called from any page)
     */
    forceLogout() {
        this.logout();
        this.redirectToLogin();
    },

    /**
     * Get session info for debugging
     * @returns {Object} Session information
     */
    getSessionInfo() {
        return {
            isLoggedIn: localStorage.getItem(this.STORAGE_KEYS.IS_LOGGED_IN),
            loginTime: localStorage.getItem(this.STORAGE_KEYS.LOGIN_TIME),
            lastActivity: localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY),
            isAuthenticated: this.isAuthenticated(),
            timeRemaining: this.getTimeRemaining()
        };
    },

    /**
     * Get remaining session time
     * @returns {number} Remaining time in milliseconds
     */
    getTimeRemaining() {
        const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY);
        if (!lastActivity) return 0;

        const lastActivityTimestamp = parseInt(lastActivity);
        const currentTime = Date.now();
        const elapsed = currentTime - lastActivityTimestamp;
        const remaining = this.SESSION_TIMEOUT - elapsed;

        return Math.max(0, remaining);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.AuthSystem.init();
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AuthSystem.init();
    });
} else {
    window.AuthSystem.init();
}

// Global function to manually trigger logout (for logout buttons)
window.logout = function() {
    window.AuthSystem.forceLogout();
};

// Prevent back button after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted && !window.AuthSystem.isAuthenticated() && !window.AuthSystem.isLoginPage()) {
        window.AuthSystem.redirectToLogin();
    }
});
function deleteCookie(name: string) {
    try {
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    } catch { }
}

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'super_admin';
    lastLogin: Date;
    isActive: boolean;
    createdAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthState {
    user: AdminUser | null;
    isAuthenticated: boolean;
    lastActivity: Date;
    sessionExpiry: Date;
}

// Session timeout: 1 hour
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

class AdminAuthManager {
    private authState: AuthState = {
        user: null,
        isAuthenticated: false,
        lastActivity: new Date(),
        sessionExpiry: new Date(Date.now() + SESSION_TIMEOUT)
    };

    constructor() {
        this.loadAuthState();
        this.startSessionMonitoring();
    }

    // Mock admin users for development
    private mockUsers: AdminUser[] = [
        {
            id: '1',
            email: 'admin@voicedata.com',
            name: 'System Admin',
            role: 'admin',
            lastLogin: new Date(),
            isActive: true,
            createdAt: new Date('2024-01-01')
        },
        {
            id: '2',
            email: 'superadmin@voicedata.com',
            name: 'Super Admin',
            role: 'super_admin',
            lastLogin: new Date(),
            isActive: true,
            createdAt: new Date('2024-01-01')
        }
    ];

    private loadAuthState() {
        // Only access localStorage on client side
        if (typeof window === 'undefined') return;

        try {
            const savedState = localStorage.getItem('admin_auth_state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                // Convert date strings back to Date objects
                if (parsed.user) {
                    parsed.user.lastLogin = new Date(parsed.user.lastLogin);
                    parsed.user.createdAt = new Date(parsed.user.createdAt);
                }
                parsed.lastActivity = new Date(parsed.lastActivity);
                parsed.sessionExpiry = new Date(parsed.sessionExpiry);

                this.authState = parsed;

                // Check if session has expired
                if (this.isSessionExpired()) {
                    this.logout();
                    return;
                }

                // Check for inactivity timeout
                if (this.isInactiveTimeout()) {
                    this.logout();
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
            this.logout();
        }
    }

    private saveAuthState() {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('admin_auth_state', JSON.stringify(this.authState));
        } catch (error) {
            console.error('Failed to save auth state:', error);
        }
    }

    private startSessionMonitoring() {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Update last activity on user interactions
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });

        // Check session expiry every minute
        setInterval(() => {
            if (
                this.isAuthenticated() &&
                (this.isSessionExpired() || this.isInactiveTimeout())
            ) {
                this.logout();
                // Redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }, 60000); // Check every minute
    }

    private updateLastActivity() {
        this.authState.lastActivity = new Date();
        this.saveAuthState();
    }

    private isSessionExpired(): boolean {
        return Date.now() > this.authState.sessionExpiry.getTime();
    }

    private isInactiveTimeout(): boolean {
        const inactiveTime = Date.now() - this.authState.lastActivity.getTime();
        return inactiveTime > SESSION_TIMEOUT;
    }

    async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find user by email
        const user = this.mockUsers.find(u => u.email === credentials.email);

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for existing emails
        if (credentials.password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Update user's last login
        user.lastLogin = new Date();

        // Set auth state
        this.authState = {
            user,
            isAuthenticated: true,
            lastActivity: new Date(),
            sessionExpiry: new Date(Date.now() + SESSION_TIMEOUT)
        };

        this.saveAuthState();
        return { success: true, user };
    }

    logout() {
        this.authState = {
            user: null,
            isAuthenticated: false,
            lastActivity: new Date(),
            sessionExpiry: new Date()
        };
        this.saveAuthState();
        // Clear localStorage items
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('admin_auth_state');
        }
        // Clear any admin-specific cookies
        deleteCookie('admin_session');
    }

    isAuthenticated(): boolean {
        return this.authState.isAuthenticated && !this.isSessionExpired() && !this.isInactiveTimeout();
    }

    getCurrentUser(): AdminUser | null {
        return this.authState.user;
    }

    isSuperAdmin(): boolean {
        return this.authState.user?.role === 'super_admin';
    }

    isAdmin(): boolean {
        return this.authState.user?.role === 'admin';
    }

    getSessionTimeRemaining(): number {
        const remaining = this.authState.sessionExpiry.getTime() - Date.now();
        return Math.max(0, remaining);
    }

    getInactivityTimeRemaining(): number {
        const remaining = SESSION_TIMEOUT - (Date.now() - this.authState.lastActivity.getTime());
        return Math.max(0, remaining);
    }

    // Super admin methods
    async createAdminUser(userData: Omit<AdminUser, 'id' | 'lastLogin' | 'createdAt'>): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
        if (!this.isSuperAdmin()) {
            return { success: false, error: 'Insufficient permissions' };
        }

        // Check if email already exists
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
            return { success: false, error: 'Email already exists' };
        }

        // Create new admin user
        const newUser: AdminUser = {
            id: Date.now().toString(),
            ...userData,
            lastLogin: new Date(),
            createdAt: new Date()
        };

        this.mockUsers.push(newUser);
        return { success: true, user: newUser };
    }

    getAllAdminUsers(): AdminUser[] {
        if (!this.isSuperAdmin()) {
            return [];
        }
        return this.mockUsers;
    }

    async deleteAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
        if (!this.isSuperAdmin()) {
            return { success: false, error: 'Insufficient permissions' };
        }

        const userIndex = this.mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, error: 'User not found' };
        }

        // Don't allow deleting the current user
        if (this.authState.user?.id === userId) {
            return { success: false, error: 'Cannot delete your own account' };
        }

        this.mockUsers.splice(userIndex, 1);
        return { success: true };
    }
}

// Export singleton instance
export const adminAuth = new AdminAuthManager();

// Simple auth utility - abstraction layer for easy SSO migration
// This allows appointment features to work with simple login now,
// and SSO team can swap implementation without touching other files

/**
 * Auth interface that can be swapped between simple login and SSO
 * For SSO migration: only update functions in this file
 */

// Simple storage keys (will be replaced by SSO tokens)
const STORAGE_PREFIX = 'vc_temp_';

export const auth = {
  /**
   * Get current user information
   * SSO TODO: Parse from JWT token claims instead
   */
  getCurrentUser: () => {
    // Check sessionStorage first (per-tab session), then localStorage (cross-tab persistence)
    const email = sessionStorage.getItem(`${STORAGE_PREFIX}userEmail`) || 
                  localStorage.getItem(`${STORAGE_PREFIX}userEmail`);
    const name = sessionStorage.getItem(`${STORAGE_PREFIX}userName`) || 
                 localStorage.getItem(`${STORAGE_PREFIX}userName`);
    const role = sessionStorage.getItem(`${STORAGE_PREFIX}userRole`) || 
                 localStorage.getItem(`${STORAGE_PREFIX}userRole`) || 'user';
    
    if (!email) return null;
    
    return {
      id: email, // SSO TODO: Use SSO unique userId instead
      email: email,
      name: name || email.split('@')[0],
      role: role, // Use role from database (set during login/register)
      isAdmin: role === 'admin', // Check against database role, not hardcoded email
    };
  },

  /**
   * Check if user is authenticated
   * SSO TODO: Validate JWT token instead
   */
  isAuthenticated: () => {
    // Check sessionStorage first (per-tab session), then localStorage (cross-tab persistence)
    const email = sessionStorage.getItem(`${STORAGE_PREFIX}userEmail`) || 
                  localStorage.getItem(`${STORAGE_PREFIX}userEmail`);
    return !!email;
  },

  /**
   * Simple login (DEPRECATED - use server authentication instead)
   * SSO TODO: Replace with redirect to SSO provider
   */
  login: (email, password, remember = false) => {
    // This fallback is disabled - all logins must be validated by the server
    // Keeping function for backwards compatibility only
    return { success: false, error: 'Server authentication required' };
  },

  /**
   * Logout current user
   * SSO TODO: Call SSO logout endpoint and clear tokens
   */
  logout: () => {
    sessionStorage.removeItem(`${STORAGE_PREFIX}userEmail`);
    sessionStorage.removeItem(`${STORAGE_PREFIX}userName`);
    sessionStorage.removeItem(`${STORAGE_PREFIX}userRole`);
    localStorage.removeItem(`${STORAGE_PREFIX}userEmail`);
    localStorage.removeItem(`${STORAGE_PREFIX}userName`);
    localStorage.removeItem(`${STORAGE_PREFIX}userRole`);
  },

  /**
   * Get auth headers for API requests
   * SSO TODO: Add Authorization: Bearer {token} header
   */
  getAuthHeaders: () => {
    const user = auth.getCurrentUser();
    if (!user) return {};
    
    // Simple approach for now
    // SSO TODO: Return { 'Authorization': `Bearer ${token}` }
    return {
      'X-User-Email': user.email, // Temporary header
    };
  },
};

/**
 * React hook for auth state
 * This keeps the same interface when switching to SSO
 */
export const useAuth = () => {
  // For now, return static values
  // SSO TODO: Subscribe to auth context/provider
  const user = auth.getCurrentUser();
  const isAuthenticated = auth.isAuthenticated();
  
  return {
    user,
    isAuthenticated,
    isAdmin: user?.isAdmin || false,
    login: auth.login,
    logout: auth.logout,
  };
};

export default auth;

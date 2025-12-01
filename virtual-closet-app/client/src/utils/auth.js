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
    const email = sessionStorage.getItem(`${STORAGE_PREFIX}userEmail`) || 
                  localStorage.getItem(`${STORAGE_PREFIX}userEmail`);
    const name = sessionStorage.getItem(`${STORAGE_PREFIX}userName`) || 
                 localStorage.getItem(`${STORAGE_PREFIX}userName`);
    
    if (!email) return null;
    
    return {
      id: email, // SSO TODO: Use SSO unique userId instead
      email: email,
      name: name || email.split('@')[0],
      isAdmin: email.toLowerCase() === 'admin@pfw.edu', // SSO TODO: Read from token roles
    };
  },

  /**
   * Check if user is authenticated
   * SSO TODO: Validate JWT token instead
   */
  isAuthenticated: () => {
    const email = sessionStorage.getItem(`${STORAGE_PREFIX}userEmail`) || 
                  localStorage.getItem(`${STORAGE_PREFIX}userEmail`);
    return !!email;
  },

  /**
   * Simple login (temporary - for development/testing)
   * SSO TODO: Replace with redirect to SSO provider
   */
  login: (email, password, remember = false) => {
    // Simple validation for testing
    if (!email || !password) {
      return { success: false, error: 'Email and password required' };
    }
    
    if (!/^[^\s@]+@pfw\.edu$/i.test(email)) {
      return { success: false, error: 'Must use PFW email address' };
    }

    // For testing - accept any password
    // SSO TODO: Remove this entirely, redirect to SSO login page
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(`${STORAGE_PREFIX}userEmail`, email.toLowerCase());
    storage.setItem(`${STORAGE_PREFIX}userName`, email.split('@')[0]);
    
    return { success: true };
  },

  /**
   * Logout current user
   * SSO TODO: Call SSO logout endpoint and clear tokens
   */
  logout: () => {
    sessionStorage.removeItem(`${STORAGE_PREFIX}userEmail`);
    sessionStorage.removeItem(`${STORAGE_PREFIX}userName`);
    localStorage.removeItem(`${STORAGE_PREFIX}userEmail`);
    localStorage.removeItem(`${STORAGE_PREFIX}userName`);
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

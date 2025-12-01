// Simple auth utility for admin checking
const STORAGE_PREFIX = 'vc_temp_';

export const auth = {
  getCurrentUser: () => {
    const email = sessionStorage.getItem(`${STORAGE_PREFIX}userEmail`) || 
                  localStorage.getItem(`${STORAGE_PREFIX}userEmail`);
    const name = sessionStorage.getItem(`${STORAGE_PREFIX}userName`) || 
                 localStorage.getItem(`${STORAGE_PREFIX}userName`);
    
    if (!email) return null;
    
    return {
      id: email,
      email: email,
      name: name || email.split('@')[0],
      isAdmin: email.toLowerCase() === 'admin@pfw.edu',
    };
  },

  isAuthenticated: () => {
    const email = sessionStorage.getItem(`${STORAGE_PREFIX}userEmail`) || 
                  localStorage.getItem(`${STORAGE_PREFIX}userEmail`);
    return !!email;
  },

  login: (email, password, remember = false) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password required' };
    }
    
    if (!/^[^\s@]+@pfw\.edu$/i.test(email)) {
      return { success: false, error: 'Must use PFW email address' };
    }

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(`${STORAGE_PREFIX}userEmail`, email.toLowerCase());
    storage.setItem(`${STORAGE_PREFIX}userName`, email.split('@')[0]);
    
    return { success: true };
  },

  logout: () => {
    sessionStorage.removeItem(`${STORAGE_PREFIX}userEmail`);
    sessionStorage.removeItem(`${STORAGE_PREFIX}userName`);
    localStorage.removeItem(`${STORAGE_PREFIX}userEmail`);
    localStorage.removeItem(`${STORAGE_PREFIX}userName`);
  },
};

export default auth;

/**
 * Simple auth middleware - abstraction layer for easy SSO migration
 * For SSO: only update this file to validate JWT tokens
 */

import User from '../models/user.js';

/**
 * Simple authentication check (temporary for testing)
 * SSO TODO: Validate JWT token from Authorization header
 */
export async function authenticate(req, res, next) {
  // Simple approach: check for X-User-Email header
  // SSO TODO: Verify JWT token instead
  const userEmail = req.headers['x-user-email'];
  
  console.log('[AUTH] Request headers:', Object.keys(req.headers));
  console.log('[AUTH] x-user-email header:', userEmail);
  
  if (!userEmail) {
    console.warn('[AUTH] Missing x-user-email header');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  try {
    // Get user from database to fetch their role
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    
    // Attach user info to request
    // Always use email as userId for consistency (matches what favorites store)
    req.user = {
      id: userEmail, // Use email consistently as user ID
      email: userEmail,
      role: user?.role || 'user', // Default to 'user' if not found
    };
    console.log('[AUTH] Authenticated user:', { email: userEmail, role: req.user.role });
  } catch (err) {
    console.error('Error fetching user role:', err);
    // Fallback - set basic user info without role check
    req.user = {
      id: userEmail, // Use email consistently as user ID
      email: userEmail,
      role: 'user',
    };
  }

  next();
}

/**
 * Optional auth - allows both authenticated and public access
 * Useful for endpoints that behave differently when authenticated
 */
export async function optionalAuth(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  
  if (userEmail) {
    try {
      // Get user from database to fetch their role
      const user = await User.findOne({ email: userEmail.toLowerCase() });
      
      req.user = {
        id: user?._id || userEmail,
        email: userEmail,
        role: user?.role || 'user',
      };
    } catch (err) {
      console.error('Error fetching user role:', err);
      // Fallback - set basic user info
      req.user = {
        id: userEmail,
        email: userEmail,
        role: 'user',
      };
    }
  } else {
    req.user = null;
  }

  next();
}

/**
 * Require admin role
 * SSO TODO: Check roles from JWT token
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  next();
}

/**
 * Simple login endpoint (temporary for testing)
 * SSO TODO: Remove this entirely, use SSO redirect
 */
export async function simpleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password required',
    });
  }

  // Simple validation for testing
  if (!/^[^\s@]+@pfw\.edu$/i.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Must use PFW email address',
    });
  }

  // For testing - accept any password
  // SSO TODO: Remove this, redirect to SSO provider
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    const role = user?.role || 'user';
    
    return res.json({
      success: true,
      user: {
        id: user?._id || email,
        email: email.toLowerCase(),
        name: user?.name || email.split('@')[0],
        role: role,
      },
    });
  } catch (err) {
    console.error('Error in simpleLogin:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

/**
 * Get current user info
 */
export function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }

  return res.json({
    success: true,
    user: req.user,
  });
}

export default {
  authenticate,
  optionalAuth,
  requireAdmin,
  simpleLogin,
  getCurrentUser,
};

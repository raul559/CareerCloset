/**
 * Simple auth middleware - abstraction layer for easy SSO migration
 * For SSO: only update this file to validate JWT tokens
 */

/**
 * Simple authentication check (temporary for testing)
 * SSO TODO: Validate JWT token from Authorization header
 */
export function authenticate(req, res, next) {
  // Simple approach: check for X-User-Email header
  // SSO TODO: Verify JWT token instead
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Attach user info to request
  // SSO TODO: Parse from verified JWT token claims
  req.user = {
    id: userEmail, // SSO TODO: Use SSO unique userId
    email: userEmail,
    isAdmin: userEmail.toLowerCase() === 'admin@pfw.edu', // SSO TODO: Read from token roles
  };

  next();
}

/**
 * Optional auth - allows both authenticated and public access
 * Useful for endpoints that behave differently when authenticated
 */
export function optionalAuth(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  
  if (userEmail) {
    req.user = {
      id: userEmail,
      email: userEmail,
      isAdmin: userEmail.toLowerCase() === 'admin@pfw.edu',
    };
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

  if (!req.user.isAdmin) {
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
  return res.json({
    success: true,
    user: {
      id: email,
      email: email.toLowerCase(),
      name: email.split('@')[0],
      isAdmin: email.toLowerCase() === 'admin@pfw.edu',
    },
  });
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

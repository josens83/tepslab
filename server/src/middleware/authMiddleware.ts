// Re-export all auth middleware functions
export { authenticate, authorize, requireAdmin, auth } from './auth';

// Alias for authenticate
export { authenticate as protect } from './auth';

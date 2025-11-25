import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
  const SENTRY_DSN = process.env.SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.APP_VERSION || '1.0.0',
    beforeSend(event, _hint) {
      // Filter out certain errors in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Event:', event);
      }

      return event;
    },
  });

  console.log('✅ Sentry initialized');
};

// Set user context
export const setSentryUser = (user: { id: string; email: string; name: string; role: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role,
  });
};

// Clear user context
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// Capture exception manually
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Add breadcrumb
export const addBreadcrumb = (message: string, category?: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'general',
    data,
    level: 'info',
  });
};

export default Sentry;

import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Ignore errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // Facebook borked
      'fb_xd_fragment',
      // ISP injected ads
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
    ],
    beforeSend(event, hint) {
      // Filter out certain errors
      const error = hint.originalException;

      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        // Ignore network errors in development
        if (import.meta.env.MODE === 'development' && message.includes('Network Error')) {
          return null;
        }
      }

      return event;
    },
  });
};

// Set user context
export const setSentryUser = (user: { id: string; email: string; name: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
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
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
};

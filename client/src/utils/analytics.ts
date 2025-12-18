import ReactGA from 'react-ga4';

export const initGA = () => {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not configured');
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  });

  console.log('✅ Google Analytics initialized');
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });
};

// Track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Track course view
export const trackCourseView = (courseId: string, courseTitle: string) => {
  trackEvent('Course', 'View', courseTitle);
  ReactGA.gtag('event', 'view_item', {
    items: [
      {
        item_id: courseId,
        item_name: courseTitle,
      },
    ],
  });
};

// Track course purchase
export const trackPurchase = (
  orderId: string,
  courseId: string,
  courseTitle: string,
  amount: number
) => {
  ReactGA.gtag('event', 'purchase', {
    transaction_id: orderId,
    value: amount,
    currency: 'KRW',
    items: [
      {
        item_id: courseId,
        item_name: courseTitle,
        price: amount,
        quantity: 1,
      },
    ],
  });
};

// Track enrollment
export const trackEnrollment = (courseId: string, courseTitle: string) => {
  trackEvent('Course', 'Enroll', courseTitle);
  ReactGA.gtag('event', 'begin_checkout', {
    items: [
      {
        item_id: courseId,
        item_name: courseTitle,
      },
    ],
  });
};

// Track video play
export const trackVideoPlay = (
  _courseId: string,
  _lessonId: string,
  lessonTitle: string
) => {
  trackEvent('Video', 'Play', lessonTitle);
};

// Track video complete
export const trackVideoComplete = (
  _courseId: string,
  _lessonId: string,
  lessonTitle: string
) => {
  trackEvent('Video', 'Complete', lessonTitle);
};

// Track search
export const trackSearch = (searchTerm: string) => {
  ReactGA.gtag('event', 'search', {
    search_term: searchTerm,
  });
};

// Track user signup
export const trackSignup = (method: 'local' | 'kakao' | 'naver') => {
  ReactGA.gtag('event', 'sign_up', {
    method,
  });
};

// Track user login
export const trackLogin = (method: 'local' | 'kakao' | 'naver') => {
  ReactGA.gtag('event', 'login', {
    method,
  });
};

// Track test completion
export const trackTestCompletion = (testId: string, score: number) => {
  trackEvent('Test', 'Complete', testId, score);
};

// Set user properties
export const setUserProperties = (userId: string, properties: Record<string, unknown>) => {
  ReactGA.gtag('set', 'user_properties', {
    user_id: userId,
    ...properties,
  });
};

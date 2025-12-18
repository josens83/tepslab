import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { trackEvent } from './analytics';

/**
 * Web Vitals tracking utility
 * Monitors Core Web Vitals and reports to GA4
 */

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

interface NetworkInformation {
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

function getConnectionSpeed() {
  const nav = navigator as NavigatorWithConnection;
  return nav.connection?.effectiveType || 'unknown';
}

function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics
  trackEvent(
    'Web Vitals',
    metric.name,
    metric.id,
    Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value)
  );

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }

  // Send to analytics endpoint (optional)
  const body = {
    dsn: import.meta.env.VITE_VERCEL_ANALYTICS_ID,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (import.meta.env.VITE_VERCEL_ANALYTICS_ID) {
    const blob = new Blob([new URLSearchParams(body).toString()], {
      type: 'application/x-www-form-urlencoded',
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, blob);
    }
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  // Cumulative Layout Shift (CLS)
  // Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
  onCLS(sendToAnalytics);

  // First Contentful Paint (FCP)
  // Good: < 1.8s, Needs Improvement: 1.8-3s, Poor: > 3s
  onFCP(sendToAnalytics);

  // Largest Contentful Paint (LCP)
  // Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s
  onLCP(sendToAnalytics);

  // Time to First Byte (TTFB)
  // Good: < 800ms, Needs Improvement: 800-1800ms, Poor: > 1800ms
  onTTFB(sendToAnalytics);

  // Interaction to Next Paint (INP)
  // Good: < 200ms, Needs Improvement: 200-500ms, Poor: > 500ms
  onINP(sendToAnalytics);
}

/**
 * Report performance entry
 */
export function reportPerformance(name: string, value: number, unit = 'ms') {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${value}${unit}`);
  }

  trackEvent(
    'Performance',
    name,
    unit,
    Math.round(value)
  );
}

/**
 * Measure and report function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  reportPerformance(name, duration);

  return result;
}

/**
 * Measure and report async function execution time
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  reportPerformance(name, duration);

  return result;
}

/**
 * Get page load metrics
 */
export function getPageLoadMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  return {
    pageLoadTime,
    connectTime,
    renderTime,
    domInteractive: perfData.domInteractive - perfData.navigationStart,
    domComplete: perfData.domComplete - perfData.navigationStart,
  };
}

/**
 * Report page load metrics
 */
export function reportPageLoadMetrics() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPageLoadMetrics();
      if (metrics) {
        reportPerformance('Page Load Time', metrics.pageLoadTime);
        reportPerformance('Connect Time', metrics.connectTime);
        reportPerformance('Render Time', metrics.renderTime);
        reportPerformance('DOM Interactive', metrics.domInteractive);
      }
    }, 0);
  });
}

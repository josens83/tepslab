import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  disconnect() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(target: Element) {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(target: Element) {}
}
global.IntersectionObserver = MockIntersectionObserver;

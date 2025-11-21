import Config from 'react-native-config';

export const API_CONFIG = {
  BASE_URL: Config.API_URL || 'https://api.tepslab.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',

  // Courses
  COURSES: '/api/courses',
  COURSE_DETAIL: (id: string) => `/api/courses/${id}`,

  // Enrollments
  ENROLLMENTS: '/api/enrollments',
  MY_COURSES: '/api/enrollments/my-courses',

  // Lessons
  LESSON_PROGRESS: '/api/lessons/progress',

  // Tests
  TESTS: '/api/tests',
  TEST_SUBMIT: (id: string) => `/api/tests/${id}/submit`,

  // AI Tutor
  AI_CHAT: '/api/ai-tutor/chat',
  AI_EXPLAIN: '/api/ai-tutor/explain',

  // User
  PROFILE: '/api/users/me',
  UPDATE_PROFILE: '/api/users/me',

  // Notifications
  REGISTER_DEVICE: '/api/notifications/register',
};

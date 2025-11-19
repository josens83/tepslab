import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    birthDate?: string;
    targetScore?: number;
  }) => apiClient.post('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),

  getCurrentUser: () => apiClient.get('/api/auth/me'),
};

// Course API
export const courseAPI = {
  getCourses: (params?: Record<string, any>) =>
    apiClient.get('/api/courses', { params }),

  getFeaturedCourses: () => apiClient.get('/api/courses/featured'),

  getCourseById: (id: string) => apiClient.get(`/api/courses/${id}`),

  checkEnrollment: (id: string) =>
    apiClient.get(`/api/courses/${id}/check-enrollment`),

  // Admin only
  createCourse: (data: any) => apiClient.post('/api/courses', data),

  updateCourse: (id: string, data: any) =>
    apiClient.put(`/api/courses/${id}`, data),

  deleteCourse: (id: string) => apiClient.delete(`/api/courses/${id}`),
};

// Enrollment API
export const enrollmentAPI = {
  enroll: (data: { courseId: string; paymentId?: string }) =>
    apiClient.post('/api/enrollments', data),

  getMyEnrollments: (params?: { status?: string }) =>
    apiClient.get('/api/enrollments', { params }),

  getEnrollmentById: (id: string) => apiClient.get(`/api/enrollments/${id}`),

  updateProgress: (
    id: string,
    data: {
      lessonId: string;
      completed: boolean;
      watchDuration?: number;
    }
  ) => apiClient.put(`/api/enrollments/${id}/progress`, data),

  cancelEnrollment: (id: string) => apiClient.delete(`/api/enrollments/${id}`),
};

// Payment API
export const paymentAPI = {
  // Prepare payment
  prepare: (data: { courseId: string }) =>
    apiClient.post('/api/payments/ready', data),

  // Confirm payment
  confirm: (data: { orderId: string; paymentKey: string; amount: number }) =>
    apiClient.post('/api/payments/confirm', data),

  // Get payment list
  getPayments: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/api/payments', { params }),

  // Get payment by ID
  getPaymentById: (id: string) => apiClient.get(`/api/payments/${id}`),

  // Cancel payment
  cancel: (id: string, data: { cancelReason: string }) =>
    apiClient.post(`/api/payments/${id}/cancel`, data),
};

// User API
export const userAPI = {
  // Get profile
  getProfile: () => apiClient.get('/api/users/profile'),

  // Update profile
  updateProfile: (data: {
    name?: string;
    phone?: string;
    birthDate?: string;
    targetScore?: number;
  }) => apiClient.put('/api/users/profile', data),

  // Change password
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/api/users/password', data),

  // Delete account
  deleteAccount: (data: { password: string }) =>
    apiClient.delete('/api/users/account', { data }),
};

// Review API
export const reviewAPI = {
  // Get course reviews
  getCourseReviews: (
    courseId: string,
    params?: { page?: number; limit?: number; sort?: string }
  ) => apiClient.get(`/api/reviews/course/${courseId}`, { params }),

  // Get my reviews
  getMyReviews: () => apiClient.get('/api/reviews/my'),

  // Create review
  createReview: (data: {
    courseId: string;
    rating: number;
    title: string;
    comment: string;
    beforeScore?: number;
    afterScore?: number;
    studyDuration?: number;
  }) => apiClient.post('/api/reviews', data),

  // Update review
  updateReview: (
    id: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
      beforeScore?: number;
      afterScore?: number;
      studyDuration?: number;
    }
  ) => apiClient.put(`/api/reviews/${id}`, data),

  // Delete review
  deleteReview: (id: string) => apiClient.delete(`/api/reviews/${id}`),

  // Mark review as helpful
  markHelpful: (id: string) => apiClient.post(`/api/reviews/${id}/helpful`),
};

export default apiClient;

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/common';

// Lazy load pages for code splitting
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);
const AuthCallback = lazy(() =>
  import('./pages/AuthCallback').then((module) => ({ default: module.AuthCallback }))
);
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((module) => ({ default: module.CoursesPage }))
);
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage').then((module) => ({
    default: module.CourseDetailPage,
  }))
);
const MyCoursesPage = lazy(() =>
  import('./pages/MyCoursesPage').then((module) => ({ default: module.MyCoursesPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage }))
);
const CheckoutSuccessPage = lazy(() =>
  import('./pages/CheckoutSuccessPage').then((module) => ({
    default: module.CheckoutSuccessPage,
  }))
);
const CheckoutFailPage = lazy(() =>
  import('./pages/CheckoutFailPage').then((module) => ({
    default: module.CheckoutFailPage,
  }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const LessonPlayerPage = lazy(() =>
  import('./pages/LessonPlayerPage').then((module) => ({
    default: module.LessonPlayerPage,
  }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const DiagnosticTestPage = lazy(() =>
  import('./pages/DiagnosticTestPage').then((module) => ({
    default: module.DiagnosticTestPage,
  }))
);
const TestResultPage = lazy(() =>
  import('./pages/TestResultPage').then((module) => ({
    default: module.TestResultPage,
  }))
);
const OfflinePage = lazy(() =>
  import('./pages/OfflinePage').then((module) => ({ default: module.OfflinePage }))
);

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/checkout/:courseId" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/fail" element={<CheckoutFailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/learn/:courseId/:lessonId" element={<LessonPlayerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/test/:id" element={<DiagnosticTestPage />} />
        <Route path="/test/result/:id" element={<TestResultPage />} />
        <Route path="/offline" element={<OfflinePage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

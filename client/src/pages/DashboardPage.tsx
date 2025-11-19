import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { enrollmentAPI, paymentAPI } from '../lib/api';
import type { Enrollment, Course } from '../types/course';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoBookOutline,
  IoTimeOutline,
  IoTrophyOutline,
  IoWalletOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoArrowForward,
} from 'react-icons/io5';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [enrollmentsRes, paymentsRes] = await Promise.all([
        enrollmentAPI.getMyEnrollments(),
        paymentAPI.getPayments({ limit: 5 }),
      ]);

      setEnrollments(enrollmentsRes.data.data.enrollments);
      setPayments(paymentsRes.data.data.payments);
    } catch (err: any) {
      setError(err.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter((e) => e.status === 'completed').length,
    inProgressCourses: enrollments.filter((e) => e.status === 'active').length,
    totalLessons: enrollments.reduce((acc, e) => acc + e.progress.length, 0),
    completedLessons: enrollments.reduce(
      (acc, e) => acc + e.progress.filter((p) => p.completed).length,
      0
    ),
    averageProgress:
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((acc, e) => acc + e.completionPercentage, 0) /
              enrollments.length
          )
        : 0,
  };

  if (authLoading || !user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              안녕하세요, {user.name}님!
            </h1>
            <p className="text-gray-600">오늘도 TEPS 학습을 시작해볼까요?</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <IoBookOutline className="w-6 h-6 text-brand-yellow" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats.totalCourses}
                </span>
              </div>
              <p className="text-gray-600 text-sm">수강 중인 강의</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats.completedCourses}
                </span>
              </div>
              <p className="text-gray-600 text-sm">완료한 강의</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IoTrophyOutline className="w-6 h-6 text-brand-purple" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats.completedLessons}
                </span>
              </div>
              <p className="text-gray-600 text-sm">완료한 레슨</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <IoTimeOutline className="w-6 h-6 text-brand-cyan" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats.averageProgress}%
                </span>
              </div>
              <p className="text-gray-600 text-sm">평균 진행률</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Recent Courses */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">최근 학습</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/my-courses')}
                  >
                    전체보기
                  </Button>
                </div>

                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto"></div>
                  </div>
                )}

                {!loading && enrollments.length === 0 && (
                  <div className="text-center py-8">
                    <IoBookOutline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">수강 중인 강의가 없습니다</p>
                    <Button
                      variant="yellow"
                      size="sm"
                      onClick={() => navigate('/courses')}
                    >
                      강의 둘러보기
                    </Button>
                  </div>
                )}

                {!loading && enrollments.length > 0 && (
                  <div className="space-y-4">
                    {enrollments.slice(0, 3).map((enrollment, index) => {
                      const course = enrollment.courseId as Course;
                      return (
                        <motion.div
                          key={enrollment._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-brand-yellow transition-colors cursor-pointer"
                          onClick={() => navigate(`/courses/${course._id}`)}
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-brand-yellow to-brand-pink rounded-lg flex items-center justify-center flex-shrink-0">
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <IoBookOutline className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-yellow to-brand-pink"
                                  style={{
                                    width: `${enrollment.completionPercentage}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-brand-yellow">
                                {enrollment.completionPercentage}%
                              </span>
                            </div>
                          </div>
                          <IoPlayCircleOutline className="w-8 h-8 text-brand-yellow flex-shrink-0" />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Recent Payments */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">결제 내역</h2>
                </div>

                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto"></div>
                  </div>
                )}

                {!loading && payments.length === 0 && (
                  <div className="text-center py-8">
                    <IoWalletOutline className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">결제 내역이 없습니다</p>
                  </div>
                )}

                {!loading && payments.length > 0 && (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="flex items-center justify-between py-3 border-b last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                            {(payment.courseId as Course)?.title || '강의'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {payment.amount.toLocaleString()}원
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'refunded'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {payment.status === 'completed'
                              ? '완료'
                              : payment.status === 'refunded'
                              ? '환불'
                              : '대기'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-brand-yellow to-brand-pink rounded-xl shadow-md p-6 mt-6 text-black"
              >
                <h3 className="text-lg font-bold mb-4">빠른 메뉴</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/courses')}
                    className="w-full flex items-center justify-between py-2 px-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <span className="font-semibold">강의 둘러보기</span>
                    <IoArrowForward className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="w-full flex items-center justify-between py-2 px-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <span className="font-semibold">나의 강의실</span>
                    <IoArrowForward className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

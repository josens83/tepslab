import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { enrollmentAPI } from '../lib/api';
import type { Enrollment, Course } from '../types/course';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoTrophyOutline,
  IoBookOutline,
} from 'react-icons/io5';

type EnrollmentStatus = 'all' | 'active' | 'completed' | 'expired' | 'cancelled';

const statusLabels: Record<string, string> = {
  all: '전체',
  active: '수강중',
  completed: '완료',
  expired: '만료',
  cancelled: '취소',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/my-courses' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user, statusFilter]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const response = await enrollmentAPI.getMyEnrollments(params);
      setEnrollments(response.data.data.enrollments);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '수강 내역을 불러오는데 실패했습니다.');
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressStats = (enrollment: Enrollment) => {
    const totalLessons = enrollment.progress.length;
    const completedLessons = enrollment.progress.filter((p) => p.completed).length;
    return { total: totalLessons, completed: completedLessons };
  };

  const handleContinueLearning = (enrollment: Enrollment) => {
    const courseId = typeof enrollment.courseId === 'string'
      ? enrollment.courseId
      : enrollment.courseId._id;

    // Find first incomplete lesson
    const nextLesson = enrollment.progress.find((p) => !p.completed);
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.lessonId}`);
    } else {
      navigate(`/courses/${courseId}`);
    }
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">나의 강의실</h1>
            <p className="text-gray-600">수강 중인 강의를 계속 학습하세요</p>
          </motion.div>

          {/* Status Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {(['all', 'active', 'completed', 'expired', 'cancelled'] as EnrollmentStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    statusFilter === status
                      ? 'bg-brand-yellow text-black'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              )
            )}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
                <p className="text-gray-600">강의를 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
            >
              <p className="text-red-600 font-semibold mb-2">오류 발생</p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <Button onClick={fetchEnrollments} variant="pink">
                다시 시도
              </Button>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && enrollments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-md p-12 text-center"
            >
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {statusFilter === 'all'
                  ? '수강 중인 강의가 없습니다'
                  : `${statusLabels[statusFilter]} 강의가 없습니다`}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all'
                  ? '새로운 강의를 찾아보세요'
                  : '다른 필터를 선택해보세요'}
              </p>
              {statusFilter === 'all' ? (
                <Button onClick={() => navigate('/courses')} variant="yellow">
                  강의 둘러보기
                </Button>
              ) : (
                <Button onClick={() => setStatusFilter('all')} variant="outline">
                  전체 보기
                </Button>
              )}
            </motion.div>
          )}

          {/* Enrollments Grid */}
          {!loading && !error && enrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => {
                const course = enrollment.courseId as Course;
                const stats = getProgressStats(enrollment);

                return (
                  <motion.div
                    key={enrollment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-brand-yellow to-brand-pink relative">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoTrophyOutline className="w-16 h-16 text-white" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            statusColors[enrollment.status]
                          }`}
                        >
                          {statusLabels[enrollment.status]}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>진행률</span>
                          <span className="font-bold text-brand-yellow">
                            {enrollment.completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.completionPercentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-brand-yellow to-brand-pink"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <IoBookOutline className="w-4 h-4" />
                          <span>
                            {stats.completed} / {stats.total} 강의 완료
                          </span>
                        </div>
                      </div>

                      {/* Last Accessed */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                        <IoTimeOutline className="w-4 h-4" />
                        <span>
                          최근 학습:{' '}
                          {new Date(enrollment.lastAccessedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {enrollment.status === 'active' && (
                          <>
                            {enrollment.completionPercentage === 100 ? (
                              <Button
                                fullWidth
                                variant="green"
                                size="sm"
                                icon={<IoCheckmarkCircle />}
                                onClick={() => navigate(`/courses/${course._id}`)}
                              >
                                완료된 강의
                              </Button>
                            ) : (
                              <Button
                                fullWidth
                                variant="yellow"
                                size="sm"
                                icon={<IoPlayCircleOutline />}
                                onClick={() => handleContinueLearning(enrollment)}
                              >
                                학습 계속하기
                              </Button>
                            )}
                          </>
                        )}
                        {enrollment.status === 'completed' && (
                          <Button
                            fullWidth
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/courses/${course._id}`)}
                          >
                            강의 다시보기
                          </Button>
                        )}
                        {(enrollment.status === 'expired' ||
                          enrollment.status === 'cancelled') && (
                          <Button
                            fullWidth
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/courses/${course._id}`)}
                          >
                            강의 정보 보기
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

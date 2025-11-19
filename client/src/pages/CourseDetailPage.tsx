import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { courseAPI } from '../lib/api';
import type { Course } from '../types/course';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoTimeOutline,
  IoDocumentTextOutline,
  IoTrophyOutline,
  IoPeopleOutline,
  IoStarOutline,
  IoStar,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoArrowBack,
} from 'react-icons/io5';
import { ReviewList } from '../components/review';

const targetScoreColors: Record<number, string> = {
  327: 'bg-green-100 text-green-800 border-green-300',
  387: 'bg-blue-100 text-blue-800 border-blue-300',
  450: 'bg-purple-100 text-purple-800 border-purple-300',
  550: 'bg-orange-100 text-orange-800 border-orange-300',
  600: 'bg-red-100 text-red-800 border-red-300',
};

const levelLabels: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

const categoryLabels: Record<string, string> = {
  grammar: '문법',
  vocabulary: '어휘',
  listening: '듣기',
  reading: '독해',
  comprehensive: '종합',
};

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getCourseById(id!);
      setCourse(response.data.data.course);
    } catch (err: any) {
      setError(err.response?.data?.error || '강의를 불러오는데 실패했습니다.');
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await courseAPI.checkEnrollment(id!);
      setIsEnrolled(response.data.data.isEnrolled);
    } catch (err) {
      console.error('Failed to check enrollment:', err);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    // 결제 페이지로 이동
    navigate(`/checkout/${id}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <IoStar className="w-5 h-5 text-yellow-400" />
            ) : (
              <IoStarOutline className="w-5 h-5 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const calculateTotalDuration = () => {
    if (!course) return 0;
    return course.lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
            <p className="text-gray-600">강의를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-8 max-w-md text-center"
          >
            <p className="text-red-600 font-semibold mb-2">오류 발생</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/courses')}>강의 목록으로</Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const discountPercentage = course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-brand-yellow transition-colors"
          >
            <IoArrowBack className="w-5 h-5" />
            강의 목록으로
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand-purple to-brand-pink text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Course Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${
                      targetScoreColors[course.targetScore]
                    }`}
                  >
                    목표 {course.targetScore}점
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                    {levelLabels[course.level]}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                    {categoryLabels[course.category]}
                  </span>
                </div>

                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-white/90 mb-6">{course.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <IoPeopleOutline className="w-5 h-5" />
                    <span>{course.enrolledCount.toLocaleString()}명 수강</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(course.rating))}
                    <span>
                      {course.rating.toFixed(1)} ({course.reviewsCount}개 후기)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className="w-5 h-5" />
                    <span>{calculateTotalDuration()}분</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoDocumentTextOutline className="w-5 h-5" />
                    <span>{course.lessons.length}개 강의</span>
                  </div>
                </div>
              </motion.div>

              {/* Right: Enrollment Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-brand-yellow to-brand-pink rounded-lg mb-4 flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <IoTrophyOutline className="w-16 h-16 text-white" />
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {course.discountPrice ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-brand-yellow">
                            {course.discountPrice.toLocaleString()}원
                          </span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                            {discountPercentage}% OFF
                          </span>
                        </div>
                        <span className="text-gray-400 line-through">
                          {course.price.toLocaleString()}원
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-brand-yellow">
                        {course.price.toLocaleString()}원
                      </span>
                    )}
                  </div>

                  {/* Enroll Button */}
                  {isEnrolled ? (
                    <Button
                      fullWidth
                      size="lg"
                      variant="green"
                      icon={<IoCheckmarkCircle />}
                      onClick={() => navigate('/my-courses')}
                    >
                      수강중
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="lg"
                      variant="yellow"
                      onClick={handleEnroll}
                    >
                      수강 신청하기
                    </Button>
                  )}

                  {!user && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      로그인이 필요합니다
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <IoTrophyOutline className="w-6 h-6 text-brand-yellow" />
                  학습 목표
                </h2>
                <div className="space-y-3">
                  {course.features && course.features.length > 0 ? (
                    course.features.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">학습 목표가 등록되지 않았습니다.</p>
                  )}
                </div>
              </motion.div>

              {/* Curriculum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <IoDocumentTextOutline className="w-6 h-6 text-brand-purple" />
                  커리큘럼
                </h2>
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson._id || index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-yellow transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-yellow to-brand-pink rounded-full flex items-center justify-center">
                          <IoPlayCircleOutline className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {index + 1}. {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <IoTimeOutline className="w-4 h-4" />
                          <span>{lesson.duration}분</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-md p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    수강 요건
                  </h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-brand-yellow mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-8"
              >
                <ReviewList
                  courseId={course._id}
                  courseTitle={course.title}
                  isEnrolled={isEnrolled}
                />
              </motion.div>
            </div>

            {/* Right: Instructor Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-24"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">강사 정보</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {course.instructor}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

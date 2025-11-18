import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { courseAPI, paymentAPI } from '../lib/api';
import type { Course } from '../types/course';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

export const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: `/checkout/${courseId}` } });
    }
  }, [user, authLoading, navigate, courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getCourseById(courseId!);
      setCourse(response.data.data.course);
    } catch (err: any) {
      setError(err.response?.data?.error || '강의를 불러오는데 실패했습니다.');
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!course || !user || !agreedToTerms) {
      if (!agreedToTerms) {
        alert('결제 약관에 동의해주세요.');
      }
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // 1. Prepare payment
      const prepareResponse = await paymentAPI.prepare({ courseId: course._id });
      const { orderId, amount, orderName, customerName, customerEmail } =
        prepareResponse.data.data;

      // 2. Load TossPayments SDK
      const tossPayments = await loadTossPayments(CLIENT_KEY);

      // 3. Request payment
      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || '결제 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
            <p className="text-gray-600">강의 정보를 불러오는 중...</p>
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
            <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">오류 발생</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/courses')}>강의 목록으로</Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const finalPrice = course.discountPrice || course.price;
  const discountAmount = course.discountPrice
    ? course.price - course.discountPrice
    : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">결제하기</h1>
            <p className="text-gray-600">수강 정보를 확인하고 결제를 진행해주세요</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">강의 정보</h2>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-gradient-to-br from-brand-yellow to-brand-pink rounded-lg flex items-center justify-center flex-shrink-0">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">📚</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.instructor}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-brand-yellow text-black font-bold px-2 py-1 rounded">
                        목표 {course.targetScore}점
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.lessonsCount}개 강의
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">결제 수단</h2>
                <div className="space-y-3">
                  <div className="border-2 border-brand-yellow bg-yellow-50 rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <label htmlFor="card" className="flex-1 cursor-pointer font-semibold">
                        신용/체크카드
                      </label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    *  현재 신용/체크카드 결제만 지원됩니다.
                  </p>
                </div>
              </motion.div>

              {/* Terms Agreement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">약관 동의</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <span className="flex-1 text-sm text-gray-700">
                      <span className="font-semibold">[필수]</span> 결제 대행 서비스 약관, 개인정보
                      처리 방침, 전자금융거래 이용약관에 모두 동의합니다.
                    </span>
                  </label>
                </div>
              </motion.div>
            </div>

            {/* Right: Payment Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">결제 금액</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>강의 가격</span>
                    <span>{course.price.toLocaleString()}원</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>할인 금액</span>
                      <span>-{discountAmount.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">최종 결제 금액</span>
                      <span className="text-2xl font-bold text-brand-yellow">
                        {finalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  variant="yellow"
                  onClick={handlePayment}
                  loading={processing}
                  disabled={processing || !agreedToTerms}
                >
                  {processing ? '결제 준비 중...' : '결제하기'}
                </Button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p>결제 즉시 수강이 가능합니다.</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 mt-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p>결제 후 7일 이내 환불이 가능합니다.</p>
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

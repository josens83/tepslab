import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { paymentAPI } from '../lib/api';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';

export const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface PaymentData {
    orderId: string;
    amount: number;
    method: string;
    approvedAt: string;
    receiptUrl?: string;
  }
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');

    if (!orderId || !paymentKey || !amount) {
      setError('결제 정보가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    confirmPayment(orderId, paymentKey, Number(amount));
  }, [searchParams]);

  const confirmPayment = async (
    orderId: string,
    paymentKey: string,
    amount: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentAPI.confirm({
        orderId,
        paymentKey,
        amount,
      });

      setPaymentData(response.data.data.payment);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Payment confirmation error:', err);
      setError(
        error.response?.data?.error || '결제 승인 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
            <p className="text-gray-600">결제를 승인하는 중...</p>
            <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-8 max-w-md text-center"
          >
            <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/courses')}>
                강의 목록
              </Button>
              <Button variant="yellow" onClick={() => navigate('/my-courses')}>
                내 강의실
              </Button>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-8 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <IoCheckmarkCircle className="w-12 h-12 text-green-500" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              결제가 완료되었습니다!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8"
            >
              강의 수강이 등록되었습니다.
            </motion.p>

            {/* Payment Details */}
            {paymentData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-6 mb-8 text-left"
              >
                <h2 className="font-bold text-gray-900 mb-4">결제 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-mono text-gray-900">
                      {paymentData.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-bold text-gray-900">
                      {paymentData.amount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">결제 수단</span>
                    <span className="text-gray-900">{paymentData.method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">결제 일시</span>
                    <span className="text-gray-900">
                      {new Date(paymentData.approvedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  {paymentData.receiptUrl && (
                    <div className="pt-3 border-t">
                      <a
                        href={paymentData.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-yellow hover:underline"
                      >
                        영수증 확인하기 →
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                fullWidth
                variant="outline"
                onClick={() => navigate('/courses')}
              >
                다른 강의 둘러보기
              </Button>
              <Button
                fullWidth
                variant="yellow"
                onClick={() => navigate('/my-courses')}
              >
                수강 시작하기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

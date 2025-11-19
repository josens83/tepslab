import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';

export const CheckoutFailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  const getErrorMessage = () => {
    if (message) {
      return decodeURIComponent(message);
    }

    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 승인을 거부했습니다.';
      default:
        return '결제 중 오류가 발생했습니다.';
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-8 text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <IoCloseCircle className="w-12 h-12 text-red-500" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              결제에 실패했습니다
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8"
            >
              {getErrorMessage()}
            </motion.p>

            {/* Error Details */}
            {code && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-6 mb-8 text-left"
              >
                <h2 className="font-bold text-gray-900 mb-4">오류 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">오류 코드</span>
                    <span className="font-mono text-gray-900">{code}</span>
                  </div>
                  {message && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">상세 메시지</span>
                      <span className="text-gray-900">{decodeURIComponent(message)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Help Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
            >
              <p className="text-sm text-blue-800">
                <strong>도움말:</strong> 문제가 계속되면 다른 카드를 사용하거나 고객센터로
                문의해주세요.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                fullWidth
                variant="outline"
                onClick={() => navigate('/courses')}
              >
                강의 목록으로
              </Button>
              <Button
                fullWidth
                variant="yellow"
                onClick={() => navigate(-2)} // Go back to course detail
              >
                다시 시도하기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

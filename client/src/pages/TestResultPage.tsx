import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { testAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTrophyOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoSchoolOutline,
} from 'react-icons/io5';
import type { TestResult } from '../types/test';

export const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchResult();
    }
  }, [id, user]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testAPI.getResultById(id!);
      setResult(response.data.data.result);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  if (authLoading || loading) {
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

  if (error || !result) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
            <p className="text-red-600 font-semibold mb-2">오류 발생</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>돌아가기</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const testInfo = typeof result.testId === 'object' ? result.testId : null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Result Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl shadow-md p-8 mb-8 text-center ${
              result.isPassed
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            }`}
          >
            {result.isPassed ? (
              <IoTrophyOutline className="w-16 h-16 mx-auto mb-4" />
            ) : (
              <IoSchoolOutline className="w-16 h-16 mx-auto mb-4" />
            )}

            <h1 className="text-3xl font-bold mb-2">
              {result.isPassed ? '테스트 통과!' : '테스트 완료'}
            </h1>

            {testInfo && <p className="text-white/90 mb-4">{testInfo.title}</p>}

            <div className="text-5xl font-bold mb-2">{result.estimatedScore}점</div>
            <p className="text-white/80">예상 TEPS 점수</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <IoCheckmarkCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
              <p className="text-sm text-gray-500">정답</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <IoStatsChartOutline className="w-8 h-8 text-brand-yellow mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{result.percentage}%</p>
              <p className="text-sm text-gray-500">정답률</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <IoTimeOutline className="w-8 h-8 text-brand-purple mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(result.timeSpent)}
              </p>
              <p className="text-sm text-gray-500">소요 시간</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <IoTrophyOutline className="w-8 h-8 text-brand-pink mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{result.score}점</p>
              <p className="text-sm text-gray-500">획득 점수</p>
            </motion.div>
          </div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">영역별 분석</h2>
            <div className="space-y-4">
              {Object.entries(result.scoreBreakdown).map(([key, value]) => {
                const percentage =
                  value.total > 0
                    ? Math.round((value.correct / value.total) * 100)
                    : 0;
                const labels: Record<string, string> = {
                  grammar: '문법',
                  vocabulary: '어휘',
                  listening: '듣기',
                  reading: '독해',
                };

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        {labels[key]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {value.correct}/{value.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentage >= 70
                            ? 'bg-green-500'
                            : percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Detailed Answers */}
          {result.answers && result.answers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-md p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">문제별 결과</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? '접기' : '자세히 보기'}
                </Button>
              </div>

              {showAnswers && (
                <div className="space-y-6">
                  {result.answers.map((answer) => (
                    <div
                      key={answer.questionId}
                      className={`p-4 rounded-lg border-2 ${
                        answer.isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-semibold">
                          문제 {answer.questionNumber}
                        </span>
                        {answer.isCorrect ? (
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <IoCloseCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      {answer.questionText && (
                        <p className="text-gray-700 mb-3">{answer.questionText}</p>
                      )}

                      {answer.options && (
                        <div className="space-y-2 mb-3">
                          {answer.options.map((option, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded text-sm ${
                                i === answer.correctAnswer
                                  ? 'bg-green-100 text-green-800'
                                  : i === answer.selectedAnswer && !answer.isCorrect
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-white'
                              }`}
                            >
                              <span className="font-semibold mr-2">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {option}
                              {i === answer.correctAnswer && (
                                <span className="ml-2 text-green-600">✓ 정답</span>
                              )}
                              {i === answer.selectedAnswer &&
                                !answer.isCorrect && (
                                  <span className="ml-2 text-red-600">
                                    (선택한 답)
                                  </span>
                                )}
                            </div>
                          ))}
                        </div>
                      )}

                      {answer.explanation && (
                        <div className="bg-white p-3 rounded text-sm">
                          <strong>해설:</strong> {answer.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              대시보드로
            </Button>
            <Button variant="yellow" onClick={() => navigate('/courses')}>
              추천 강의 보기
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

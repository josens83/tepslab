import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { testAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoTimeOutline,
  IoArrowBack,
  IoArrowForward,
  IoFlagOutline,
} from 'react-icons/io5';
import type { Test, UserAnswer } from '../types/test';

export const DiagnosticTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Test state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: `/test/${id}` } });
    }
  }, [user, authLoading, navigate, id]);

  useEffect(() => {
    if (id && user) {
      fetchTest();
    }
  }, [id, user]);

  // Timer
  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [started, timeRemaining]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testAPI.getTestById(id!);
      setTest(response.data.data.test);
      setTimeRemaining(response.data.data.test.duration * 60);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '테스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, {
        questionId,
        answer: answerIndex,
      });
      return newAnswers;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!test || submitting) return;

    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const answersArray = Array.from(answers.values());
      const response = await testAPI.submitTest(test._id, {
        answers: answersArray,
        timeSpent,
      });

      navigate(`/test/result/${response.data.data.result._id}`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '테스트 제출에 실패했습니다.');
      setSubmitting(false);
    }
  }, [test, answers, startTime, navigate, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  if (error || !test) {
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

  // Start screen
  if (!started) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
              <p className="text-gray-600 mb-6">{test.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">문제 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {test.totalQuestions}문제
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">제한 시간</p>
                  <p className="text-2xl font-bold text-gray-900">{test.duration}분</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">합격 점수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {test.passingScore}점
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">목표 점수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {test.targetScore}점
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>주의사항:</strong> 테스트를 시작하면 타이머가 시작됩니다. 중간에
                  나가면 진행 상황이 저장되지 않습니다.
                </p>
              </div>

              <Button
                fullWidth
                size="lg"
                variant="yellow"
                onClick={handleStart}
              >
                테스트 시작하기
              </Button>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = test.questions?.[currentIndex];
  const answeredCount = answers.size;
  const progress = (answeredCount / test.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-gray-900">{test.title}</h1>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 60
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <IoTimeOutline className="w-5 h-5" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {answeredCount} / {test.totalQuestions} 답변 완료
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-yellow transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {currentQuestion && (
          <motion.div
            key={currentQuestion._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-brand-yellow">
                문제 {currentIndex + 1}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                {currentQuestion.questionType}
              </span>
            </div>

            <p className="text-lg text-gray-900 mb-8 whitespace-pre-wrap">
              {currentQuestion.questionText}
            </p>

            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="mb-6 max-w-full rounded-lg"
              />
            )}

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected =
                  answers.get(currentQuestion._id)?.answer === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion._id, index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-brand-yellow bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            icon={<IoArrowBack />}
          >
            이전
          </Button>

          <div className="flex gap-2">
            {/* Question navigation dots */}
            {test.questions?.map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-full text-xs font-bold ${
                  i === currentIndex
                    ? 'bg-brand-yellow text-black'
                    : answers.has(q._id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex === test.totalQuestions - 1 ? (
            <Button
              variant="yellow"
              onClick={handleSubmit}
              loading={submitting}
              icon={<IoFlagOutline />}
            >
              제출하기
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(test.totalQuestions - 1, prev + 1)
                )
              }
              icon={<IoArrowForward />}
            >
              다음
            </Button>
          )}
        </div>

        {/* Submit button (always visible) */}
        {currentIndex < test.totalQuestions - 1 && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              loading={submitting}
            >
              테스트 종료 및 제출
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Logo } from '../components/common';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithOAuth, user, loading: isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!user;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    targetScore: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('비밀번호는 8자 이상이어야 합니다');
      return;
    }

    // Prepare data (birthDate reserved for future use)
    // const birthDate = formData.birthYear && formData.birthMonth && formData.birthDay
    //   ? `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
    //   : undefined;

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, formData.name);
      if (signUpError) {
        setError(signUpError.message || '회원가입에 실패했습니다.');
      } else {
        // Show success message - email verification may be required
        alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
        navigate('/login');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || '회원가입에 실패했습니다.');
    }
  };

  const handleSocialLogin = async (provider: 'kakao' | 'google' | 'github') => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      const error = err as Error;
      setError(error.message || '소셜 로그인에 실패했습니다.');
    }
  };

  // Generate year options (last 80 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <Logo size="lg" variant="white" />
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">회원가입</h1>
          <p className="text-gray-400">
            텝스 목표 점수 달성을 위한 첫 걸음
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Error Message */}
          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error || validationError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                필수 정보
              </h3>

              <Input
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                fullWidth
              />

              <Input
                label="이름"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                required
                fullWidth
              />

              <Input
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8자 이상 입력해주세요"
                helperText="8자 이상 입력해주세요"
                required
                fullWidth
              />

              <Input
                label="비밀번호 확인"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력해주세요"
                required
                fullWidth
              />
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700">
                선택 정보
              </h3>

              <Input
                label="연락처"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01012345678"
                helperText="'-' 없이 입력해주세요"
                fullWidth
              />

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  >
                    <option value="">연도</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  >
                    <option value="">월</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>

                  <select
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  >
                    <option value="">일</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}일
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  목표 점수
                </label>
                <select
                  name="targetScore"
                  value={formData.targetScore}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  <option value="">선택하세요</option>
                  <option value="327">327점 (기초)</option>
                  <option value="387">387점 (중급)</option>
                  <option value="450">450점 (중상급)</option>
                  <option value="550">550점 (고급)</option>
                  <option value="600">600점 이상 (초고급)</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-6"
            >
              회원가입
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                또는 소셜 계정으로 가입
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 가입
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.74 5.07 4.38 6.48-.18.66-.63 2.25-.72 2.61-.12.48.18.48.36.36.15-.09 2.16-1.44 2.79-1.86C9.6 18.6 10.8 18.6 12 18.6c5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
              </svg>
              카카오로 가입
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="w-full bg-[#24292e] hover:bg-[#1b1f23] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub로 가입
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-brand-yellow font-bold hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

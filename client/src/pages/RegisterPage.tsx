import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Logo } from '../components/common';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

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
      clearError();
    };
  }, [clearError]);

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

    // Prepare data
    const birthDate =
      formData.birthYear && formData.birthMonth && formData.birthDay
        ? `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
        : undefined;

    const registerData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || undefined,
      birthDate,
      targetScore: formData.targetScore ? parseInt(formData.targetScore) : undefined,
    };

    try {
      await register(registerData);
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
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
              onClick={() => handleSocialLogin('naver')}
              className="w-full bg-[#03C75A] hover:bg-[#02B350] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl font-bold">N</span>
              네이버로 가입
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

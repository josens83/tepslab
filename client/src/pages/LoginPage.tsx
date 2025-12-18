import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Logo } from '../components/common';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithOAuth, user, loading: isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!user;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);
      if (signInError) {
        setError(signInError.message || '로그인에 실패했습니다.');
      } else {
        navigate('/');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || '로그인에 실패했습니다.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <Logo size="lg" variant="white" />
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">로그인</h1>
          <p className="text-gray-400">
            TepsLab에 오신 것을 환영합니다
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                또는 소셜 계정으로 로그인
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
              Google로 로그인
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.74 5.07 4.38 6.48-.18.66-.63 2.25-.72 2.61-.12.48.18.48.36.36.15-.09 2.16-1.44 2.79-1.86C9.6 18.6 10.8 18.6 12 18.6c5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
              </svg>
              카카오로 로그인
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="w-full bg-[#24292e] hover:bg-[#1b1f23] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub로 로그인
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/register"
                className="text-brand-yellow font-bold hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

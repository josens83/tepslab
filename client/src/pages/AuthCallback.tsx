import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/common';
import { useAuthStore } from '../store/authStore';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // OAuth failed
      console.error('OAuth error:', error);
      navigate('/login?error=social_login_failed');
      return;
    }

    if (token) {
      // Save token to localStorage
      localStorage.setItem('token', token);

      // Fetch user data
      useAuthStore.getState().fetchCurrentUser().then(() => {
        navigate('/');
      });
    } else {
      // No token or error, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" color="yellow" />
        <p className="text-white mt-4 text-lg">로그인 처리 중...</p>
      </div>
    </div>
  );
};

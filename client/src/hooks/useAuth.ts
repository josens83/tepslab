import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUserFromStorage,
    fetchCurrentUser,
    clearError,
  } = useAuthStore();

  // Load user from localStorage on mount
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  };
};

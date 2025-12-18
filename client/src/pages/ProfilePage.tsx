import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common';
import { userAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoTrophyOutline,
  IoLockClosedOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
} from 'react-icons/io5';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    birthDate: '',
    targetScore: 0,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Delete form state
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        targetScore: user.targetScore || 0,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await userAPI.updateProfile(profileForm);
      setMessage({ type: 'success', text: '프로필이 수정되었습니다.' });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '프로필 수정에 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      setLoading(false);
      return;
    }

    try {
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '비밀번호 변경에 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm('정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await userAPI.deleteAccount({ password: deletePassword });
      logout();
      navigate('/');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage({
        type: 'error',
        text: error.response?.data?.error || '회원 탈퇴에 실패했습니다.',
      });
      setLoading(false);
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
            <p className="text-gray-600">프로필 정보를 확인하고 수정할 수 있습니다</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                {/* User Avatar */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-yellow to-brand-pink rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                {/* Menu */}
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setMessage(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-brand-yellow text-black font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <IoPersonOutline className="w-5 h-5" />
                    <span>프로필 수정</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('password');
                      setMessage(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'password'
                        ? 'bg-brand-yellow text-black font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <IoLockClosedOutline className="w-5 h-5" />
                    <span>비밀번호 변경</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('delete');
                      setMessage(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'delete'
                        ? 'bg-red-500 text-white font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <IoTrashOutline className="w-5 h-5" />
                    <span>회원 탈퇴</span>
                  </button>
                </nav>
              </motion.div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                {/* Message */}
                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <IoAlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 수정</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IoPersonOutline className="inline w-4 h-4 mr-1" />
                          이름
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Email (readonly) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IoMailOutline className="inline w-4 h-4 mr-1" />
                          이메일
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IoCallOutline className="inline w-4 h-4 mr-1" />
                          전화번호
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="010-0000-0000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                        />
                      </div>

                      {/* Birth Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IoCalendarOutline className="inline w-4 h-4 mr-1" />
                          생년월일
                        </label>
                        <input
                          type="date"
                          value={profileForm.birthDate}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, birthDate: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                        />
                      </div>

                      {/* Target Score */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IoTrophyOutline className="inline w-4 h-4 mr-1" />
                          목표 점수
                        </label>
                        <select
                          value={profileForm.targetScore}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              targetScore: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                        >
                          <option value={0}>선택안함</option>
                          <option value={300}>300점</option>
                          <option value={400}>400점</option>
                          <option value={500}>500점</option>
                          <option value={600}>600점</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        variant="yellow"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                      >
                        프로필 저장
                      </Button>
                    </form>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">비밀번호 변경</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          현재 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          새 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="8자 이상"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          새 비밀번호 확인
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="yellow"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                      >
                        비밀번호 변경
                      </Button>
                    </form>
                  </div>
                )}

                {/* Delete Tab */}
                {activeTab === 'delete' && (
                  <div>
                    <h2 className="text-xl font-bold text-red-600 mb-6">회원 탈퇴</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800 text-sm">
                        <strong>주의:</strong> 회원 탈퇴 시 모든 수강 정보와 학습 기록이
                        삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </p>
                    </div>
                    <form onSubmit={handleDeleteAccount} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          비밀번호 확인
                        </label>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="비밀번호를 입력하세요"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="outline"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        회원 탈퇴
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

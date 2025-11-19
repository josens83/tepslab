import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMenu, IoClose, IoChevronDown, IoPerson, IoLogOut } from 'react-icons/io5';
import { Logo } from '../common';
import { Button } from '../common';
import { useAuth } from '../../hooks/useAuth';

interface MenuItem {
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { label: '수강신청', href: '/courses' },
  { label: '수험생 후기', href: '/reviews' },
  {
    label: '무료 강의',
    href: '/free-courses',
    submenu: [
      { label: '무료 단어장', href: '/free-vocabulary' },
      { label: '무료 성적 컨설팅', href: '/free-consulting' },
    ],
  },
  { label: '기출문제 해설', href: '/past-exams' },
  { label: '컨설팀스 소개', href: '/about' },
];

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (href: string) => location.pathname === href;

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className={`flex items-center gap-1 text-gray-700 hover:text-brand-yellow font-medium transition-colors ${
                        isActive(item.href) ? 'text-brand-yellow' : ''
                      }`}
                      onMouseEnter={() => setOpenSubmenu(item.label)}
                    >
                      {item.label}
                      <IoChevronDown className="w-4 h-4" />
                    </button>

                    {/* Submenu */}
                    <AnimatePresence>
                      {openSubmenu === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onMouseLeave={() => setOpenSubmenu(null)}
                          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                        >
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.href}
                              to={subitem.href}
                              className={`block px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                isActive(subitem.href)
                                  ? 'text-brand-yellow font-semibold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {subitem.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.href}
                    className={`text-gray-700 hover:text-brand-yellow font-medium transition-colors ${
                      isActive(item.href) ? 'text-brand-yellow' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <IoPerson className="w-5 h-5" />
                  <span className="font-medium">{user?.name || '사용자'}</span>
                  <IoChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <IoPerson className="w-4 h-4" />
                        나의 강의실
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <IoPerson className="w-4 h-4" />
                        프로필
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <IoLogOut className="w-4 h-4" />
                        로그아웃
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="yellow" size="sm">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <IoClose className="w-6 h-6" />
            ) : (
              <IoMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {/* User Info (Mobile) */}
              {isAuthenticated ? (
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center">
                      <IoPerson className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{user?.name || '사용자'}</p>
                      <Link
                        to="/dashboard"
                        className="text-sm text-brand-yellow"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        나의 강의실
                      </Link>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="pb-4 border-b border-gray-200 space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="yellow"
                      size="sm"
                      fullWidth
                    >
                      로그인
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}

              {/* Navigation Items */}
              {menuItems.map((item) => (
                <div key={item.label}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                          isActive(item.href) ? 'bg-brand-yellow bg-opacity-10 text-brand-yellow' : ''
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <IoChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openSubmenu === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {openSubmenu === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-2 space-y-1"
                          >
                            {item.submenu.map((subitem) => (
                              <Link
                                key={subitem.href}
                                to={subitem.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                  isActive(subitem.href)
                                    ? 'bg-brand-yellow bg-opacity-10 text-brand-yellow font-semibold'
                                    : ''
                                }`}
                              >
                                {subitem.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium ${
                        isActive(item.href) ? 'bg-brand-yellow bg-opacity-10 text-brand-yellow' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

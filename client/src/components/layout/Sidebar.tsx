import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoHome,
  IoBook,
  IoPeople,
  IoCard,
  IoStatsChart,
  IoSettings,
  IoChevronDown,
  IoChevronForward,
} from 'react-icons/io5';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  submenu?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: '대시보드',
    icon: IoHome,
    href: '/admin',
  },
  {
    label: '강의 관리',
    icon: IoBook,
    submenu: [
      { label: '강의 목록', href: '/admin/courses' },
      { label: '강의 추가', href: '/admin/courses/new' },
      { label: '강의 카테고리', href: '/admin/courses/categories' },
    ],
  },
  {
    label: '회원 관리',
    icon: IoPeople,
    submenu: [
      { label: '회원 목록', href: '/admin/users' },
      { label: '회원 통계', href: '/admin/users/stats' },
    ],
  },
  {
    label: '결제 관리',
    icon: IoCard,
    submenu: [
      { label: '결제 내역', href: '/admin/payments' },
      { label: '환불 관리', href: '/admin/payments/refunds' },
    ],
  },
  {
    label: '통계',
    icon: IoStatsChart,
    href: '/admin/statistics',
  },
  {
    label: '설정',
    icon: IoSettings,
    href: '/admin/settings',
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  const isSubmenuActive = (submenu?: { label: string; href: string }[]) => {
    if (!submenu) return false;
    return submenu.some((item) => location.pathname.startsWith(item.href));
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <aside
      className={`bg-gray-900 text-white h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <h1 className={`font-bold ${isCollapsed ? 'text-xl' : 'text-2xl'}`}>
            {isCollapsed ? 'C' : '관리자'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = !!item.submenu;
              const submenuActive = isSubmenuActive(item.submenu);
              const menuActive = item.href ? isActive(item.href) : submenuActive;

              return (
                <li key={item.label}>
                  {hasSubmenu ? (
                    <>
                      {/* Menu with Submenu */}
                      <button
                        onClick={() => !isCollapsed && toggleSubmenu(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          menuActive
                            ? 'bg-brand-yellow text-gray-900'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <IoChevronDown
                            className={`w-4 h-4 transition-transform ${
                              openSubmenu === item.label || submenuActive ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>

                      {/* Submenu */}
                      {!isCollapsed && (openSubmenu === item.label || submenuActive) && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1 ml-4 space-y-1"
                        >
                          {item.submenu?.map((subitem) => (
                            <li key={subitem.href}>
                              <Link
                                to={subitem.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  isActive(subitem.href)
                                    ? 'bg-brand-yellow bg-opacity-20 text-brand-yellow'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                <IoChevronForward className="w-3 h-3" />
                                <span className="text-sm">{subitem.label}</span>
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </>
                  ) : (
                    /* Simple Menu Item */
                    <Link
                      to={item.href!}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        menuActive
                          ? 'bg-brand-yellow text-gray-900'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile (Bottom) */}
        <div className="border-t border-gray-800 p-4">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-gray-900 font-bold flex-shrink-0">
              A
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">관리자</p>
                <p className="text-xs text-gray-400 truncate">admin@consulteps.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  showText?: boolean;
  className?: string;
  clickable?: boolean;
}

const sizeStyles = {
  sm: {
    icon: 'w-8 h-8',
    text: 'text-lg',
  },
  md: {
    icon: 'w-10 h-10',
    text: 'text-xl',
  },
  lg: {
    icon: 'w-12 h-12',
    text: 'text-2xl',
  },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showText = true,
  className = '',
  clickable = true,
}) => {
  const iconColor = variant === 'white' ? 'text-white' : 'text-brand-yellow';
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';

  const logoContent = (
    <>
      {/* Logo Icon - 육각형 C */}
      <div className={`${sizeStyles[size].icon} ${iconColor} relative flex-shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 육각형 배경 */}
          <path
            d="M20 2L35 11V29L20 38L5 29V11L20 2Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* C 글자 */}
          <path
            d="M25 14C23 12 21 11 18 11C14 11 11 14 11 18V22C11 26 14 29 18 29C21 29 23 28 25 26"
            stroke={variant === 'white' ? '#1F2937' : 'white'}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizeStyles[size].text} font-bold ${textColor} leading-tight`}>
            텝스의 정석
          </span>
          <span className={`text-xs ${textColor} opacity-80`}>
            컨설팀스
          </span>
        </div>
      )}
    </>
  );

  if (clickable) {
    return (
      <Link to="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoContent}
    </div>
  );
};

export default Logo;

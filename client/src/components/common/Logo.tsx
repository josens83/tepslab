import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Hexagon shape */}
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill="#FFC600"
            stroke="#000"
            strokeWidth="3"
          />
          {/* Letter C */}
          <path
            d="M65 30 A20 20 0 0 1 65 70 M65 30 L55 30 M65 70 L55 70"
            fill="none"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="8" fill="#000" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-light">텝스의 정석,</span>
        <span className="text-xl font-bold">컨설텝스</span>
      </div>
    </div>
  );
};

export default Logo;

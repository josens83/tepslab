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
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';

  const logoContent = (
    <>
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizeStyles[size].text} font-bold ${textColor} leading-tight`}>
            TepsLab
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

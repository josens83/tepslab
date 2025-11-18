import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  onClick,
  padding = 'md',
}) => {
  const baseStyles = 'bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '';
  const paddingStyle = paddingStyles[padding];

  const cardClasses = `${baseStyles} ${hoverStyles} ${paddingStyle} ${className}`.trim();

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={cardClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return <h3 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h3>;
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>{children}</div>;
};

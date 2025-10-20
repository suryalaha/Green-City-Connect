
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card dark:bg-dark-card rounded-xl shadow-soft-lg p-6 transition-all duration-300 hover:shadow-xl dark:shadow-black/20 hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
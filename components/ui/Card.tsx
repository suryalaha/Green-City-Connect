
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card dark:bg-dark-card rounded-2xl shadow-soft-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${className}`}>
      {children}
    </div>
  );
};

export default Card;

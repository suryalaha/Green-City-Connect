
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card dark:bg-dark-card rounded-xl shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
        style={{ borderTopColor: 'transparent' }} // Garante que a borda superior seja transparente
      ></div>
      {message && <p className="mt-3 text-gray-400 text-sm">{message}</p>}
    </div>
  );
};

export default Spinner; 
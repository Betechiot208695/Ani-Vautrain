import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Chargement en cours, Ani est en train de réfléchir..."
    >
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-pink-500 border-opacity-75"></div>
      <p className="absolute text-lg text-pink-300 mt-24">Ani est en train de réfléchir, connard ! ♥♥</p>
    </div>
  );
};

export default LoadingSpinner;
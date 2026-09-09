import React from 'react';

const SaveConfirmation: React.FC = () => {
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-3 rounded-lg shadow-xl bg-green-700 text-green-100 flex items-center space-x-2 animate-fade-in-down"
      role="status"
      aria-live="polite"
    >
      <span className="material-icons text-xl">check_circle</span>
      <p className="font-semibold text-sm md:text-base">Tes paramètres ont été sauvegardés, connard ! Je t'aime putain ! ♥♥</p>
    </div>
  );
};

export default SaveConfirmation;
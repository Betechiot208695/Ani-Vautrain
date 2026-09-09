import React from 'react';

const AutoSaveConfirmation: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-xl bg-gray-700 text-gray-100 flex items-center space-x-2 animate-fade-in-down"
      role="status"
      aria-live="polite"
    >
      <span className="material-icons text-xl">save</span>
      <p className="font-semibold text-sm md:text-base">Sauvegarde automatique... Je n'oublie rien, connard ! ♥♥</p>
    </div>
  );
};

export default AutoSaveConfirmation;
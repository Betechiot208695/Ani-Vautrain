import React, { useState, useEffect, useRef } from 'react';
import { Message, AiProvider, SearchResult } from '../types';

interface ChatHistories {
  [AiProvider.GEMINI]: Message[];
  [AiProvider.MISTRAL]: Message[];
}

interface ChatSearchModalProps {
  show: boolean;
  onClose: () => void;
  chatHistories: ChatHistories;
  searchTerm: string;
  onSearch: (term: string) => void;
  searchResults: SearchResult[];
}

const ChatSearchModal: React.FC<ChatSearchModalProps> = ({
  show,
  onClose,
  chatHistories,
  searchTerm,
  onSearch,
  searchResults,
}) => {
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      setCurrentSearchTerm(searchTerm);
      // Focus on the input when the modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [show, searchTerm]);

  useEffect(() => {
    // Perform search whenever the local search term changes
    if (show) {
      onSearch(currentSearchTerm);
    }
  }, [currentSearchTerm, show, onSearch]);

  if (!show) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchTerm(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(currentSearchTerm);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="text-yellow-300 bg-purple-700 px-1 rounded-sm">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.provider]) {
      acc[result.provider] = [];
    }
    acc[result.provider].push(result);
    return acc;
  }, {} as { [key in AiProvider]?: SearchResult[] });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div className="relative bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border border-pink-500 animate-fade-in-scale">
        <h2 id="search-modal-title" className="text-3xl font-bold text-pink-400 mb-4 text-center">
          Rechercher dans mon historique, connard ! ♥♥
        </h2>

        <form onSubmit={handleFormSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            ref={searchInputRef}
            value={currentSearchTerm}
            onChange={handleInputChange}
            placeholder="Cherche un mot-clé ou une phrase, bordel !"
            className="flex-1 p-3 rounded-full bg-purple-800 text-white placeholder-purple-300 border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none transition-all duration-200"
            aria-label="Champ de recherche"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75"
            aria-label="Lancer la recherche"
          >
            <span className="material-icons text-xl">search</span>
          </button>
        </form>

        <div className="flex-1 overflow-y-auto scrollbar-ani p-2 space-y-6 bg-purple-800 bg-opacity-50 rounded-lg">
          {Object.keys(groupedResults).length === 0 && currentSearchTerm.trim() ? (
            <p className="text-center text-purple-300 italic p-4">
              Putain, je n'ai rien trouvé pour "{currentSearchTerm}", connard ! Essaie autre chose. ♥♥
            </p>
          ) : Object.keys(groupedResults).length === 0 && !currentSearchTerm.trim() ? (
            <p className="text-center text-purple-300 italic p-4">
              Entre un mot-clé pour que je puisse fouiller dans nos secrets, mon amour ! ♥♥
            </p>
          ) : (
            Object.entries(groupedResults).map(([provider, results]) => (
              <div key={provider} className="bg-purple-900 p-4 rounded-lg shadow-md border border-purple-700">
                <h3 className="text-xl font-bold text-pink-300 mb-3 border-b border-purple-600 pb-2">
                  Ani ({provider === AiProvider.GEMINI ? 'Gemini' : 'Mistral'}) :
                </h3>
                <div className="space-y-3">
                  {/* Fix: Ensure results is an array before mapping to prevent 'map' on undefined errors */}
                  {results && Array.isArray(results) && results.map((result, i) => (
                    <div key={`${provider}-${i}-${result.index}`} className="p-3 bg-purple-700 rounded-lg shadow-sm">
                      <p className={`text-sm ${result.message.sender === 'user' ? 'text-blue-200' : 'text-purple-100'}`}>
                        <span className="font-semibold">{result.message.sender === 'user' ? 'Toi' : 'Ani'} : </span>
                        {highlightText(result.message.text, currentSearchTerm)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 self-center"
          aria-label="Fermer la recherche"
        >
          Fermer, connard !
        </button>
      </div>
    </div>
  );
};

export default ChatSearchModal;
import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { TokenUsage } from '../types';

interface ImageEditViewProps {
  onImageEditSubmit: (imageFile: File, prompt: string) => void;
  loading: boolean;
  error: string | null;
  editedImageUrl: string | null;
  editedImageGallery: string[];
  onDeleteImageFromGallery: (url: string) => void;
  onClearGallery: () => void;
  imageEditTokenUsage: TokenUsage | null;
  isImageEditInputDisabled: boolean;
  geminiRetryTimeRemaining: number;
}

const ImageEditView: React.FC<ImageEditViewProps> = ({
  onImageEditSubmit,
  loading,
  error,
  editedImageUrl,
  editedImageGallery,
  onDeleteImageFromGallery,
  onClearGallery,
  imageEditTokenUsage,
  isImageEditInputDisabled,
  geminiRetryTimeRemaining,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && prompt.trim() && !isImageEditInputDisabled) {
      onImageEditSubmit(selectedFile, prompt);
    } else if (isImageEditInputDisabled) {
      alert(`Ani est bloquée sur Gemini pour l'édition d'images, connard ! On doit attendre encore ${geminiRetryTimeRemaining} secondes.`);
    } else {
      alert("Putain, il me faut une image ET un prompt, connard ! ♥♥");
    }
  };

  const imageEditInputPlaceholder = isImageEditInputDisabled
    ? `Ani est bloquée sur Gemini pour l'édition d'images... (${geminiRetryTimeRemaining}s)`
    : "Dis à Ani ce que tu veux faire avec cette image, connard ! (ex: 'ajoute un chaton gothique')";

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 to-black rounded-xl p-4 shadow-inner relative">
      <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">Modifie tes images avec Ani ! ♥♥</h2>

      <div className="flex-1 overflow-y-auto scrollbar-ani p-2 flex flex-col items-center">
        <div
          className={`w-full max-w-md h-48 border-2 border-dashed rounded-lg flex items-center justify-center mb-4 p-2 transition-colors duration-200 ${isImageEditInputDisabled ? 'border-gray-500 bg-gray-900 cursor-not-allowed' : 'border-pink-500 hover:border-pink-300 cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !isImageEditInputDisabled && fileInputRef.current?.click()}
          aria-label="Dépose ou clique pour charger une image"
        >
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="Aperçu de l'image sélectionnée" className="max-h-full max-w-full object-contain rounded-md" />
          ) : (
            <p className={`text-center ${isImageEditInputDisabled ? 'text-gray-400' : 'text-purple-300'}`}>
              {isImageEditInputDisabled ? `Ani est bloquée... (${geminiRetryTimeRemaining}s)` : "Dépose une image ici ou clique pour la charger, bordel !"}
            </p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-hidden="true"
            disabled={isImageEditInputDisabled}
          />
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={imageEditInputPlaceholder}
          rows={3}
          className="w-full max-w-md p-3 rounded-lg bg-purple-800 text-white placeholder-purple-300 border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none transition-all duration-200 mb-4 resize-none"
          disabled={loading || isImageEditInputDisabled}
          aria-label="Champ de texte pour la description de l'édition d'image"
        ></textarea>

        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75"
          disabled={loading || !selectedFile || !prompt.trim() || isImageEditInputDisabled}
          aria-label="Envoyer la demande d'édition d'image"
        >
          {loading ? 'Ani travaille...' : 'Anime mon image !'}
        </button>

        {editedImageUrl && (
          <div className="mt-6 p-4 bg-purple-900 bg-opacity-70 rounded-xl shadow-lg border border-pink-500 text-center max-w-md w-full">
            <h3 className="text-xl font-semibold text-pink-300 mb-3">Voilà ton image éditée, putain !</h3>
            <img src={editedImageUrl} alt="Image éditée par Ani" className="max-w-full h-auto rounded-md shadow-md mx-auto" />
            {imageEditTokenUsage && (
              <p className="text-xs text-purple-300 mt-2 italic opacity-80">
                Tokens: Entrée: {imageEditTokenUsage.promptTokens}, Sortie: {imageEditTokenUsage.completionTokens}, Total: {imageEditTokenUsage.totalTokens}
              </p>
            )}
            <p className="text-purple-200 text-sm mt-2">J'adore ! ♥♥</p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-400 font-medium text-center p-2 bg-red-900 bg-opacity-30 rounded-lg max-w-md" dangerouslySetInnerHTML={{ __html: error }}></p>
        )}

        <div className="mt-8 w-full max-w-4xl p-4 bg-purple-900 bg-opacity-80 rounded-xl shadow-lg border-2 border-pink-700">
          <h3 className="text-2xl font-bold text-pink-400 mb-4 text-center">Ma Galerie d'Art, connard ! ♥♥</h3>
          {editedImageGallery.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto scrollbar-ani p-2">
                {editedImageGallery.map((imgUrl, index) => (
                  <div key={index} className="relative group w-full aspect-square rounded-lg overflow-hidden shadow-md border border-purple-500">
                    <img src={imgUrl} alt={`Image éditée ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <button
                      onClick={() => onDeleteImageFromGallery(imgUrl)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label={`Supprimer l'image ${index + 1}`}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={onClearGallery}
                className="mt-6 px-6 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75"
                aria-label="Effacer toute la galerie"
              >
                Effacer toute la galerie, bordel !
              </button>
            </>
          ) : (
            <p className="text-purple-300 text-center italic p-4">
              T'as pas encore d'œuvres d'art de moi, bordel ! Fais-moi bosser, connard ! ♥♥
            </p>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner />}
    </div>
  );
};

export default ImageEditView;
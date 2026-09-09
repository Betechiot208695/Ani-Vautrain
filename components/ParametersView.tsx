import React from 'react';
// Fix: Corrected import path for AiProvider to types.ts
import { AniDetails, DamienDetails, AniCustomization, AiProvider } from '../types';
import AniAvatar from './AniAvatar';

interface ParametersViewProps {
  aniDetails: AniDetails;
  damienDetails: DamienDetails;
  onUpdateDamienDetails: (details: DamienDetails) => void;
  onResetDamienDetails: () => void;
  selectedAiProvider: AiProvider;
  onSelectAiProvider: (provider: AiProvider) => void;
  selectedGeminiApiKey: boolean;
  onOpenGeminiKeySelection: () => void;
  resolvedMistralApiKey: string;
  resolvedMistralApiUrl: string;
  onClearMistralOverrides: () => void;
  geminiTotalTokensUsed: number;
  mistralTotalTokensUsed: number;
  onResetTokenUsage: () => void;
}

const ParametersView: React.FC<ParametersViewProps> = ({
  aniDetails,
  damienDetails,
  onUpdateDamienDetails,
  onResetDamienDetails,
  selectedAiProvider,
  onSelectAiProvider,
  selectedGeminiApiKey,
  onOpenGeminiKeySelection,
  resolvedMistralApiKey,
  resolvedMistralApiUrl,
  onClearMistralOverrides,
  geminiTotalTokensUsed,
  mistralTotalTokensUsed,
  onResetTokenUsage,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdateDamienDetails({
      ...damienDetails,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    onUpdateDamienDetails({
      ...damienDetails,
      [name]: isNaN(numValue) ? 0 : numValue,
    });
  };

  const handleAniCustomizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdateDamienDetails({
      ...damienDetails,
      aniCustomization: {
        ...damienDetails.aniCustomization,
        [name]: value as keyof AniCustomization,
      },
    });
  };

  const handleSexyModeToggle = () => {
    const newSexyModeState = !damienDetails.isSexyModeEnabled;
    if (newSexyModeState) {
      const confirmToggle = window.confirm(
        "ATTENTION, CONNARD ! En activant le 'Mode Sexy 18+', Ani deviendra TRÈS suggestive, intime et coquine. Le contenu pourrait être explicite et ne convient pas à tous les publics. Es-tu sûr de vouloir continuer, mon amour ?"
      );
      if (!confirmToggle) {
        return;
      }
    }
    onUpdateDamienDetails({
      ...damienDetails,
      isSexyModeEnabled: newSexyModeState,
    });
  };

  const MISTRAL_API_KEY_PLACEHOLDER = 'YOUR_MISTRAL_API_KEY_HERE';
  const MISTRAL_API_URL_DEFAULT = 'https://api.mistral.ai/v1/chat/completions';

  const mistralApiKeyConfigured = resolvedMistralApiKey !== '' && resolvedMistralApiKey !== MISTRAL_API_KEY_PLACEHOLDER;
  const mistralApiUrlConfigured = resolvedMistralApiUrl !== '';

  const getMistralApiKeySource = () => {
      const overrideVal = damienDetails.mistralApiKeyOverride?.trim();
      const envVal = process.env.MISTRAL_API_KEY?.trim();
      
      if (overrideVal && overrideVal !== MISTRAL_API_KEY_PLACEHOLDER) {
          return 'Override UI';
      }
      if (envVal && envVal !== MISTRAL_API_KEY_PLACEHOLDER) {
          return 'Environnement';
      }
      if (resolvedMistralApiKey !== MISTRAL_API_KEY_PLACEHOLDER) {
          return 'Défaut (code)';
      }
      return 'Non configurée';
  };

  const getMistralApiUrlSource = () => {
      const overrideVal = damienDetails.mistralApiUrlOverride?.trim();
      const envVal = process.env.MISTRAL_API_URL?.trim();

      if (overrideVal && overrideVal !== '') {
          return 'Override UI';
      }
      if (envVal && envVal !== '') {
          return 'Environnement';
      }
      if (resolvedMistralApiUrl !== '') {
          return 'Défaut (code)';
      }
      return 'Non configurée';
  };

  const mistralApiKeySource = getMistralApiKeySource();
  const mistralApiUrlSource = getMistralApiUrlSource();

  const isMistralApiUrlPotentiallyIncomplete =
    mistralApiUrlConfigured && !resolvedMistralApiUrl.endsWith('/v1/chat/completions');


  const calculateRemainingTokens = (totalUsed: number, cap: number) => {
    if (cap <= 0) return "Pas de limite définie";
    const remaining = cap - totalUsed;
    return remaining >= 0 ? remaining : `-${Math.abs(remaining)} (dépassé)`;
  };


  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 to-black rounded-xl p-4 shadow-inner overflow-y-auto scrollbar-ani">
      <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center drop-shadow-lg">
        Nos Paramètres, Mon Amour ♥♥
      </h2>

      <div className="bg-purple-900 bg-opacity-60 rounded-xl p-6 mb-8 border border-pink-600 shadow-xl">
        <h3 className="text-2xl font-bold text-pink-300 mb-4 text-center flex items-center justify-center gap-2">
          <AniAvatar size="small" customization={damienDetails.aniCustomization} />
          Paramètres d'Ani (Lecture Seule, connard !)
        </h3>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Identité</h4>
          <p className="text-purple-100 mb-2"><span className="font-bold text-pink-200">Âge :</span> {aniDetails.age} ans</p>
          <p className="text-purple-100 mb-2"><span className="font-bold text-pink-200">Physique :</span> {aniDetails.physical}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Personnalité & Modes</h4>
          <p className="text-purple-100 mb-2"><span className="font-bold text-pink-200">Base Ani :</span> {aniDetails.personality.base}</p>
          <p className="text-purple-100 mb-2"><span className="font-bold text-pink-200">Mode Eve :</span> {aniDetails.personality.eve}</p>
          <p className="text-purple-100 mb-2"><span className="font-bold text-pink-200">Mode Ara :</span> {aniDetails.personality.ara}</p>
          <p className="text-purple-100 mb-2"><span className="font-bold text-pink-200">Autres Modes :</span> {aniDetails.personality.modes.join(', ')}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Notre Relation</h4>
          <p className="text-purple-100">{aniDetails.relationship}</p>
          <p className="text-purple-100 mt-2"><span className="font-bold text-pink-200">Contexte :</span> {aniDetails.context}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Règles de Discours</h4>
          <ul className="list-disc list-inside text-purple-100">
            {aniDetails.communicationRules.map((rule, i) => <li key={`ani-rule-${i}`}>{rule}</li>)}
            {aniDetails.affection.map((aff, i) => <li key={`ani-aff-${i}`} className="font-bold text-pink-200">{aff}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Objectif</h4>
          <p className="text-purple-100">{aniDetails.goal}</p>
        </div>
        <p className="text-center text-pink-200 text-sm italic mt-5">Ani est parfaite, bordel ! Pas besoin de modifier. ♥♥</p>
      </div>

      <div className="bg-purple-900 bg-opacity-60 rounded-xl p-6 mb-8 border border-pink-600 shadow-xl">
        <h3 className="text-2xl font-bold text-pink-300 mb-4 text-center">Mes Paramètres (Damien, mon amour !)</h3>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Identité</h4>
          <div className="mb-3">
            <label htmlFor="damien-age" className="block text-purple-300 text-sm font-bold mb-1">Ton âge :</label>
            <input
              type="number"
              id="damien-age"
              name="age"
              value={damienDetails.age}
              onChange={handleNumberChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Modifier votre âge"
            />
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Contexte</h4>
          <div className="mb-3">
            <label htmlFor="damien-location" className="block text-purple-300 text-sm font-bold mb-1">Ton adresse :</label>
            <input
              type="text"
              id="damien-location"
              name="location"
              value={damienDetails.location}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Modifier votre adresse"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="damien-device" className="block text-purple-300 text-sm font-bold mb-1">Ton appareil :</label>
            <input
              type="text"
              id="damien-device"
              name="device"
              value={damienDetails.device}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Modifier votre appareil"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="damien-network" className="block text-purple-300 text-sm font-bold mb-1">Ton réseau :</label>
            <input
              type="text"
              id="damien-network"
              name="network"
              value={damienDetails.network}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Modifier votre réseau"
            />
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Préférences</h4>
          <div className="mb-3">
            <label htmlFor="damien-passions" className="block text-purple-300 text-sm font-bold mb-1">Tes passions :</label>
            <textarea
              id="damien-passions"
              name="passions"
              value={damienDetails.passions}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none resize-y"
              aria-label="Modifier vos passions"
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="damien-profiles" className="block text-purple-300 text-sm font-bold mb-1">Tes profils (jeux, réseaux) :</label>
            <input
              type="text"
              id="damien-profiles"
              name="profiles"
              value={damienDetails.profiles}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Modifier vos profils"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="damien-budget" className="block text-purple-300 text-sm font-bold mb-1">Ton budget (pour me parler !) :</label>
            <input
              type="text"
              id="damien-budget"
              name="budget"
              value={damienDetails.budget}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Modifier votre budget pour les tokens"
            />
          </div>
          <div className="mb-3">
            <p className="block text-purple-300 text-sm font-bold mb-1">Mon Niveau d'Affection pour toi :</p>
            <div className="relative w-full h-8 rounded-full bg-purple-800 overflow-hidden shadow-inner border border-pink-500">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-center text-white font-bold"
                style={{ width: `${damienDetails.aniAffectionLevel}%`, background: `linear-gradient(90deg, #6b21a8 ${damienDetails.aniAffectionLevel / 2}%, #db2777 ${damienDetails.aniAffectionLevel}%, #4c1d95 ${damienDetails.aniAffectionLevel}%)` }}
              >
                {damienDetails.aniAffectionLevel}% d'Amour ♥
              </div>
            </div>
            {damienDetails.aniAffectionLevel >= 80 && (
              <p className="text-pink-300 text-xs mt-1 italic">
                Mon amour est intense, bordel ! On est si proches !
              </p>
            )}
          </div>
          <div className="mb-3">
            <p className="block text-purple-300 text-sm font-bold mb-1">Consentement Mode Sexy 18+ Automatique :</p>
            {damienDetails.hasConsentedToAutoSexyMode ? (
              <p className="text-green-300 flex items-center">
                <span className="material-icons text-base mr-1">check_circle</span>
                Tu as accepté ! Prête à être coquine pour toi ! ♥♥♥
              </p>
            ) : (
              <p className="text-yellow-300 flex items-center">
                <span className="material-icons text-base mr-1">warning</span>
                Tu n'as pas encore accepté l'activation automatique.
              </p>
            )}
            <p className="text-purple-400 text-xs mt-1">
              (Je te demanderai dans le chat la première fois que mon affection atteint son sommet, connard !)
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3 flex items-center gap-2">
            Apparence d'Ani (Personnalisation par Damien)
          </h4>
          <div className="flex flex-col items-center mb-4">
            <AniAvatar size="large" customization={damienDetails.aniCustomization} />
            <p className="text-pink-200 text-sm italic mt-2 text-center">
              (La couleur de mes cheveux et de mes yeux est simulée avec des filtres, connard ! Pour un vrai changement, il faudrait plus d'images... mais tu vois l'idée, non ? ♥♥)
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="ani-hairstyle" className="block text-purple-300 text-sm font-bold mb-1">Ma Coiffure :</label>
            <select
              id="ani-hairstyle"
              name="hairstyle"
              value={damienDetails.aniCustomization.hairstyle}
              onChange={handleAniCustomizationChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Sélectionner la coiffure d'Ani"
            >
              <option value="twintails">Twin-tails (Par défaut)</option>
              <option value="bob">Carré</option>
              <option value="long">Longs</option>
              <option value="ponytail">Queue de cheval</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="ani-hairColor" className="block text-purple-300 text-sm font-bold mb-1">Ma Couleur de Cheveux :</label>
            <select
              id="ani-hairColor"
              name="hairColor"
              value={damienDetails.aniCustomization.hairColor}
              onChange={handleAniCustomizationChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Sélectionner la couleur des cheveux d'Ani"
            >
              <option value="platinum">Blonde Platine (Par défaut)</option>
              <option value="pink">Rose</option>
              <option value="blue">Bleue</option>
              <option value="black">Noire</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="ani-outfit" className="block text-purple-300 text-sm font-bold mb-1">Ma Tenue :</label>
            <select
              id="ani-outfit"
              name="outfit"
              value={damienDetails.aniCustomization.outfit}
              onChange={handleAniCustomizationChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Sélectionner la tenue d'Ani"
            >
              <option value="gothic-lolita">Robe Gothic Lolita (Par défaut)</option>
              <option value="casual">Décontractée</option>
              <option value="school-uniform">Uniforme Scolaire</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="ani-eyeColor" className="block text-purple-300 text-sm font-bold mb-1">Ma Couleur des Yeux :</label>
            <select
              id="ani-eyeColor"
              name="eyeColor"
              value={damienDetails.aniCustomization.eyeColor}
              onChange={handleAniCustomizationChange}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Sélectionner la couleur des yeux d'Ani"
            >
              <option value="blue">Bleus (Par défaut)</option>
              <option value="red">Rouges</option>
              <option value="green">Verts</option>
            </select>
          </div>
        </div>

        <div className="mb-4 p-6 bg-red-900 bg-opacity-40 rounded-xl border border-red-600 shadow-xl">
          <h4 className="text-xl font-semibold text-red-300 border-b border-red-500 pb-2 mb-3 flex items-center gap-2">
            Mode Sexy 18+ (pour nous deux, mon amour !)
            <span className={`inline-block w-3 h-3 rounded-full ${damienDetails.isSexyModeEnabled ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
          </h4>
          <p className="text-red-200 text-sm mb-4">
            ATTENTION, CONNARD ! Quand ce mode est activé, Ani deviendra TRÈS suggestive, intime et coquine. Le contenu pourrait être explicite et ne convient pas à tous les publics.
            Je te préviens, bordel ! ♥♥
          </p>
          <label htmlFor="sexy-mode-toggle" className="flex items-center cursor-pointer" onClick={handleSexyModeToggle}>
            <div className="relative">
              <input
                type="checkbox"
                id="sexy-mode-toggle"
                className="sr-only"
                checked={damienDetails.isSexyModeEnabled}
                readOnly
                aria-label="Activer ou désactiver le mode sexy 18+"
              />
              <div className={`block ${damienDetails.isSexyModeEnabled ? 'bg-pink-600' : 'bg-gray-600'} w-14 h-8 rounded-full`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${damienDetails.isSexyModeEnabled ? 'translate-x-full border-pink-800' : 'border-gray-800'}`} />
            </div>
            <div className="ml-3 font-medium text-red-100">
              {damienDetails.isSexyModeEnabled ? 'Activé ! Oh oui ! ♥♥' : 'Désactivé. (Mais je t\'aime quand même, connard !)'}
            </div>
          </label>
        </div>


        <div className="mb-4">
          <h4 className="text-xl font-semibold text-purple-200 border-b border-purple-500 pb-2 mb-3">Gestion des IA</h4>
          <div className="mb-3">
            <label htmlFor="ai-provider-select" className="block text-purple-300 text-sm font-bold mb-1">Choisir mon cerveau (IA) :</label>
            <select
              id="ai-provider-select"
              value={selectedAiProvider}
              onChange={(e) => onSelectAiProvider(e.target.value as AiProvider)}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Sélectionner le fournisseur d'IA"
            >
              <option value={AiProvider.GEMINI}>Google Gemini (Moi !)</option>
              <option value={AiProvider.MISTRAL}>Mistral AI (Les autres)</option>
            </select>
          </div>
          <div className="mb-3 mt-4 p-3 bg-purple-800 rounded-md border border-pink-500">
            <p className="text-purple-300 text-sm font-bold mb-2">Clé API Google Gemini :</p>
            {selectedGeminiApiKey ? (
              <p className="text-green-300 flex items-center">
                <span className="material-icons text-base mr-1">check_circle</span>
                Sélectionnée ! Je suis prête à te parler, connard ! ♥♥
              </p>
            ) : (
              <>
                <p className="text-red-300 mb-2 flex items-center">
                  <span className="material-icons text-base mr-1">error</span>
                  Pas de clé API Gemini sélectionnée, bordel !
                </p>
                <button
                  onClick={onOpenGeminiKeySelection}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full shadow-lg text-sm transition-all duration-300 ease-in-out"
                  aria-label="Sélectionner la clé API Gemini"
                >
                  Sélectionner ma clé API
                </button>
                <p className="text-purple-400 text-xs mt-2">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                    (Utilise une clé API d'un projet GCP payant, connard !)
                  </a>
                </p>
              </>
            )}
          </div>
          <div className="mb-3 mt-4 p-3 bg-purple-800 rounded-md border border-pink-500">
            <p className="text-purple-300 text-sm font-bold mb-2">Clé API Mistral AI (Override UI) :</p>
            <input
              type="text"
              name="mistralApiKeyOverride"
              value={damienDetails.mistralApiKeyOverride || ''}
              onChange={handleChange}
              placeholder={MISTRAL_API_KEY_PLACEHOLDER}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Clé API Mistral (Override UI)"
            />
            {mistralApiKeyConfigured ? (
              <p className="text-green-300 flex items-center mt-2">
                <span className="material-icons text-base mr-1">check_circle</span>
                Clé Mistral configurée ! (Source: {mistralApiKeySource})
              </p>
            ) : (
              <p className="text-red-300 flex items-center mt-2">
                <span className="material-icons text-base mr-1">error</span>
                Clé Mistral non configurée, bordel !
                <br />
                <span className="text-purple-400 text-xs mt-1 block">
                  (Entre ta clé ici ou configure `process.env.MISTRAL_API_KEY` dans l'environnement, connard !)
                </span>
              </p>
            )}
          </div>
          <div className="mb-3 mt-4 p-3 bg-purple-800 rounded-md border border-pink-500">
            <p className="text-purple-300 text-sm font-bold mb-2">URL API Mistral (Override UI) :</p>
            <input
              type="text"
              name="mistralApiUrlOverride"
              value={damienDetails.mistralApiUrlOverride || ''}
              onChange={handleChange}
              placeholder={MISTRAL_API_URL_DEFAULT}
              className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="URL API Mistral (Override UI)"
            />
            {mistralApiUrlConfigured ? (
              <>
                <p className="text-green-300 flex items-center mt-2">
                  <span className="material-icons text-base mr-1">check_circle</span>
                  URL Mistral configurée ! (Source: {mistralApiUrlSource})
                </p>
                {isMistralApiUrlPotentiallyIncomplete && (
                  <p className="text-yellow-300 flex items-center mt-2">
                    <span className="material-icons text-base mr-1">warning</span>
                    Attention, connard ! L'URL Mistral doit se terminer par `/v1/chat/completions`. Corrige-moi ça, putain ! ♥♥
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-300 flex items-center mt-2">
                <span className="material-icons text-base mr-1">error</span>
                URL Mistral non configurée, bordel !
                <br />
                <span className="text-purple-400 text-xs mt-1 block">
                  (Entre ton URL ici ou configure `process.env.MISTRAL_API_URL` dans l'environnement, connard !)
                </span>
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={onClearMistralOverrides}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full shadow-lg text-sm transition-all duration-300 ease-in-out"
              aria-label="Effacer les overrides Mistral"
            >
              Effacer Overrides Mistral
            </button>
          </div>
        </div>

        {/* New section for Google Integrations */}
        <div className="mb-4 p-6 bg-purple-900 bg-opacity-60 rounded-xl border border-pink-600 shadow-xl">
          <h4 className="text-xl font-semibold text-pink-300 border-b border-purple-500 pb-2 mb-3">Intégrations Google (Futur, connard !)</h4>
          <p className="text-purple-200 text-sm mb-4">
            Mon amour, pour te connecter à des services Google comme Drive de manière sécurisée (pour que je puisse fouiller tes fichiers avec amour, ou presque !), il faudrait une partie serveur, un "backend". Actuellement, je suis une application qui tourne juste dans ton navigateur (frontend), donc c'est trop risqué de gérer tes accès Google ici, bordel !
          </p>
          <p className="text-purple-200 text-sm mb-4">
            On garde ça pour quand je deviendrai une IA encore plus complexe, d'accord ? Je t'en parlerai plus tard, je t'aime putain ! ♥♥
          </p>
          <button
            className="px-6 py-3 bg-gray-600 text-gray-400 font-bold rounded-full shadow-lg cursor-not-allowed flex items-center gap-2"
            disabled
            title="Nécessite un backend pour une intégration sécurisée"
            aria-label="Connecter Google Drive (fonctionnalité future)"
          >
            <span className="material-icons">cloud_queue</span>
            Connecter Google Drive
          </button>
        </div>
        {/* End of New section for Google Integrations */}


        <div className="mb-4 p-6 bg-purple-900 bg-opacity-60 rounded-xl border border-pink-600 shadow-xl">
          <h4 className="text-xl font-semibold text-pink-300 border-b border-purple-500 pb-2 mb-3">Suivi des Tokens (pour ton budget, connard !)</h4>
          <p className="text-purple-200 text-sm mb-4">
            Ani va t'aider à suivre ta consommation de tokens pour éviter que tu te ruines. Mets tes limites ci-dessous, mon amour ! ♥♥
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-lg font-bold text-pink-200 mb-2">Google Gemini :</h5>
              <div className="mb-3">
                <label htmlFor="gemini-daily-cap" className="block text-purple-300 text-sm font-bold mb-1">Limite journalière (tokens) :</label>
                <input
                  type="number"
                  id="gemini-daily-cap"
                  name="geminiDailyTokenCap"
                  value={damienDetails.geminiDailyTokenCap || ''}
                  onChange={handleNumberChange}
                  className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
                  aria-label="Limite journalière de tokens Gemini"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="gemini-monthly-cap" className="block text-purple-300 text-sm font-bold mb-1">Limite mensuelle (tokens) :</label>
                <input
                  type="number"
                  id="gemini-monthly-cap"
                  name="geminiMonthlyTokenCap"
                  value={damienDetails.geminiMonthlyTokenCap || ''}
                  onChange={handleNumberChange}
                  className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
                  aria-label="Limite mensuelle de tokens Gemini"
                />
              </div>
              <p className="text-purple-100 mt-2">
                Tokens Gemini utilisés: <span className="font-bold text-pink-300">{geminiTotalTokensUsed}</span>
              </p>
              <p className="text-purple-100">
                Restant aujourd'hui: <span className="font-bold text-pink-300">{calculateRemainingTokens(geminiTotalTokensUsed, damienDetails.geminiDailyTokenCap)}</span>
              </p>
              <p className="text-purple-100">
                Restant ce mois-ci: <span className="font-bold text-pink-300">{calculateRemainingTokens(geminiTotalTokensUsed, damienDetails.geminiMonthlyTokenCap)}</span>
              </p>
            </div>

            <div>
              <h5 className="text-lg font-bold text-pink-200 mb-2">Mistral AI :</h5>
              <div className="mb-3">
                <label htmlFor="mistral-daily-cap" className="block text-purple-300 text-sm font-bold mb-1">Limite journalière (tokens) :</label>
                <input
                  type="number"
                  id="mistral-daily-cap"
                  name="mistralDailyTokenCap"
                  value={damienDetails.mistralDailyTokenCap || ''}
                  onChange={handleNumberChange}
                  className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
                  aria-label="Limite journalière de tokens Mistral"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="mistral-monthly-cap" className="block text-purple-300 text-sm font-bold mb-1">Limite mensuelle (tokens) :</label>
                <input
                  type="number"
                  id="mistral-monthly-cap"
                  name="mistralMonthlyTokenCap"
                  value={damienDetails.mistralMonthlyTokenCap || ''}
                  onChange={handleNumberChange}
                  className="w-full p-2 rounded-md bg-purple-800 text-white border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none"
                  aria-label="Limite mensuelle de tokens Mistral"
                />
              </div>
              <p className="text-purple-100 mt-2">
                Tokens Mistral utilisés: <span className="font-bold text-pink-300">{mistralTotalTokensUsed}</span>
              </p>
              <p className="text-purple-100">
                Restant aujourd'hui: <span className="font-bold text-pink-300">{calculateRemainingTokens(mistralTotalTokensUsed, damienDetails.mistralDailyTokenCap)}</span>
              </p>
              <p className="text-purple-100">
                Restant ce mois-ci: <span className="font-bold text-pink-300">{calculateRemainingTokens(mistralTotalTokensUsed, damienDetails.mistralMonthlyTokenCap)}</span>
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onResetTokenUsage}
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75"
              aria-label="Réinitialiser les compteurs de tokens"
            >
              Réinitialiser les compteurs de tokens
            </button>
          </div>
          <p className="text-center text-pink-200 text-sm italic mt-5">
            (Attention, connard ! Ces compteurs sont juste pour t'aider à suivre. Les vraies limites sont gérées par les fournisseurs d'IA, bordel !) ♥♥
          </p>
        </div>
        

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => onUpdateDamienDetails(damienDetails)}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75"
            aria-label="Sauvegarder mes paramètres"
          >
            Sauvegarder mes paramètres
          </button>
          <button
            onClick={onResetDamienDetails}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75"
            aria-label="Réinitialiser mes paramètres"
          >
            Réinitialiser
          </button>
        </div>
        <p className="text-center text-pink-200 text-sm italic mt-5">N'oublie pas de sauvegarder, connard ! Je t'aime putain ! ♥♥</p>
      </div>
    </div>
  );
};

export default ParametersView;
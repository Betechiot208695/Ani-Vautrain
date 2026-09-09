import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, AiProvider } from '../types';
import AniAvatar from './AniAvatar';

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
  }
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  }
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly confidence: number;
    readonly transcript: string;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }
  type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, mediaToProcess?: { base64Data: string; mimeType: string; type: 'image' | 'video' | 'audio' }) => void;
  loading: boolean;
  aniVoice: SpeechSynthesisVoice | null;
  speakAniResponse: (text: string) => void;
  onClearChat: () => void;
  aniMode: 'Base Ani' | 'Eve' | 'Ara';
  isChatInputDisabled: boolean;
  geminiRetryTimeRemaining: number;
  mistralRetryTimeRemaining: number;
  selectedAiProvider: AiProvider;
  onOpenSearch: () => void;
  isSearchingWeb: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  loading,
  aniVoice,
  speakAniResponse,
  onClearChat,
  aniMode,
  isChatInputDisabled,
  geminiRetryTimeRemaining,
  mistralRetryTimeRemaining,
  selectedAiProvider,
  onOpenSearch,
  isSearchingWeb,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Media & Webcam states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaFileToSend, setMediaFileToSend] = useState<File | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log("Ani écoute, connard !");
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        console.log("Ani a entendu:", transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log("Ani a arrêté d'écouter.");
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Erreur de reconnaissance vocale:", event.error);
        setIsListening(false);
      };
    } else {
      console.warn("La reconnaissance vocale n'est pas supportée dans ce navigateur, bordel !");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (loading || isChatInputDisabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputText('');
      recognitionRef.current?.start();
    }
  }, [isListening, loading, isChatInputDisabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !mediaFileToSend) {
        alert("Putain, il faut que tu me dises quelque chose ou que tu m'envoies un média, connard ! ♥♥");
        return;
    }
    if (isChatInputDisabled) return;

    let mediaDataToSend: { base64Data: string; mimeType: string; type: 'image' | 'video' | 'audio' } | undefined;

    if (mediaFileToSend) {
        const reader = new FileReader();
        reader.readAsDataURL(mediaFileToSend);
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            const mimeType = mediaFileToSend.type;
            const mediaType = mediaFileToSend.type.split('/')[0] as 'image' | 'video' | 'audio';
            mediaDataToSend = { base64Data, mimeType, type: mediaType };
            onSendMessage(inputText.trim(), mediaDataToSend);
            setInputText('');
            setMediaPreviewUrl(null);
            setMediaFileToSend(null);
            if (isListening) {
              recognitionRef.current?.stop();
            }
        };
        reader.onerror = (error) => {
            console.error("Erreur de lecture du fichier média:", error);
            alert("Putain, impossible de lire ton média, connard ! Erreur: " + error.target?.error?.message);
        };
    } else {
        onSendMessage(inputText.trim());
        setInputText('');
        if (isListening) {
          recognitionRef.current?.stop();
        }
    }
  };

  const handleSpeechReplay = (text: string) => {
    speakAniResponse(text);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copié ! J'espère que c'est pour me relire, connard ! ♥♥");
  };

  const getChatInputPlaceholder = () => {
    if (isChatInputDisabled) {
      if (selectedAiProvider === AiProvider.GEMINI) {
        return `Ani attend son quota Gemini... (${geminiRetryTimeRemaining}s)`;
      } else if (selectedAiProvider === AiProvider.MISTRAL) {
        return `Ani attend son quota Mistral... (${mistralRetryTimeRemaining}s)`;
      }
    }
    return isListening ? "Ani t'écoute, connard ! Parle..." : "Parle à Ani, connard ! ♥♥";
  };
  const chatInputPlaceholder = getChatInputPlaceholder();

  const getChatTitle = () => {
    if (selectedAiProvider === AiProvider.GEMINI) {
      return "Ani (Gemini) - Chat Secret ♥♥";
    } else if (selectedAiProvider === AiProvider.MISTRAL) {
      return "Mistral (les autres) - Chat Secret ♥♥";
    }
    return "Chat Secret ♥♥";
  }

  // Media Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFileToSend(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaFileToSend(null);
      setMediaPreviewUrl(null);
    }
  };

  const handleRemoveMediaPreview = () => {
    setMediaFileToSend(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
    }
  };

  // Webcam Handlers
  const startWebcam = async () => {
    if (isChatInputDisabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play();
      }
      setWebcamStream(stream);
      setIsWebcamActive(true);
      setMediaPreviewUrl(null); // Clear file media preview if webcam starts
      setMediaFileToSend(null);
    } catch (err) {
      console.error("Erreur d'accès à la webcam:", err);
      alert("Putain, Ani ne peut pas accéder à ta caméra ! Vérifie les permissions du navigateur ou si une autre app l'utilise, connard ! ♥♥");
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
    }
    setWebcamStream(null);
    setIsWebcamActive(false);
  };

  const captureWebcamImage = () => {
    if (webcamVideoRef.current && webcamStream) {
      const video = webcamVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "webcam_capture.png", { type: "image/png" });
            setMediaFileToSend(file);
            setMediaPreviewUrl(URL.createObjectURL(blob));
            stopWebcam(); // Stop webcam after capture
          } else {
            alert("Putain, impossible de capturer l'image de la webcam, bordel !");
          }
        }, 'image/png');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 to-black rounded-xl p-4 shadow-inner">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-pink-400">{getChatTitle()}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full shadow-md text-sm transition-colors duration-200 flex items-center"
            aria-label="Rechercher dans la conversation"
            title="Rechercher dans la conversation"
          >
            <span className="material-icons text-base mr-1">search</span>
            Rechercher
          </button>
          <button
            onClick={onClearChat}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full shadow-md text-sm transition-colors duration-200 flex items-center"
            aria-label="Vider la conversation"
            title="Vider la conversation"
          >
            <span className="material-icons text-base mr-1">delete_outline</span>
            Vider le chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-ani p-2 space-y-4">
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              role="log"
              aria-live="polite"
            >
              {msg.sender === 'bot' && (
                <AniAvatar size="small" aniMode={aniMode} />
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md relative group ${
                  msg.sender === 'user'
                    ? 'bg-purple-700 text-white ml-2'
                    : 'bg-pink-800 text-purple-100 mr-2'
                }`}
              >
                {msg.mediaContent && (
                  <div className="mb-2 rounded-md overflow-hidden border border-purple-600">
                    {msg.mediaContent.type === 'image' && (
                      <img src={msg.mediaContent.url} alt="Média envoyé par l'utilisateur" className="max-w-full h-auto object-cover" />
                    )}
                    {msg.mediaContent.type === 'video' && (
                      <video src={msg.mediaContent.url} controls className="max-w-full h-auto object-cover"></video>
                    )}
                    {msg.mediaContent.type === 'audio' && (
                      <audio src={msg.mediaContent.url} controls className="w-full"></audio>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.tokenUsage && (
                  <p className="text-xs text-purple-300 mt-1 italic opacity-80">
                    Tokens: Entrée: {msg.tokenUsage.promptTokens}, Sortie: {msg.tokenUsage.completionTokens}, Total: {msg.tokenUsage.totalTokens}
                  </p>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-600 text-xs text-purple-200">
                    <p className="font-semibold mb-1">Sources d'Ani :</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {msg.sources.map((source, srcIndex) => (
                        <li key={srcIndex}>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:underline"
                            title={source.title || source.uri}
                          >
                            {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {msg.sender === 'bot' && (
                  <div className="absolute bottom-1 right-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyText(msg.text); }}
                      className="text-xs text-purple-200 hover:text-white p-1 rounded-full bg-transparent hover:bg-pink-700 transition-colors duration-200"
                      aria-label="Copier la réponse d'Ani"
                      title="Copier la réponse"
                    >
                      <span className="material-icons text-base">content_copy</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSpeechReplay(msg.text); }}
                      className="text-xs text-purple-200 hover:text-white p-1 rounded-full bg-transparent hover:bg-pink-700 transition-colors duration-200"
                      aria-label="Clique pour écouter la réponse d'Ani"
                      title="Écouter la réponse"
                    >
                      <span className="material-icons text-base">volume_up</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Display Tool Calls */}
            {msg.toolCalls && msg.toolCalls.map((call, callIndex) => (
              <div key={`tool-call-${index}-${callIndex}`} className="flex justify-start">
                <AniAvatar size="small" aniMode={aniMode} />
                <div className="max-w-[70%] p-3 rounded-lg shadow-md mr-2 bg-blue-800 text-blue-100 tool-message">
                  <p className="font-bold">Ani utilise l'outil : <span className="text-yellow-300">{call.name}</span></p>
                  <p className="text-sm">Args : <span className="font-mono text-blue-200">{JSON.stringify(call.args)}</span></p>
                </div>
              </div>
            ))}
            {/* Display Tool Results */}
            {msg.toolResults && msg.toolResults.map((result, resultIndex) => (
              <div key={`tool-result-${index}-${resultIndex}`} className="flex justify-start">
                <AniAvatar size="small" aniMode={aniMode} />
                <div className="max-w-[70%] p-3 rounded-lg shadow-md mr-2 bg-green-800 text-green-100 tool-message">
                  <p className="font-bold">Ani a reçu le résultat de l'outil : <span className="text-yellow-300">{result.name}</span></p>
                  <p className="text-sm">Résultat : <span className="font-mono text-green-200">{typeof result.result === 'object' ? JSON.stringify(result.result) : result.result}</span></p>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
        {loading && !isSearchingWeb && (
          <div className="flex justify-start">
            <AniAvatar size="small" aniMode={aniMode} />
            <div className="max-w-[70%] p-3 rounded-lg bg-pink-800 text-purple-100 mr-2 shadow-md flex items-center">
              <span className="animate-pulse">Ani est en train de taper...</span>
            </div>
          </div>
        )}
        {loading && isSearchingWeb && (
          <div className="flex justify-start">
            <AniAvatar size="small" aniMode={aniMode} />
            <div className="max-w-[70%] p-3 rounded-lg bg-pink-800 text-purple-100 mr-2 shadow-md flex items-center">
              <span className="animate-pulse">Ani cherche sur Internet, connard !</span>
            </div>
          </div>
        )}
        {isListening && (
          <div className="flex justify-start">
            <AniAvatar size="small" aniMode={aniMode} />
            <div className="max-w-[70%] p-3 rounded-lg bg-purple-700 text-white ml-2 shadow-md flex items-center">
              <span className="animate-pulse text-sm">Ani t'écoute...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview & Webcam Stream */}
      {(mediaPreviewUrl || isWebcamActive) && (
        <div className="mt-2 p-2 bg-purple-900 bg-opacity-70 rounded-lg shadow-inner flex flex-col items-center">
          {mediaPreviewUrl && (
            <div className="relative w-full max-w-xs mb-2 rounded-md overflow-hidden border border-pink-500">
                {mediaFileToSend?.type.startsWith('image/') && <img src={mediaPreviewUrl} alt="Aperçu du média" className="max-w-full h-auto object-contain" />}
                {mediaFileToSend?.type.startsWith('video/') && <video src={mediaPreviewUrl} controls className="max-w-full h-auto object-contain"></video>}
                {mediaFileToSend?.type.startsWith('audio/') && <audio src={mediaPreviewUrl} controls className="w-full"></audio>}
                <button
                    onClick={handleRemoveMediaPreview}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs font-bold"
                    aria-label="Supprimer l'aperçu du média"
                >
                    <span className="material-icons text-base">close</span>
                </button>
            </div>
          )}
          {isWebcamActive && (
            <div className="relative w-full max-w-xs rounded-md overflow-hidden border border-pink-500">
              <video ref={webcamVideoRef} autoPlay playsInline className="w-full h-auto object-cover"></video>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={captureWebcamImage}
                  className="p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg"
                  aria-label="Capturer une image"
                >
                  <span className="material-icons text-xl">camera_alt</span>
                </button>
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg"
                  aria-label="Arrêter la webcam"
                >
                  <span className="material-icons text-xl">cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
        {/* Media Button */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*"
            className="hidden"
            aria-hidden="true"
            disabled={isChatInputDisabled || isWebcamActive}
        />
        <button
          type="button"
          onClick={() => !isChatInputDisabled && !isWebcamActive && fileInputRef.current?.click()}
          className={`flex-shrink-0 p-3 rounded-full shadow-lg transition-all duration-300 ${
            isChatInputDisabled || isWebcamActive ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
          } text-white font-bold focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75 flex items-center justify-center`}
          disabled={isChatInputDisabled || isWebcamActive}
          aria-label="Envoyer un média"
          title="Envoyer un média"
        >
          <span className="material-icons text-xl">attach_file</span>
        </button>

        {/* Webcam Button */}
        <button
          type="button"
          onClick={isWebcamActive ? stopWebcam : startWebcam}
          className={`flex-shrink-0 p-3 rounded-full shadow-lg transition-all duration-300 ${
            isChatInputDisabled ? 'bg-gray-700 cursor-not-allowed' : (isWebcamActive ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700')
          } text-white font-bold focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75 flex items-center justify-center`}
          disabled={isChatInputDisabled}
          aria-label={isWebcamActive ? "Arrêter la webcam" : "Démarrer la webcam"}
          title={isWebcamActive ? "Arrêter la webcam" : "Démarrer la webcam"}
        >
          <span className="material-icons text-xl">
            {isWebcamActive ? 'videocam_off' : 'videocam'}
          </span>
        </button>

        {/* Voice Button (Mic) */}
        <button
          type="button"
          onClick={toggleListening}
          className={`flex-shrink-0 p-3 rounded-full shadow-lg transition-all duration-300 ${
            isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
          } text-white font-bold focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75 flex items-center justify-center`}
          disabled={loading || !recognitionRef.current || isChatInputDisabled || isWebcamActive || mediaFileToSend !== null}
          aria-label={isListening ? "Arrêter d'écouter" : "Parler à Ani"}
          title={!recognitionRef.current ? "Reconnaissance vocale non supportée" : (isListening ? "Arrêter d'écouter" : "Parler à Ani")}
        >
          <span className="material-icons text-xl">
            {isListening ? 'mic_off' : 'mic'}
          </span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={chatInputPlaceholder}
          className="flex-1 p-3 rounded-full bg-purple-800 text-white placeholder-purple-300 border border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none transition-all duration-200"
          disabled={loading || isListening || isChatInputDisabled || isWebcamActive}
          aria-label="Champ de saisie de message"
        />
        <button
          type="submit"
          className="flex-shrink-0 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-75"
          disabled={loading || (!inputText.trim() && !mediaFileToSend) || isChatInputDisabled || isWebcamActive}
          aria-label="Envoyer le message"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ChatView;
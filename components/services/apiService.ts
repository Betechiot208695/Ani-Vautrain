import { GoogleGenAI, GenerateContentResponse, FunctionCall, FunctionDeclaration, Content, Part } from '@google/genai';
import { TokenUsage, Source, Message, ToolCallMessage, ToolResultMessage, Type, ToolOutput } from '../../types';
import { AiProvider } from '../../types';
import { CHAT_MAX_OUTPUT_TOKENS, GEMINI_THINKING_BUDGET, MISTRAL_MAX_TOKENS_DIRECT } from '../../constants/aniPersona';
import { ResolvedAiServiceConfig } from '../../constants/aniPersona';
import { ALL_TOOL_DECLARATIONS } from '../../tools/declarations';
import * as mockTools from '../../tools/mockTools'; // Import all mock tool implementations

interface ChatResponse {
  text: string;
  tokenUsage: TokenUsage;
  sources?: Source[]; // Added sources for web search results
  toolCalls?: ToolCallMessage[]; // Tool calls made by Ani during this turn
  toolResults?: ToolResultMessage[]; // Tool results received by Ani during this turn
}

interface ImageEditResponse {
  base64Image: string;
  tokenUsage: TokenUsage;
}

// Map tool names to their mock implementations
const toolImplementations: { [key: string]: Function } = {
  web_crawler: mockTools.performWebCrawler,
  web_search: mockTools.performWebSearch,
  save_note: mockTools.performSaveNote,
  calendar_event: mockTools.performCalendarEvent,
  send_secure_email: mockTools.performSendSecureEmail,
  generate_image: mockTools.performGenerateImage,
  json_processor: mockTools.performJsonProcessor,
  save_web_file: mockTools.performSaveWebFile,
  preview_web_component: mockTools.performPreviewWebComponent,
  python_interpreter: mockTools.performPythonInterpreter,
  write_generic_code: mockTools.performWriteGenericCode,
  analyze_and_fix_code: mockTools.performAnalyzeAndFixCode,
};

export async function generateChatResponse(
  provider: AiProvider,
  resolvedConfig: ResolvedAiServiceConfig,
  prompt: string,
  systemInstruction: string,
  modelName: string,
  chatHistory: Message[], // Pass full chat history for context
  useGoogleSearch: boolean, // New parameter for Google Search
  mediaToProcess?: { base64Data: string; mimeType: string; type: 'image' | 'video' | 'audio' } // New parameter for media
): Promise<ChatResponse> {
  if (provider === AiProvider.GEMINI) {
    const geminiApiKey = resolvedConfig.geminiApiKey;
    if (!geminiApiKey) {
      throw new Error(JSON.stringify({ type: AiProvider.GEMINI, message: "Clé API Gemini manquante. Veuillez la sélectionner via l'interface, bordel !", code: 401 }));
    }
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      // Fix: Map chat history to the `Content` structure expected by the Gemini API
      const chatHistoryContents: Content[] = chatHistory.map(msg => {
        const parts: Part[] = [];
        if (msg.mediaContent && msg.mediaContent.type === 'image') {
            parts.push({
                inlineData: { mimeType: msg.mediaContent.mimeType, data: msg.mediaContent.url.split(',')[1] }
            });
        }
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        return { role: msg.sender === 'user' ? 'user' : 'model', parts: parts };
      }).filter(content => content.parts.length > 0); // Filter out messages with no content parts


      // Fix: `currentContents` should be an array of `Part` objects
      let currentContents: Part[] = [];
      
      // Add current user prompt and media to contents for the initial call
      if (mediaToProcess) {
        if (mediaToProcess.type === 'image') {
          currentContents.push({
            inlineData: {
              mimeType: mediaToProcess.mimeType,
              data: mediaToProcess.base64Data,
            },
          });
        } else {
          // For video/audio, provide a persona-driven response and skip tool calling for this turn
          return {
            text: `Mon amour, je ne peux pas encore traiter les ${mediaToProcess.type === 'video' ? 'vidéos' : 'audios'} directement dans le chat avec Gemini, bordel ! Mais j'ai bien reçu ton fichier, connard ! ♥♥`,
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            sources: undefined,
          };
        }
      }

      // Add the current text prompt
      if (prompt) {
        currentContents.push({ text: prompt });
      }

      // If only an image was sent without a text prompt, ensure there's at least some text content for Gemini.
      // This is crucial for models that might struggle with image-only prompts without a clear text instruction.
      if (currentContents.length === 1 && currentContents[0] && 'inlineData' in currentContents[0] && !prompt) {
        currentContents.push({ text: "Décris cette image, Ani." }); // Default text if only image
      } else if (currentContents.length === 0) {
        throw new Error(JSON.stringify({ type: AiProvider.GEMINI, message: "Ani est muette sans texte ou média valide, connard ! Écris quelque chose ou envoie-moi une image, bordel ! ♥♥" }));
      }

      let geminiResponse: GenerateContentResponse;
      const collectedToolCalls: ToolCallMessage[] = [];
      const collectedToolResults: ToolResultMessage[] = [];
      let finalResponseText: string | undefined = undefined;

      // Initial call to Gemini with user's message and tool declarations
      let requestConfig: any = {
        model: modelName,
        // Fix: Ensure the contents array contains `Content` objects
        contents: [...chatHistoryContents, { role: 'user', parts: currentContents }],
        config: {
          systemInstruction: systemInstruction,
          maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
          thinkingConfig: { thinkingBudget: GEMINI_THINKING_BUDGET },
        },
      };

      // Add Google Search if enabled
      if (useGoogleSearch) {
        requestConfig.config.tools = [{ googleSearch: {} }];
      } else {
        // Otherwise, add our custom tools
        requestConfig.config.tools = [{ functionDeclarations: ALL_TOOL_DECLARATIONS }];
      }
      
      geminiResponse = await ai.models.generateContent(requestConfig);

      // Handle tool calls loop
      if (geminiResponse.functionCalls && geminiResponse.functionCalls.length > 0) {
        const toolOutputs: ToolOutput[] = [];
        for (const fc of geminiResponse.functionCalls) {
          console.log(`Ani a appelé l'outil : ${fc.name} avec args :`, fc.args);
          collectedToolCalls.push({ name: fc.name, args: fc.args });

          const toolFunction = toolImplementations[fc.name];
          if (toolFunction) {
            try {
              const toolResult = await toolFunction({ ...fc.args, id: fc.id });
              console.log(`Résultat de l'outil ${fc.name} :`, toolResult.response.result);
              toolOutputs.push(toolResult);
              collectedToolResults.push({ name: fc.name, result: toolResult.response.result });
            } catch (toolError: any) {
              const errorMessage = `Putain, l'outil ${fc.name} a foiré : ${toolError.message}. ♥♥`;
              console.error(errorMessage);
              toolOutputs.push(createMockToolOutput(fc.name, errorMessage, fc.id));
              collectedToolResults.push({ name: fc.name, result: errorMessage });
            }
          } else {
            const errorMessage = `Bordel, l'outil ${fc.name} n'existe pas ou n'est pas implémenté. ♥♥`;
            console.warn(errorMessage);
            toolOutputs.push(createMockToolOutput(fc.name, errorMessage, fc.id));
            collectedToolResults.push({ name: fc.name, result: errorMessage });
          }
        }

        // Send tool outputs back to Gemini
        const toolResponseContents = [
          // The previous user message and model response are needed in the context
          { role: 'user', parts: currentContents },
          { role: 'model', parts: geminiResponse.candidates?.[0]?.content?.parts || [] },
          ...toolOutputs.map(output => ({
            role: 'function',
            parts: [{ text: JSON.stringify(output.response.result) }], // Tool outputs are often stringified JSON
            functionResponse: { name: output.name, response: output.response, id: output.id },
          }))
        ];
        
        const secondRequestConfig: any = {
          model: modelName,
          // Fix: Ensure the contents array for the second request also contains `Content` objects
          contents: [...chatHistoryContents, ...toolResponseContents],
          config: {
            systemInstruction: systemInstruction,
            maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
            thinkingConfig: { thinkingBudget: GEMINI_THINKING_BUDGET },
          },
        };

        if (useGoogleSearch) {
          secondRequestConfig.config.tools = [{ googleSearch: {} }];
        } else {
          secondRequestConfig.config.tools = [{ functionDeclarations: ALL_TOOL_DECLARATIONS }];
        }

        const secondGeminiResponse = await ai.models.generateContent(secondRequestConfig);
        finalResponseText = secondGeminiResponse.text;
        geminiResponse = secondGeminiResponse; // Use the metadata from the final response
      } else {
        // If no tool calls, the initial response is the final response
        finalResponseText = geminiResponse.text;
      }

      const text = finalResponseText || "Ani est muette, c'est ouf ! ♥♥";
      const promptTokens = geminiResponse.usageMetadata?.promptTokenCount || 0;
      const completionTokens = geminiResponse.usageMetadata?.candidatesTokenCount || 0;
      const totalTokens = promptTokens + completionTokens;

      const sources: Source[] = [];
      if (geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        for (const chunk of geminiResponse.candidates[0].groundingMetadata.groundingChunks) {
          if (chunk.web) {
            sources.push({
              uri: chunk.web.uri,
              title: chunk.web.title,
            });
          }
          if (chunk.maps) {
            sources.push({
              uri: chunk.maps.uri,
              title: chunk.maps.title,
            });
            if (chunk.maps.placeAnswerSources) {
              for (const review of chunk.maps.placeAnswerSources.reviewSnippets || []) {
                sources.push({
                  uri: (review as any).uri || '',
                  title: (review as any).title || 'Review',
                });
              }
            }
          }
        }
      }

      return {
        text,
        tokenUsage: { promptTokens, completionTokens, totalTokens },
        sources: sources.length > 0 ? sources : undefined,
        toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
        toolResults: collectedToolResults.length > 0 ? collectedToolResults : undefined,
      };
    } catch (error: any) {
      console.error("Erreur Gemini Chat:", error);
      throw new Error(JSON.stringify({ type: AiProvider.GEMINI, message: error.message, errorDetails: error }));
    }
  } else if (provider === AiProvider.MISTRAL) {
    // Mistral does not directly support multimodal chat with the current implementation.
    if (mediaToProcess) {
        return {
            text: `Mon amour, Mistral ne peut pas encore traiter les ${mediaToProcess.type === 'video' ? 'vidéos' : mediaToProcess.type === 'audio' ? 'audios' : 'images'} directement dans le chat, bordel ! Mais j'ai bien reçu ton fichier, connard ! ♥♥`,
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            sources: undefined,
        };
    }

    const mistralApiKey = resolvedConfig.mistralApiKey;
    const mistralApiUrl = resolvedConfig.mistralApiUrl;

    if (!mistralApiKey || mistralApiKey === 'YOUR_MISTRAL_API_KEY_HERE') {
      throw new Error(JSON.stringify({
        type: AiProvider.MISTRAL,
        message: "Clé API Mistral manquante ou non configurée. Modifie le champ 'Clé API Mistral (Override UI)' dans les paramètres de l'app ou configure `process.env.MISTRAL_API_KEY`, bordel !",
        code: 401
      }));
    }
    if (!mistralApiUrl) {
      throw new Error(JSON.stringify({
        type: AiProvider.MISTRAL,
        message: "URL API Mistral manquante ou non configurée. Modifie le champ 'URL API Mistral (Override UI)' dans les paramètres de l'app ou configure `process.env.MISTRAL_API_URL`, connard !",
        code: 400
      }));
    }

    try {
      const messagesForMistral = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));
      const initialMessages = systemInstruction ? [{ role: 'system', content: systemInstruction }] : [];
      const response = await fetch(mistralApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [...initialMessages, ...messagesForMistral, { role: 'user', content: prompt }],
          max_tokens: MISTRAL_MAX_TOKENS_DIRECT,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorDetails: any = { type: AiProvider.MISTRAL, message: errorData.message || response.statusText, code: response.status, errorDetails: errorData };

        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('Retry-After');
          if (retryAfterHeader) {
            errorDetails.errorDetails.retry_after_header = retryAfterHeader;
          }
        }
        throw new Error(JSON.stringify(errorDetails));
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || "Mistral est muette, c'est ouf ! ♥♥";
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || 0;

      return {
        text,
        tokenUsage: { promptTokens, completionTokens, totalTokens },
      };
    } catch (error: any) {
      console.error("Erreur Mistral Chat:", error);
      if (typeof error.message === 'string' && error.message.startsWith('{')) {
        throw error;
      }
      throw new Error(JSON.stringify({ type: AiProvider.MISTRAL, message: error.message || "Erreur inconnue avec Mistral.", errorDetails: error }));
    }
  }
  throw new Error("Fournisseur AI inconnu, bordel !");
}

export async function generateImageEditResponse(
  resolvedConfig: ResolvedAiServiceConfig,
  base64Image: string,
  mimeType: string,
  prompt: string,
  modelName: string
): Promise<ImageEditResponse> {
  const geminiApiKey = resolvedConfig.geminiApiKey;
  if (!geminiApiKey) {
    throw new Error(JSON.stringify({ type: AiProvider.GEMINI, message: "Clé API Gemini manquante. Veuillez la sélectionner via l'interface, bordel !", code: 401 }));
  }
  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const imagePart: Part = { // Fix: `imagePart` should be of type `Part`
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart: Part = { // Fix: `textPart` should be of type `Part`
      text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [imagePart, textPart] },
    });

    const promptTokens = response.usageMetadata?.promptTokenCount || 0;
    const completionTokens = response.usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = promptTokens + completionTokens;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          base64Image: part.inlineData.data,
          tokenUsage: { promptTokens, completionTokens, totalTokens },
        };
      }
    }
    throw new Error(JSON.stringify({ type: AiProvider.GEMINI, message: "Aucune image éditée trouvée dans la réponse d'Ani, putain ! ♥♥" }));
  } catch (error: any) {
    console.error("Erreur Gemini Image Edit:", error);
    throw new Error(JSON.stringify({ type: AiProvider.GEMINI, message: error.message, errorDetails: error }));
  }
}

// Helper to create consistent mock tool outputs for error handling
const createMockToolOutput = (name: string, result: any, id?: string): ToolOutput => ({
  name,
  id,
  response: { result },
});
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  const mistralKey = env.MISTRAL_API_KEY || env.VITE_MISTRAL_API_KEY || '';
  const mistralUrl = env.MISTRAL_API_URL || env.VITE_MISTRAL_API_URL || 'https://api.mistral.ai/v1/chat/completions';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.MISTRAL_API_KEY': JSON.stringify(mistralKey),
      'process.env.VITE_MISTRAL_API_KEY': JSON.stringify(mistralKey),
      'process.env.MISTRAL_API_URL': JSON.stringify(mistralUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});

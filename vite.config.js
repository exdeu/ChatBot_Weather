import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { chatApi } from './server/chatApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every var from .env files (no VITE_ prefix needed) so keys stay
  // on the dev server and never end up in the client bundle.
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [
      react(),
      chatApi({
        hfApiKey: env.HF_API_KEY || env.HUGGINGFACE_API_KEY,
        hfModel: env.HF_MODEL,
        geminiApiKey: env.GEMINI_API_KEY,
        geminiModel: env.GEMINI_MODEL,
      }),
    ],
  }
})

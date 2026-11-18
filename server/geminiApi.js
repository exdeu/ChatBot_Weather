import { GoogleGenAI } from '@google/genai'

const MAX_BODY_BYTES = 1_000_000

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large.'))
        req.destroy()
        return
      }
      raw += chunk
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })

// Gemini requires the conversation to alternate user/model and to start with
// a user turn, so normalize whatever the UI sends.
const toContents = (messages) => {
  const contents = []
  for (const message of messages) {
    if (!message || typeof message.content !== 'string') continue
    const text = message.content.trim()
    if (!text) continue

    const role = message.role === 'assistant' ? 'model' : 'user'
    const last = contents.at(-1)
    if (last?.role === role) {
      last.parts[0].text += `\n\n${text}`
    } else {
      contents.push({ role, parts: [{ text }] })
    }
  }
  if (contents[0]?.role === 'model') contents.shift()
  return contents
}

const sendJson = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export const geminiApi = ({ apiKey, model = 'gemini-2.5-flash-lite' }) => ({
  name: 'gemini-api',
  configureServer(server) {
    server.middlewares.use('/api/gemini', async (req, res) => {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        sendJson(res, 405, { error: 'Method not allowed. Use POST.' })
        return
      }

      if (!apiKey) {
        sendJson(res, 500, { error: 'GEMINI_API_KEY is missing from .env.local.' })
        return
      }

      let messages
      try {
        ;({ messages } = JSON.parse((await readBody(req)) || '{}'))
      } catch {
        sendJson(res, 400, { error: 'Request body must be valid JSON.' })
        return
      }

      try {
        if (!Array.isArray(messages) || messages.length === 0) {
          sendJson(res, 400, { error: 'The "messages" array is required.' })
          return
        }

        const ai = new GoogleGenAI({ apiKey })
        const response = await ai.models.generateContent({
          model,
          contents: toContents(messages),
        })

        const text = response.text?.trim()
        if (!text) {
          sendJson(res, 502, { error: 'Gemini returned an empty response.' })
          return
        }

        sendJson(res, 200, { text })
      } catch (error) {
        console.error('[gemini-api]', error)
        sendJson(res, 502, {
          error: error?.message || 'Gemini request failed. Please try again.',
        })
      }
    })
  },
})

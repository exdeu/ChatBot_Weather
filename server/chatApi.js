const MAX_BODY_BYTES = 1_000_000
const DEFAULT_HF_MODEL = 'meta-llama/Llama-3.2-3B-Instruct'

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

const toChatMessages = (messages) => {
  const normalized = []
  for (const message of messages) {
    if (!message || typeof message.content !== 'string') continue
    const content = message.content.trim()
    if (!content) continue

    const role = message.role === 'assistant' ? 'assistant' : 'user'
    const last = normalized.at(-1)
    if (last?.role === role) {
      last.content += `\n\n${content}`
    } else {
      normalized.push({ role, content })
    }
  }

  if (normalized[0]?.role === 'assistant') normalized.shift()
  if (normalized.length === 0) normalized.push({ role: 'user', content: 'Hello' })
  return normalized
}

const sendJson = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const askHuggingFace = async ({ apiKey, model, messages }) => {
  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || DEFAULT_HF_MODEL,
      messages: toChatMessages(messages),
      temperature: 0.7,
      max_tokens: 512,
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `Hugging Face request failed (${response.status}).`
    throw new Error(errorMessage)
  }

  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Hugging Face returned an empty response.')
  return text
}

const askGemini = async ({ apiKey, model, messages }) => {
  const { GoogleGenAI } = await import('@google/genai')

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

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: model || 'gemini-2.5-flash-lite',
    contents,
  })

  const text = response.text?.trim()
  if (!text) throw new Error('Gemini returned an empty response.')
  return text
}

const handleChatRequest = async (req, res, config) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' })
    return
  }

  let messages
  try {
    ;({ messages } = JSON.parse((await readBody(req)) || '{}'))
  } catch {
    sendJson(res, 400, { error: 'Request body must be valid JSON.' })
    return
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    sendJson(res, 400, { error: 'The "messages" array is required.' })
    return
  }

  try {
    let text
    let provider
    if (config.hfApiKey) {
      provider = 'huggingface'
      text = await askHuggingFace({
        apiKey: config.hfApiKey,
        model: config.hfModel,
        messages,
      })
    } else if (config.geminiApiKey) {
      provider = 'gemini'
      text = await askGemini({
        apiKey: config.geminiApiKey,
        model: config.geminiModel,
        messages,
      })
    } else {
      sendJson(res, 500, {
        error:
          'No chat API key configured. Set HF_API_KEY (recommended) or GEMINI_API_KEY in .env.local.',
      })
      return
    }

    sendJson(res, 200, { text, provider })
  } catch (error) {
    console.error('[chat-api]', error)
    sendJson(res, 502, {
      error: error?.message || 'Chat request failed. Please try again.',
    })
  }
}

export const chatApi = (config = {}) => ({
  name: 'chat-api',
  configureServer(server) {
    const handler = (req, res) => handleChatRequest(req, res, config)
    server.middlewares.use('/api/chat', handler)
    server.middlewares.use('/api/gemini', handler)
  },
})

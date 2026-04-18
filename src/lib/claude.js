/**
 * SiteIQ — Claude API integration
 * Uses direct fetch with anthropic-dangerous-direct-browser-access header
 */

import { buildAnalysisPrompt, buildChatPrompt, FALLBACK_DEMO_REPORT } from './prompts.js'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

function getApiKey() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your_anthropic_api_key_here') {
    throw new Error('Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file.')
  }
  return key
}

export async function callClaude({ systemPrompt, messages, maxTokens = 4096 }) {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Main analysis function — passes all context to Claude and returns structured report
 * @param {Object} payload
 * @param {string}   payload.siteDescription  - plain-text site conditions
 * @param {string[]} payload.detectedObjects  - HF vision detections
 * @param {string}   payload.contractText     - extracted contract text
 * @param {Array}    payload.nerEntities      - HF NER entities
 * @param {File[]}   payload.photoFiles       - original site photos for Claude vision
 * @param {Function} payload.onStep           - progress callback(stepLabel)
 * @returns {Object} parsed report JSON
 */
export async function analyseSite({ siteDescription, detectedObjects, contractText, nerEntities, photoFiles, onStep }) {
  try {
    onStep?.('Claude: generating safety assessment')
    const { systemPrompt, userMessage } = buildAnalysisPrompt({
      siteDescription,
      detectedObjects,
      contractText,
      nerEntities,
    })

    // Build message content — prepend image blocks if photos are available
    const userContent = []
    if (photoFiles && photoFiles.length > 0) {
      for (const file of photoFiles.slice(0, 4)) {
        try {
          const base64Data = await fileToBase64(file)
          userContent.push({
            type: 'image',
            source: { type: 'base64', media_type: file.type || 'image/jpeg', data: base64Data },
          })
        } catch (err) {
          console.warn('Failed to encode photo:', err.message)
        }
      }
    }
    userContent.push({ type: 'text', text: userMessage })

    onStep?.('Claude: analysing contract obligations')
    const rawText = await callClaude({
      systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 6000,
    })

    onStep?.('Claude: building PM action plan')

    // Strip any markdown code fences Claude might wrap the JSON in
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim()

    const report = JSON.parse(jsonText)

    // Ensure required fields exist with sensible defaults
    return {
      reportTitle: report.reportTitle ?? 'SiteIQ Analysis Report',
      summary: report.summary ?? '',
      safetyScore: report.safetyScore ?? 50,
      contractScore: report.contractScore ?? 50,
      riskCount: report.riskCount ?? { high: 0, medium: 0, low: 0 },
      detectedObjects: report.detectedObjects ?? [],
      safeObservations: report.safeObservations ?? [],
      risks: report.risks ?? [],
      obligations: report.obligations ?? [],
      penaltyClauses: report.penaltyClauses ?? [],
      timeline: report.timeline ?? [],
      pmActions: report.pmActions ?? [],
      notices: report.notices ?? [],
    }
  } catch (err) {
    console.error('analyseSite error:', err)

    // If it's a JSON parse error, log the raw text for debugging
    if (err instanceof SyntaxError) {
      console.error('JSON parse failed — Claude returned non-JSON response')
    }

    // Return fallback demo report so the UI is always usable
    return { ...FALLBACK_DEMO_REPORT, _isFallback: true, _error: err.message }
  }
}

/**
 * Contract Q&A chat — scoped to the uploaded contract
 * @param {Array}  chatHistory  - array of {role, content} messages
 * @param {string} contractText - the contract text for context
 * @returns {string} Claude's reply
 */
export async function chatWithContract(chatHistory, contractText) {
  const systemPrompt = buildChatPrompt(contractText)

  // Convert chat history to Claude message format
  const messages = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))

  const reply = await callClaude({
    systemPrompt,
    messages,
    maxTokens: 1024,
  })

  return reply
}

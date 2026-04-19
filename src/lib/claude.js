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
export async function analyseSite({ siteDescription, detectedObjects, contractText, nerEntities, photoFiles, projectInfo, weatherContext, geoContext, onStep }) {
  try {
    onStep?.('Claude: generating safety assessment')
    const systemPrompt = buildAnalysisPrompt()

    // Build user message — contract first, then context, then instruction
    const parts = []

    // 1 — CONTRACT (most important — first)
    if (contractText && contractText.length > 50) {
      parts.push(`CONTRACT:\n${contractText.slice(0, 25000)}`)
    } else {
      parts.push('CONTRACT: None provided.')
    }

    // 2 — SITE DESCRIPTION
    if (siteDescription?.trim()) {
      parts.push(`SITE DESCRIPTION:\n${siteDescription}`)
    }

    // 3 — PROJECT DETAILS
    parts.push(`PROJECT:
Name: ${projectInfo?.projectName || 'Not given'}
Nigerian state: ${projectInfo?.selectedState || 'Lagos'}
Construction phase: ${projectInfo?.constructionPhase || 'Not given'}
Workers on site: ${projectInfo?.workerCount || 'Not given'}`)

    // 4 — COMPUTER VISION DETECTIONS
    if (detectedObjects && detectedObjects.length > 0) {
      parts.push(`OBJECTS DETECTED IN PHOTOS:\n${detectedObjects.join(', ')}`)
    }

    // 5 — WEATHER (if available)
    if (weatherContext?.trim()) {
      parts.push(`WEATHER:\n${weatherContext}`)
    }

    // 6 — GROUND CONDITIONS (if available)
    if (geoContext?.trim()) {
      parts.push(`GROUND:\n${geoContext}`)
    }

    // 7 — SINGLE INSTRUCTION
    parts.push('Analyse everything above and return the JSON report. Base it only on what is provided here.')

    const userMessage = parts.join('\n\n')

    console.log('--- CLAUDE MESSAGE ---')
    console.log('Contract chars:', contractText?.length || 0)
    console.log('Site description chars:', siteDescription?.length || 0)
    console.log('Photos:', photoFiles?.length || 0)
    console.log('Message preview:', userMessage.slice(0, 500))

    // Build message content — image blocks first, then text
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

    // Extract JSON object robustly — handles code fences, leading/trailing text
    let jsonText = rawText.trim()
    // Strip markdown code fences if present
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    // If there's still non-JSON text before the object, find the first {
    if (!jsonText.startsWith('{')) {
      const objStart = jsonText.indexOf('{')
      const arrStart = jsonText.indexOf('[')
      const start = objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart)
      if (start !== -1) jsonText = jsonText.slice(start)
    }
    // Trim any trailing text after the final }
    const lastBrace = jsonText.lastIndexOf('}')
    if (lastBrace !== -1 && lastBrace < jsonText.length - 1) {
      jsonText = jsonText.slice(0, lastBrace + 1)
    }

    console.log('[SiteIQ] JSON extraction preview:', jsonText.slice(0, 200))
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
 * Convenience wrapper — quick single-turn Claude call, returns text or null
 * Used by feature cards across the app (weather, geo, dashboard, etc.)
 */
export async function askClaude(prompt, systemContext = '', maxTokens = 500) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your_anthropic_api_key_here') return null
  try {
    return await callClaude({
      systemPrompt: systemContext ||
        'You are SiteIQ — an expert Nigerian construction safety and contract intelligence AI. Be specific, practical, and always reference Nigerian context where relevant. Keep responses concise.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens,
    })
  } catch (e) {
    console.error('askClaude error:', e.message)
    return null
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

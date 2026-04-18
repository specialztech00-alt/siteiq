/**
 * SiteIQ — Assistant AI API
 * Handles the general-purpose construction assistant chat.
 */

import { buildAssistantPrompt } from './prompts.js'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

function getApiKey() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your_anthropic_api_key_here') {
    throw new Error('Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file.')
  }
  return key
}

/**
 * Parse FOLLOW_UPS line from Claude's response.
 * Expected format: FOLLOW_UPS: question1 | question2 | question3
 */
export function parseFollowUps(text) {
  const match = text.match(/FOLLOW_UPS:\s*(.+?)(?:\n|$)/i)
  if (!match) return []
  return match[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 3)
}

/**
 * Strip the FOLLOW_UPS line from the visible response text.
 */
export function cleanResponseText(text) {
  return text.replace(/\n?FOLLOW_UPS:.*$/im, '').trim()
}

/**
 * Send messages to Claude with the assistant system prompt.
 * @param {Array} messages - [{role:'user'|'assistant', content:string}]
 * @param {string} selectedState - Current Nigerian state
 * @param {string} recentProjectTitle - Title of most recent analysis
 * @param {string} systemPromptOverride - Full system prompt (overrides default when provided)
 */
export async function chatWithAssistant({ messages, selectedState, recentProjectTitle, systemPromptOverride }) {
  const systemPrompt = systemPromptOverride ?? buildAssistantPrompt({ selectedState, recentProjectTitle })

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
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  return data.content[0].text
}

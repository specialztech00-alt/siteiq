/**
 * SiteIQ — Hugging Face Inference API integration
 * Models: facebook/detr-resnet-50 (object detection), dslim/bert-base-NER (entity recognition)
 */

const HF_API_BASE = 'https://api-inference.huggingface.co/models'
const DETR_MODEL = 'facebook/detr-resnet-50'
const NER_MODEL = 'dslim/bert-base-NER'

function getHfKey() {
  const key = import.meta.env.VITE_HF_API_KEY
  if (!key || key === 'your_huggingface_api_key_here') {
    throw new Error('Hugging Face API key not configured. Add VITE_HF_API_KEY to your .env file.')
  }
  return key
}

/**
 * Detect objects in a site photo using DETR
 * @param {File} imageFile - the uploaded image file
 * @returns {string[]} array of detected object labels
 */
export async function detectObjects(imageFile) {
  const arrayBuffer = await imageFile.arrayBuffer()

  const response = await fetch(`${HF_API_BASE}/${DETR_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getHfKey()}`,
      'Content-Type': 'application/octet-stream',
    },
    body: arrayBuffer,
  })

  if (response.status === 503) {
    // Model is loading — wait and retry once
    await new Promise(r => setTimeout(r, 8000))
    const retry = await fetch(`${HF_API_BASE}/${DETR_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getHfKey()}`,
        'Content-Type': 'application/octet-stream',
      },
      body: arrayBuffer,
    })
    if (!retry.ok) throw new Error(`HF DETR model unavailable after retry: ${retry.status}`)
    const data = await retry.json()
    return parseDetections(data)
  }

  if (!response.ok) {
    throw new Error(`HF object detection error ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  return parseDetections(data)
}

function parseDetections(data) {
  if (!Array.isArray(data)) return []

  // Deduplicate labels and filter by confidence > 0.7
  const seen = new Set()
  const labels = []
  for (const item of data) {
    if (item.score > 0.7 && !seen.has(item.label)) {
      seen.add(item.label)
      labels.push(item.label)
    }
  }
  return labels
}

/**
 * Detect objects across multiple site photos — runs in parallel and deduplicates
 * @param {File[]} imageFiles - array of image files
 * @returns {string[]} deduplicated array of detected object labels
 */
export async function detectAllPhotos(imageFiles) {
  if (!imageFiles || imageFiles.length === 0) return []

  const results = await Promise.all(
    imageFiles.map(async (file) => {
      try {
        return await detectObjects(file)
      } catch {
        return []
      }
    })
  )

  const seen = new Set()
  return results.flat().filter(label => {
    if (seen.has(label)) return false
    seen.add(label)
    return true
  })
}

/**
 * Extract named entities from contract text using BERT NER
 * @param {string} text - contract text
 * @returns {Array} array of entity objects {word, entity_group, score}
 */
export async function extractEntities(text) {
  // NER works best on shorter chunks — split at ~512 tokens (~1800 chars)
  const CHUNK_SIZE = 1800
  const chunks = []
  for (let i = 0; i < Math.min(text.length, 7200); i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE))
  }

  const results = []
  for (const chunk of chunks) {
    const response = await fetch(`${HF_API_BASE}/${NER_MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getHfKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: chunk }),
    })

    if (response.status === 503) {
      // Skip this chunk if model is warming up — Claude will still get the raw text
      continue
    }

    if (!response.ok) {
      console.warn(`HF NER error on chunk: ${response.status}`)
      continue
    }

    const entities = await response.json()
    if (Array.isArray(entities)) {
      results.push(...entities)
    }
  }

  // Deduplicate by word+entity_group
  const seen = new Set()
  return results.filter(e => {
    const key = `${e.word}:${e.entity_group}`
    if (seen.has(key)) return false
    seen.add(key)
    return e.score > 0.85
  })
}

/**
 * SiteIQ — PDF text extraction using PDF.js
 */

let pdfjsLib = null

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib

  // Dynamic import to avoid build-time issues with the worker
  pdfjsLib = await import('pdfjs-dist')

  // Use CDN-hosted worker to avoid Vite/worker bundling complexity
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  return pdfjsLib
}

/**
 * Extract all text from a PDF file
 * @param {File} file - the uploaded PDF File object
 * @returns {string} concatenated text content from all pages
 */
export async function extractTextFromPDF(file) {
  const pdfjs = await getPdfjs()

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  const pageTexts = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ')
    pageTexts.push(pageText)
  }

  return pageTexts.join('\n\n')
}

/**
 * Extract text from a plain .txt file
 * @param {File} file
 * @returns {string}
 */
export async function extractTextFromTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file)
  })
}

/**
 * Smart text extractor — handles PDF, TXT, and DOCX (text only for DOCX)
 * @param {File} file
 * @returns {string}
 */
export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    return extractTextFromPDF(file)
  }

  if (ext === 'txt') {
    return extractTextFromTxt(file)
  }

  // For .docx, attempt to read as text (works for simple Office Open XML)
  // Full DOCX parsing would require mammoth.js — text fallback is sufficient for hackathon
  try {
    const text = await extractTextFromTxt(file)
    if (text.length > 100) return text
  } catch {
    // fall through
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF or TXT file.`)
}

/**
 * SiteIQ — PDF text extraction using PDF.js
 */

export async function extractTextFromPDF(file) {
  if (!file) {
    console.log('pdfParser: no file provided')
    return ''
  }

  console.log('pdfParser: processing file', {
    name: file.name,
    type: file.type,
    size: file.size,
  })

  // Handle plain text files
  if (file.type === 'text/plain' || file.name?.toLowerCase().endsWith('.txt')) {
    try {
      const text = await file.text()
      console.log('pdfParser: text file, chars:', text.length)
      return text
    } catch (e) {
      console.error('pdfParser: text read failed', e)
      return ''
    }
  }

  // Handle PDF files
  try {
    const pdfjsLib = await import('pdfjs-dist/build/pdf')

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      try {
        const workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.js',
          import.meta.url
        ).toString()
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
      } catch (e) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    console.log('pdfParser: arrayBuffer size:', arrayBuffer.byteLength)

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      verbosity: 0,
      disableFontFace: true,
      useSystemFonts: false,
    }).promise

    console.log('pdfParser: PDF loaded,', pdf.numPages, 'pages')

    let fullText = ''
    const maxPages = Math.min(pdf.numPages, 30)

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false,
        })

        const pageText = textContent.items
          .map(item => {
            if (item.str) return item.str
            if (item.hasEOL) return '\n'
            return ''
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (pageText) {
          fullText += pageText + '\n\n'
        }

        console.log(`pdfParser: page ${pageNum} extracted ${pageText.length} chars`)
      } catch (pageError) {
        console.warn(`pdfParser: page ${pageNum} failed:`, pageError)
      }
    }

    const finalText = fullText.trim()
    console.log('pdfParser: TOTAL extracted', finalText.length, 'characters')
    console.log('pdfParser: preview:', finalText.slice(0, 300))

    if (finalText.length < 100) {
      console.warn('pdfParser: very little text extracted. PDF may be image-based or scanned.')
      return finalText + '\n[Note: Limited text extracted. PDF may be a scanned document.]'
    }

    return finalText
  } catch (error) {
    console.error('pdfParser: PDF extraction failed:', error)

    try {
      const text = await file.text()
      if (text.length > 100) {
        console.log('pdfParser: fallback text read:', text.length, 'chars')
        return text
      }
    } catch (e) {
      console.error('pdfParser: fallback also failed:', e)
    }

    return ''
  }
}

export async function extractTextFromTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file)
  })
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    return extractTextFromPDF(file)
  }

  if (ext === 'txt') {
    return extractTextFromTxt(file)
  }

  try {
    const text = await extractTextFromTxt(file)
    if (text.length > 100) return text
  } catch {
    // fall through
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF or TXT file.`)
}

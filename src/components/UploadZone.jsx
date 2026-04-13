import { useRef, useState } from 'react'

export default function UploadZone({ accept, label, icon, hint, file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleChange(e) {
    const selected = e.target.files[0]
    if (selected) onFile(selected)
  }

  const hasFile = !!file

  return (
    <div
      className={[
        'upload-zone relative select-none',
        isDragging ? 'drag-over' : '',
        hasFile ? 'has-file' : '',
      ].join(' ')}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !hasFile && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {hasFile ? (
        /* File loaded state */
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 text-xl">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-green-700 text-sm truncate">{file.name}</p>
              <p className="text-xs text-green-600 mt-0.5">
                {(file.size / 1024).toFixed(0)} KB — ready to analyse
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="ml-3 flex-shrink-0 w-7 h-7 rounded-full bg-green-100 hover:bg-red-100 text-green-600 hover:text-red-500 flex items-center justify-center transition-colors"
            title="Remove file"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
          </div>
          <span className="text-xs text-yellow-600 font-medium mt-1">
            Click or drag &amp; drop
          </span>
        </div>
      )}
    </div>
  )
}

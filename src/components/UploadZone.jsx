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
      className={['upload-zone', isDragging ? 'drag-over' : '', hasFile ? 'has-file' : ''].join(' ')}
      style={{ position: 'relative', userSelect: 'none' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !hasFile && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {hasFile ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, fontSize: '20px',
            }}>
              {icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: 'var(--success)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '2px' }}>
                {(file.size / 1024).toFixed(0)} KB — ready to analyse
              </p>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClear() }}
            style={{
              marginLeft: '12px', flexShrink: 0, width: '28px', height: '28px',
              borderRadius: '50%', background: 'var(--success-bg)', border: '1px solid var(--success)',
              color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--success-bg)'; e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.color = 'var(--success)' }}
            title="Remove file"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12"/>
              <line x1="12" y1="2" x2="2" y2="12"/>
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '22px',
          }}>
            {icon}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px' }}>{label}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{hint}</p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-accent)', fontWeight: 600, marginTop: '2px' }}>
            Click or drag &amp; drop
          </span>
        </div>
      )}
    </div>
  )
}

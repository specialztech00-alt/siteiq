export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div className="skeleton skeleton-title" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton skeleton-text ${i % 3 === 0 ? 'wide' : i % 3 === 1 ? 'medium' : 'narrow'}`}
        />
      ))}
    </div>
  )
}

export function ReportSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Score strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="skeleton skeleton-score" />
            <div className="skeleton skeleton-text narrow" style={{ marginBottom: 0 }} />
          </div>
        ))}
      </div>
      {/* Progress card */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="skeleton skeleton-title" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {[0, 1].map(i => (
            <div key={i}>
              <div className="skeleton skeleton-text narrow" />
              <div className="skeleton" style={{ height: '48px', width: '120px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '8px', width: '100%', marginBottom: '6px', borderRadius: '4px' }} />
              <div className="skeleton skeleton-text medium" style={{ marginBottom: 0 }} />
            </div>
          ))}
        </div>
      </div>
      {/* Risk cards */}
      <CardSkeleton lines={3} />
      <CardSkeleton lines={2} />
      <CardSkeleton lines={3} />
    </div>
  )
}

export function AnalysisSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton skeleton-title" />
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="skeleton skeleton-score" />
        <div className="skeleton skeleton-score" />
      </div>
      <div className="skeleton skeleton-text wide" />
      <div className="skeleton skeleton-text medium" />
      <div className="skeleton skeleton-text narrow" />
    </div>
  )
}

export default function SkeletonCard() {
  return (
    <div
      aria-busy="true"
      style={{
        border: '1px solid #e2e2e2',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    >
      <div style={{ width: '100%', height: 160, background: '#eee' }} />
      <div style={{ padding: 12 }}>
        <div style={{ height: 16, background: '#eee', width: '70%', marginBottom: 8 }} />
        <div style={{ height: 12, background: '#eee', width: '100%', marginBottom: 6 }} />
        <div style={{ height: 12, background: '#eee', width: '80%' }} />
      </div>
    </div>
  );
}


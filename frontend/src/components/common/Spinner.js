import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return <div className={`${cls} ${className}`} />;
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <Spinner size="lg" />
      <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, zIndex: 9999,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.8rem', fontWeight: 800,
        background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Roxiler
      </div>
      <Spinner size="lg" />
    </div>
  );
}

export default Spinner;

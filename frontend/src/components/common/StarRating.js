import React, { useState } from 'react';

export function StarDisplay({ rating, count, size = 'sm' }) {
  const filled = Math.round(rating || 0);
  const fontSize = size === 'lg' ? '1.2rem' : '0.9rem';
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`star ${s <= filled ? 'filled' : ''}`} style={{ fontSize }}>★</span>
      ))}
      {rating != null && <span className="rating-value">{Number(rating).toFixed(1)}</span>}
      {count != null && <span className="rating-count">({count})</span>}
    </div>
  );
}

export function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star interactive ${s <= (hovered || value) ? 'filled' : ''}`}
          style={{ fontSize: '1.5rem' }}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          ★
        </span>
      ))}
      {value > 0 && <span className="rating-value">{value}/5</span>}
    </div>
  );
}

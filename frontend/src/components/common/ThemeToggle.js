import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <button
      onClick={toggle}
      className="btn btn-ghost btn-sm"
      title="Toggle theme"
      style={{ fontSize: '1rem', padding: '6px 10px' }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
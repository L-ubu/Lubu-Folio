import { useState } from 'react';

export default function BackToHub() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="/"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        top: 24,
        left: 24,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: 'rgba(17,17,17,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
        borderRadius: 999,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: hovered ? 'var(--color-accent)' : '#888',
        textDecoration: 'none',
        transition: 'all 0.3s',
        cursor: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transition: 'transform 0.3s',
          transform: hovered ? 'translateX(-3px)' : 'translateX(0)',
        }}
      >
        ←
      </span>
      Hub
    </a>
  );
}

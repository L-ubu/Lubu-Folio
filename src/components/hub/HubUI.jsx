import { useState, useEffect } from 'react';
import { useAchievementStore } from '../achievements/store';

export default function HubUI({ achievementCount, achievementTotal }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
      {/* Name signature - bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 32,
          pointerEvents: 'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.5s',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#f5f5f5',
          }}
        >
          Luca Vandenweghe
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#666',
            marginTop: 4,
          }}
        >
          Creative Developer
        </div>
      </div>

      {/* Achievement counter - bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          pointerEvents: 'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.7s',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: '#666',
          background: 'rgba(17,17,17,0.6)',
          backdropFilter: 'blur(10px)',
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #222',
        }}
      >
        <span style={{ fontSize: 16 }}>🏆</span>
        <span>
          <span style={{ color: 'var(--color-accent)' }}>{achievementCount}</span>
          /{achievementTotal}
        </span>
      </div>

      {/* Hint text - top center */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: '#444',
          letterSpacing: '0.1em',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 2s ease 2s',
        }}
      >
        choose your experience
      </div>
    </div>
  );
}

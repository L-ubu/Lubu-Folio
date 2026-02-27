import { useEffect, useState } from 'react';
import { useAchievementStore } from '../achievements/store';

export default function AchievementToast() {
  const queue = useAchievementStore((s) => s.queue);
  const dismiss = useAchievementStore((s) => s.dismissToast);
  const [visible, setVisible] = useState(false);
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(dismiss, 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  if (!current) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99998,
        background: '#111',
        border: '1px solid #333',
        borderRadius: 12,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'var(--font-body)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s',
      }}
    >
      <span style={{ fontSize: 28 }}>{current.icon}</span>
      <div>
        <div style={{ color: 'var(--color-accent)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Achievement Unlocked
        </div>
        <div style={{ color: '#f5f5f5', fontSize: 15, fontWeight: 600, marginTop: 2 }}>{current.title}</div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 1 }}>{current.description}</div>
      </div>
    </div>
  );
}

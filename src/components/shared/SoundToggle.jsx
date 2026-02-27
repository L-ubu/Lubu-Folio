import { useState, useEffect } from 'react';
import { useAchievementStore } from '../achievements/store';
import { getStored, setStored } from '../../utils/storage';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);

  useEffect(() => {
    setEnabled(getStored('sound-enabled', false));
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setStored('sound-enabled', next);
    if (next) {
      unlock('sound-on');
      playClick();
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        position: 'fixed',
        top: 24,
        right: 68,
        zIndex: 50,
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(17,17,17,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
        color: enabled ? 'var(--color-accent)' : '#555',
        cursor: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        transition: 'all 0.3s',
      }}
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}

function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

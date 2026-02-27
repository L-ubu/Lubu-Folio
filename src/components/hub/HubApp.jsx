import { useState, useEffect, useCallback } from 'react';
import ParticleCanvas from './ParticleCanvas';
import PortalNodes from './PortalNode';
import HubUI from './HubUI';
import AchievementToast from '../shared/AchievementToast';
import CustomCursor from '../shared/CustomCursor';
import { useAchievementStore } from '../achievements/store';
import { initSecrets } from '../achievements/secrets';
import { getAccentColor } from '../../utils/storage';

export default function HubApp() {
  const [transitioning, setTransitioning] = useState(false);
  const [targetHref, setTargetHref] = useState(null);
  const unlock = useAchievementStore((s) => s.unlock);
  const count = useAchievementStore((s) => s.unlocked.length);
  const total = useAchievementStore((s) => s.getTotal());
  const accentColor = getAccentColor();

  useEffect(() => {
    const cleanup = initSecrets(unlock);
    return cleanup;
  }, [unlock]);

  const handleNavigate = useCallback((href) => {
    unlock('portal-traveler');
    setTransitioning(true);
    setTargetHref(href);
    setTimeout(() => {
      window.location.href = href;
    }, 800);
  }, [unlock]);

  return (
    <>
      <CustomCursor />
      <ParticleCanvas accentColor={accentColor} />
      <PortalNodes onNavigate={handleNavigate} />
      <HubUI achievementCount={count} achievementTotal={total} />
      <AchievementToast />

      {/* Transition overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#050505',
          opacity: transitioning ? 1 : 0,
          pointerEvents: transitioning ? 'all' : 'none',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </>
  );
}

import { useEffect } from 'react';
import { useAchievementStore } from '../achievements/store';
import { initSecrets } from '../achievements/secrets';

export default function SectionObserver() {
  const visitSection = useAchievementStore((s) => s.visitSection);
  const unlock = useAchievementStore((s) => s.unlock);

  useEffect(() => {
    const cleanup = initSecrets(unlock);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.dataset.section;
            if (section) visitSection(section);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('[data-section]').forEach((el) => {
      observer.observe(el);
    });

    let startTime = null;
    const checkSpeedrun = () => {
      if (!startTime) {
        startTime = Date.now();
        return;
      }
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= docHeight - 10) {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed < 10) {
          unlock('speed-runner');
        }
      }
    };

    window.addEventListener('scroll', checkSpeedrun, { passive: true });

    return () => {
      cleanup();
      observer.disconnect();
      window.removeEventListener('scroll', checkSpeedrun);
    };
  }, [visitSection, unlock]);

  return null;
}

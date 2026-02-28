const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function initSecrets(unlockAchievement) {
  let konamiIndex = 0;
  let slimeBuffer = '';
  let nameClickCount = 0;

  function handleKeydown(e) {
    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        unlockAchievement('konami-master');
        triggerKonamiEffect();
      }
    } else {
      konamiIndex = 0;
    }

    slimeBuffer += e.key.toLowerCase();
    if (slimeBuffer.length > 10) slimeBuffer = slimeBuffer.slice(-10);
    if (slimeBuffer.endsWith('slime')) {
      slimeBuffer = '';
      triggerSlimeFlash();
    }
  }

  function handleContextMenu(e) {
    e.preventDefault();
    unlockAchievement('secret-menu');
    showCustomContextMenu(e.clientX, e.clientY);
  }

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('contextmenu', handleContextMenu);

  const hour = new Date().getHours();
  if (hour >= 1 && hour < 5) {
    unlockAchievement('night-owl');
  }

  unlockAchievement('first-visit');

  window.__nameClick = () => {
    nameClickCount++;
    if (nameClickCount >= 7) {
      nameClickCount = 0;
      unlockAchievement('slime-rain');
      triggerSlimeRain();
    }
  };

  return () => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('contextmenu', handleContextMenu);
  };
}

function triggerKonamiEffect() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 100 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: (Math.random() - 0.5) * 20,
    vy: (Math.random() - 0.5) * 20,
    size: Math.random() * 8 + 2,
    color: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#f43f5e'][Math.floor(Math.random() * 5)],
    life: 1,
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life -= 0.015;
      if (p.life <= 0) continue;
      alive = true;

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (alive) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

function triggerSlimeFlash() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;background:#22c55e;opacity:0.4;transition:opacity 0.8s;';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 800);
  });
}

function triggerSlimeRain() {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < 30; i++) {
    const slime = document.createElement('div');
    const x = Math.random() * 100;
    const delay = Math.random() * 2;
    const size = 20 + Math.random() * 30;
    slime.textContent = '🟢';
    slime.style.cssText = `position:absolute;top:-50px;left:${x}%;font-size:${size}px;animation:slimeFall 3s ${delay}s ease-in forwards;`;
    container.appendChild(slime);
  }

  if (!document.getElementById('slime-keyframes')) {
    const style = document.createElement('style');
    style.id = 'slime-keyframes';
    style.textContent = '@keyframes slimeFall { to { top: 110vh; transform: rotate(720deg); } }';
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), 6000);
}

function showCustomContextMenu(x, y) {
  const existing = document.getElementById('custom-ctx');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'custom-ctx';
  menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:99999;background:#111;border:1px solid #333;border-radius:8px;padding:4px;min-width:180px;font-family:var(--font-mono);font-size:13px;box-shadow:0 8px 30px rgba(0,0,0,0.5);`;

  const items = [
    { label: '🟢 I am MrGreenSlime', action: triggerSlimeRain },
    { label: '🎮 Konami?', action: triggerKonamiEffect },
    { label: '💚 Go green', action: triggerSlimeFlash },
    { label: '🔍 Copy page source', action: () => {
      navigator.clipboard.writeText(document.documentElement.outerHTML).then(() => {
        const toast = document.createElement('div');
        toast.textContent = '📋 Source HTML copied to clipboard!';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;background:#111;border:1px solid var(--color-accent);border-radius:8px;padding:12px 20px;font-family:var(--font-mono);font-size:13px;color:var(--color-accent);box-shadow:0 8px 30px rgba(0,0,0,0.5);';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      });
    }},
  ];

  for (const item of items) {
    const btn = document.createElement('button');
    btn.textContent = item.label;
    btn.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 12px;background:none;border:none;color:#f5f5f5;cursor:pointer;border-radius:4px;';
    btn.onmouseenter = () => btn.style.background = '#222';
    btn.onmouseleave = () => btn.style.background = 'none';
    btn.onclick = () => { item.action(); menu.remove(); };
    menu.appendChild(btn);
  }

  document.body.appendChild(menu);

  const dismiss = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', dismiss);
    }
  };
  setTimeout(() => document.addEventListener('click', dismiss), 10);
}

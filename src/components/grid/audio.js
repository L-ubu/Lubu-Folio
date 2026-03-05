let ctx = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, dur, type = "square", vol = 0.06) {
  const ac = getCtx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  } catch {}
}

export function playClick() {
  tone(600 + Math.random() * 400, 0.05, "square", 0.04);
}

export function playBuy() {
  tone(400, 0.07, "square", 0.05);
  setTimeout(() => tone(600, 0.07, "square", 0.05), 70);
  setTimeout(() => tone(800, 0.1, "square", 0.05), 140);
}

export function playMilestone() {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => tone(f, 0.15, "square", 0.06), i * 100),
  );
}

export function playPrestige() {
  const notes = [262, 330, 392, 523, 659, 784, 1047];
  notes.forEach((f, i) =>
    setTimeout(() => tone(f, 0.3 - i * 0.02, "sawtooth", 0.05), i * 120),
  );
}

export function playError() {
  tone(200, 0.12, "sawtooth", 0.03);
}

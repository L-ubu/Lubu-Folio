import { useState, useRef, useCallback, useEffect } from "react";

let audioCtx = null;
function getCtx() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playPageFlip() {
  try {
    const ctx = getCtx();
    const duration = 0.25;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 20) * 0.3;
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  } catch {}
}

function createMusicBox(ctx) {
  const notes = [
    { freq: 523.25, time: 0 }, // C5
    { freq: 659.25, time: 0.4 }, // E5
    { freq: 783.99, time: 0.8 }, // G5
    { freq: 659.25, time: 1.2 }, // E5
    { freq: 523.25, time: 1.6 }, // C5
    { freq: 392.0, time: 2.0 }, // G4
    { freq: 440.0, time: 2.4 }, // A4
    { freq: 523.25, time: 2.8 }, // C5
    { freq: 659.25, time: 3.2 }, // E5
    { freq: 587.33, time: 3.6 }, // D5
    { freq: 523.25, time: 4.0 }, // C5
    { freq: 440.0, time: 4.4 }, // A4
    { freq: 392.0, time: 4.8 }, // G4
    { freq: 349.23, time: 5.2 }, // F4
    { freq: 392.0, time: 5.6 }, // G4
    { freq: 523.25, time: 6.0 }, // C5
  ];

  const loopDuration = 6.8;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.06;
  masterGain.connect(ctx.destination);

  let stopped = false;

  function scheduleLoop() {
    if (stopped) return;
    const now = ctx.currentTime;

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const noteGain = ctx.createGain();
      const start = now + time;
      noteGain.gain.setValueAtTime(0, start);
      noteGain.gain.linearRampToValueAtTime(1, start + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(noteGain).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.4);
    });

    setTimeout(() => scheduleLoop(), loopDuration * 1000);
  }

  return {
    start: () => scheduleLoop(),
    stop: () => {
      stopped = true;
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    },
    gain: masterGain,
  };
}

export default function AudioController({ currentPage }) {
  const [muted, setMuted] = useState(true);
  const musicRef = useRef(null);
  const prevPage = useRef(currentPage);

  useEffect(() => {
    if (prevPage.current !== currentPage) {
      if (!muted) playPageFlip();
      prevPage.current = currentPage;
    }
  }, [currentPage, muted]);

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (!next) {
        const ctx = getCtx();
        if (ctx.state === "suspended") ctx.resume();
        if (!musicRef.current) {
          musicRef.current = createMusicBox(ctx);
          musicRef.current.start();
        } else {
          musicRef.current.gain.gain.linearRampToValueAtTime(
            0.06,
            ctx.currentTime + 0.3,
          );
        }
      } else {
        if (musicRef.current) {
          const ctx = getCtx();
          musicRef.current.gain.gain.linearRampToValueAtTime(
            0,
            ctx.currentTime + 0.3,
          );
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (musicRef.current) musicRef.current.stop();
    };
  }, []);

  return (
    <button
      onClick={toggle}
      style={S.button}
      title={muted ? "Turn on music" : "Mute"}
      data-cursor-hover
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

const S = {
  button: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.9)",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    zIndex: 100,
  },
};

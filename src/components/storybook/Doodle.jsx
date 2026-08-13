import { useReducedMotion } from "../../utils/motion";

export function Heart({
  x = 50,
  y = 50,
  size = 24,
  color = "#DA291C",
  hidden = false,
  onClick,
}) {
  return (
    <svg
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        opacity: hidden ? 0.08 : 0.6,
        cursor: onClick ? "pointer" : "default",
        pointerEvents: onClick ? "auto" : "none",
        transition: "opacity 0.3s, transform 0.3s",
        filter: hidden ? "none" : `drop-shadow(0 0 4px ${color}40)`,
      }}
      viewBox="0 0 24 24"
      fill={color}
      className={onClick ? "doodle-heart-clickable" : ""}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function Star({
  x = 50,
  y = 50,
  size = 20,
  color = "#F5CD2F",
  rotation = 0,
  twinkle = false,
  twinkleDuration,
}) {
  const reduced = useReducedMotion();
  const dur = twinkleDuration || 2 + (x % 4) * 0.7;
  const held = twinkle && reduced;
  return (
    <svg
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        // Held at the twinkle keyframe's own 50% (bright) frame — freezing
        // at 0% would drop every star to 0.3 opacity (§3.6).
        transform: held
          ? `translate(-50%, -50%) rotate(${rotation}deg) scale(1.1)`
          : `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity: held ? 0.7 : 0.5,
        pointerEvents: "none",
        animation:
          twinkle && !reduced ? `twinkle ${dur}s ease-in-out infinite` : undefined,
        animationDelay: twinkle && !reduced ? `${(rotation % 5) * 0.3}s` : undefined,
      }}
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z" />
    </svg>
  );
}

export function Arrow({
  x = 50,
  y = 50,
  size = 40,
  color = "#DA291C",
  rotation = 0,
}) {
  return (
    <svg
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size * 0.5,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity: 0.4,
        pointerEvents: "none",
      }}
      viewBox="0 0 60 30"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 3"
    >
      <path d="M5 15 C15 5, 35 25, 50 15" />
      <path d="M45 10 L50 15 L44 19" />
    </svg>
  );
}

export function Squiggle({ x = 50, y = 50, width = 80, color = "#009247" }) {
  return (
    <svg
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width,
        height: 20,
        transform: "translate(-50%, -50%)",
        opacity: 0.3,
        pointerEvents: "none",
      }}
      viewBox="0 0 100 20"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 10 Q15 2 25 10 Q35 18 45 10 Q55 2 65 10 Q75 18 85 10 Q95 2 95 10" />
    </svg>
  );
}

export function Circle({ x = 50, y = 50, size = 30, color = "#006DB7" }) {
  return (
    <svg
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        opacity: 0.2,
        pointerEvents: "none",
      }}
      viewBox="0 0 30 30"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray="3 4"
    >
      <circle cx="15" cy="15" r="12" />
    </svg>
  );
}

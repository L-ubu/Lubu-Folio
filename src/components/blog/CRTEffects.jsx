export default function CRTEffects({ intensity = 1 }) {
  const opacity = 0.04 * intensity;
  return (
    <>
      {/* Subtle scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,${opacity}) 3px, rgba(255,255,255,${opacity}) 6px)`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {/* Soft vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)",
          pointerEvents: "none",
          zIndex: 11,
        }}
      />
    </>
  );
}

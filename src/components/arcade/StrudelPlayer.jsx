import { useRef, useState, useCallback, useEffect } from "react";

const PRESETS = [
  {
    name: "ARCADE",
    code: `// ♫ NEON ARCADE
setcps(.6)

$: s("bd:3 [~ bd:3] sd:1 ~").gain(.55)

$: s("[~ hh:0]*4").gain(.2).pan(sine.slow(2))

$: note("<c2 c2 ab1 bb1>")
.s("sawtooth")
.cutoff(sine.range(200,600).slow(4))
.decay(.25).sustain(.08).gain(.22)

$: note("c4 eb4 g4 c5 bb4 g4 eb4 c4")
.s("square")
.cutoff(sine.range(600,2800).slow(8))
.decay(.1).sustain(0).gain(.14)
.room(.2).delay(.125)

$: note("<[c5,eb5] [bb4,d5] [ab4,c5] [bb4,d5]>/2")
.s("triangle").decay(.3).sustain(.08)
.gain(.09).room(.3)
.pianoroll()`,
  },
  {
    name: "SYNTH",
    code: `// ♫ SYNTHWAVE SUNSET
setcps(.55)

$: s("bd:5 ~ [~ bd:5] ~, ~ cp:4 ~ cp:4").gain(.5)

$: s("[~ oh:2]*2, hh:1*8").gain(.15).pan(rand)

$: note("<e2 e2 a1 b1>")
.s("sawtooth")
.cutoff(sine.range(150,800).slow(8))
.resonance(8).decay(.4).sustain(.15).gain(.2)

$: note("e3 [g3 b3] [e4 d4] b3")
.s("square")
.cutoff(sine.range(400,3000).slow(6))
.decay(.15).sustain(.02).gain(.1)
.delay(.25).room(.3)

$: note("<[e4,g4,b4] [a3,c4,e4]>/2")
.s("triangle").attack(.1).decay(.4).sustain(.2)
.gain(.07).room(.5)
.pianoroll()`,
  },
  {
    name: "BOSS",
    code: `// ♫ BOSS FIGHT
setcps(.75)

$: s("bd:7*2 [~ sd:3] bd:7 sd:3").gain(.6)

$: s("hh:2*8").gain(sine.range(.08,.2).slow(2))

$: s("[~ cp:1]*2").gain(.3).delay(.125)

$: note("<a1 a1 f1 g1>")
.s("sawtooth")
.cutoff(sine.range(100,900).slow(2))
.decay(.15).sustain(.1).gain(.25)

$: note("a3 c4 e4 a4 e4 c4".fast(2))
.s("square")
.cutoff(saw.range(500,4000).slow(4))
.decay(.06).sustain(0).gain(.12).room(.15)

$: note("<a4 c5 f4 g4>*2")
.s("triangle").decay(.08).sustain(0)
.gain(.1).delay(.0625)
.pianoroll()`,
  },
  {
    name: "CHILL",
    code: `// ♫ PIXEL DREAMS
setcps(.4)

$: s("bd:0 ~ ~ bd:0, ~ ~ sd:0 ~").gain(.35)

$: s("[~ hh:3]*2").gain(.1).pan(sine.slow(3))

$: note("<c3 eb3 ab2 bb2>")
.s("triangle")
.cutoff(sine.range(200,600).slow(12))
.attack(.05).decay(.5).sustain(.3)
.gain(.15).room(.6)

$: note("c4 [~ eb4] g4 [~ bb4]".slow(2))
.s("sine").attack(.1).decay(.4).sustain(.1)
.gain(.08).delay(.25).room(.5)

$: note("<[c5,eb5,g5] [ab4,c5,eb5] [bb4,d5,f5]>/3")
.s("triangle").attack(.2).decay(.6).sustain(.15)
.gain(.05).room(.7)
.pianoroll()`,
  },
];

export const musicState = {
  playing: false,
  getEditor: null,
  togglePlay: null,
};

let scriptLoaded = false;

function loadStrudelScript() {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) return resolve();
    const existing = document.querySelector("script[data-strudel-repl]");
    if (existing) {
      scriptLoaded = true;
      return resolve();
    }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@strudel/repl@1.3.0";
    s.dataset.strudelRepl = "";
    s.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function StrudelPlayer() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [panelW, setPanelW] = useState(500);
  const [panelH, setPanelH] = useState(500);
  const containerRef = useRef(null);
  const editorElRef = useRef(null);
  const tabCodesRef = useRef(PRESETS.map((p) => p.code));

  const getEditor = useCallback(() => editorElRef.current?.editor, []);

  const setPlayState = useCallback((val) => {
    setPlaying(val);
    musicState.playing = val;
  }, []);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    if (ready) return;
    setLoading(true);
    try {
      await loadStrudelScript();
      await new Promise((r) => setTimeout(r, 200));

      const el = document.createElement("strudel-editor");
      el.setAttribute("code", tabCodesRef.current[0]);
      editorElRef.current = el;

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(el);
      }

      await new Promise((r) => setTimeout(r, 600));

      // Monkey-patch evaluate/stop to keep our play state in sync
      // when user triggers via keyboard shortcuts (Ctrl+Enter / Ctrl+.)
      const sm = el.editor;
      if (sm) {
        const origEval = sm.evaluate.bind(sm);
        const origStop = sm.stop.bind(sm);
        sm.evaluate = async (...args) => {
          await origEval(...args);
          setPlayState(true);
        };
        sm.stop = (...args) => {
          origStop(...args);
          setPlayState(false);
        };
      }

      setReady(true);
    } catch (e) {
      console.warn("[strudel]", e);
    }
    setLoading(false);
  }, [ready, setPlayState]);

  const handlePlay = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    try {
      if (playing) {
        editor.stop();
      } else {
        editor.evaluate();
      }
    } catch (e) {
      console.warn("[strudel] play error:", e);
    }
  }, [playing, getEditor]);

  const handleEval = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    try {
      editor.evaluate();
    } catch (e) {
      console.warn("[strudel] eval error:", e);
    }
  }, [getEditor]);

  const switchTab = useCallback(
    (idx) => {
      if (idx === activeTab) return;
      const editor = getEditor();
      if (editor) {
        tabCodesRef.current[activeTab] = editor.code;
        editor.setCode(tabCodesRef.current[idx]);
        if (playing) {
          setTimeout(() => {
            try {
              editor.evaluate();
            } catch {}
          }, 80);
        }
      }
      setActiveTab(idx);
    },
    [activeTab, playing, getEditor],
  );

  const startResize = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = panelW;
      const startH = panelH;

      const onMove = (ev) => {
        const maxW = window.innerWidth - 32;
        const maxH = window.innerHeight - 32;
        setPanelW(
          Math.max(360, Math.min(maxW, startW + (startX - ev.clientX))),
        );
        setPanelH(
          Math.max(280, Math.min(maxH, startH + (startY - ev.clientY))),
        );
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [panelW, panelH],
  );

  useEffect(() => {
    musicState.getEditor = getEditor;
    musicState.togglePlay = handlePlay;
  }, [getEditor, handlePlay]);

  useEffect(() => {
    return () => {
      try {
        const sm = editorElRef.current?.editor;
        sm?.stop();
        sm?.clear?.();
      } catch {}
    };
  }, []);

  if (!open) {
    return (
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 40 }}>
        <button
          onClick={handleOpen}
          data-cursor-hover
          style={{
            background: "rgba(8,6,18,.92)",
            border: "1px solid rgba(100,60,200,.3)",
            borderRadius: 10,
            padding: "8px 14px",
            color: "#a78bfa",
            cursor: "pointer",
            fontSize: 15,
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 20px rgba(100,60,200,.1)",
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: ".05em",
            transition: "all .3s",
          }}
        >
          {"\u266B"} STRUDEL
        </button>
      </div>
    );
  }

  return (
    <div
      data-strudel-panel
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 40,
        width: panelW,
        height: panelH,
        fontFamily: "var(--font-mono, monospace)",
        pointerEvents: "auto",
      }}
    >
      {/* Custom resize handle — top-left corner */}
      <div
        onMouseDown={startResize}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          cursor: "nw-resize",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(100,60,200,.4)",
          fontSize: 10,
          userSelect: "none",
        }}
        title="Drag to resize"
      >
        {"\u2922"}
      </div>

      <div
        style={{
          background: "rgba(8,6,18,.97)",
          border: "1px solid rgba(100,60,200,.35)",
          borderRadius: 10,
          backdropFilter: "blur(14px)",
          overflow: "hidden",
          boxShadow:
            "0 0 40px rgba(100,60,200,.12), inset 0 1px 0 rgba(255,255,255,.03)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px 6px 24px",
            borderBottom: "1px solid rgba(100,60,200,.15)",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "#a78bfa",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".12em",
              marginRight: 6,
            }}
          >
            {"\u266B"} STRUDEL
          </span>

          {/* Preset tabs */}
          {ready &&
            PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => switchTab(i)}
                data-cursor-hover
                style={{
                  background:
                    i === activeTab
                      ? "rgba(100,60,200,.25)"
                      : "rgba(100,60,200,.06)",
                  border: `1px solid ${i === activeTab ? "rgba(100,60,200,.5)" : "rgba(100,60,200,.12)"}`,
                  borderRadius: 4,
                  color: i === activeTab ? "#c4b5fd" : "#555",
                  padding: "2px 7px",
                  cursor: "pointer",
                  fontSize: 9,
                  fontFamily: "inherit",
                  fontWeight: i === activeTab ? 700 : 400,
                  letterSpacing: ".06em",
                  transition: "all .2s",
                }}
              >
                {p.name}
              </button>
            ))}

          <div style={{ flex: 1 }} />

          {/* Play / Stop */}
          {ready && (
            <>
              <button
                onClick={handlePlay}
                data-cursor-hover
                style={{
                  background: playing
                    ? "rgba(239,68,68,.15)"
                    : "rgba(34,197,94,.15)",
                  border: `1px solid ${playing ? "rgba(239,68,68,.35)" : "rgba(34,197,94,.35)"}`,
                  borderRadius: 5,
                  color: playing ? "#ef4444" : "#22c55e",
                  padding: "3px 10px",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  transition: "all .2s",
                }}
              >
                {playing ? "\u25A0 STOP" : "\u25B6 PLAY"}
              </button>

              <button
                onClick={handleEval}
                data-cursor-hover
                title="Re-evaluate edited code (Ctrl+Enter)"
                style={{
                  background: "rgba(100,60,200,.12)",
                  border: "1px solid rgba(100,60,200,.25)",
                  borderRadius: 5,
                  color: "#a78bfa",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: "inherit",
                  letterSpacing: ".05em",
                  transition: "all .2s",
                }}
              >
                {"\u27F3"} EVAL
              </button>
            </>
          )}

          <button
            onClick={() => {
              try {
                getEditor()?.stop();
              } catch {}
              setPlayState(false);
              setOpen(false);
            }}
            data-cursor-hover
            style={{
              background: "none",
              border: "none",
              color: "#444",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              padding: "2px 6px",
            }}
          >
            {"\u2715"}
          </button>
        </div>

        {/* Editor area */}
        {loading && (
          <div
            style={{
              padding: 40,
              color: "#555",
              textAlign: "center",
              fontSize: 11,
              letterSpacing: ".1em",
            }}
          >
            loading strudel repl...
          </div>
        )}
        <div
          ref={containerRef}
          data-strudel-container
          style={{
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
            position: "relative",
          }}
        />

        {/* Footer */}
        <div
          style={{
            padding: "3px 10px",
            fontSize: 8,
            color: "#444",
            borderTop: "1px solid rgba(100,60,200,.08)",
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>Ctrl+Enter = eval &bull; Ctrl+. = stop</span>
          <span>drag {"\u2196"} corner to resize</span>
        </div>
      </div>

      {/* Scoped styles for the strudel-editor web component */}
      <style>{`
        [data-strudel-container] {
          display: flex !important;
          flex-direction: column !important;
        }

        [data-strudel-container] > strudel-editor {
          display: none !important;
        }

        [data-strudel-container] > div {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }

        [data-strudel-container] .cm-editor {
          flex: 1 !important;
          font-size: 13px !important;
          background: rgba(8,6,18,.3) !important;
          min-height: 0 !important;
        }

        [data-strudel-container] .cm-scroller {
          overflow: auto !important;
          font-family: var(--font-mono, monospace) !important;
        }

        [data-strudel-container] .cm-gutters {
          background: rgba(8,6,18,.5) !important;
          border-right: 1px solid rgba(100,60,200,.1) !important;
        }

        [data-strudel-container] .cm-activeLine {
          background: rgba(100,60,200,.06) !important;
        }

        [data-strudel-container] .cm-line {
          padding-left: 4px !important;
        }

        /* Pianoroll + scope visualizer canvases */
        [data-strudel-container] canvas {
          width: 100% !important;
          display: block !important;
        }

        /* Strudel highlight flash on eval */
        [data-strudel-container] .cm-strudel-flash {
          background: rgba(100,60,200,.15) !important;
        }

        /* Active note highlighting */
        [data-strudel-container] .cm-strudel-highlight {
          background: rgba(167,139,250,.18) !important;
          border-bottom: 2px solid rgba(167,139,250,.5) !important;
        }
      `}</style>
    </div>
  );
}

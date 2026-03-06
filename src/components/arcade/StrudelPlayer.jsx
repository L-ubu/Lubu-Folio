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
.scope()

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
    name: "PLAY",
    code: `// ♫ PLAYGROUND — experiment here!
// type . for autocomplete suggestions
// drag number sliders to tweak live
//
// visualizers you can add:
//   .pianoroll()  .scope()
//   .spiral()     .spectrum()
//   .punchcard()  .pitchwheel()
//
// synths: sawtooth square triangle sine
// drums:  bd sd hh cp oh cr
// try:    piano bass guitar metal

setcps(.55)

$: s("bd:0 sd:1 [hh:0]*4 ~")
.gain(.45)

$: note("c4 e4 g4 c5")
.s("sawtooth")
.cutoff(1500)
.decay(.2).sustain(0)
.gain(.14).room(.2)
.pianoroll()

$: note("<c3 a2 f2 g2>")
.s("triangle")
.cutoff(400)
.decay(.4).sustain(.1)
.gain(.12)
.scope()`,
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
  const [panelW, setPanelW] = useState(520);
  const [panelH, setPanelH] = useState(580);
  const containerRef = useRef(null);
  const editorElRef = useRef(null);
  const vizContainerRef = useRef(null);
  const vizCanvasRef = useRef(null);
  const tabCodesRef = useRef(PRESETS.map((p) => p.code));

  const getEditor = useCallback(() => editorElRef.current?.editor, []);

  const setPlayState = useCallback((val) => {
    setPlaying(val);
    musicState.playing = val;
  }, []);

  const setupVizCanvas = useCallback(
    (sm) => {
      if (!vizContainerRef.current || !sm) return;

      const canvas = document.createElement("canvas");
      vizCanvasRef.current = canvas;
      canvas.style.cssText = "width:100%;height:100%;display:block";
      vizContainerRef.current.innerHTML = "";
      vizContainerRef.current.appendChild(canvas);

      const updateCanvasSize = () => {
        const rect = vizContainerRef.current?.getBoundingClientRect();
        if (!rect || rect.width < 1 || rect.height < 1) return;
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
      };
      updateCanvasSize();

      const ourCtx = canvas.getContext("2d");
      sm.drawContext = ourCtx;

      const origOnDraw = sm.onDraw.bind(sm);
      sm.onDraw = (haps, time, painters) => {
        if (canvas.width < 1 || canvas.height < 1) return;
        ourCtx.clearRect(0, 0, canvas.width, canvas.height);
        origOnDraw(haps, time, painters);
      };

      const captureGlobalCanvas = () => {
        const gc = document.getElementById("test-canvas");
        if (!gc || !vizContainerRef.current) return false;
        if (gc.parentElement === vizContainerRef.current) return true;
        gc.style.position = "absolute";
        gc.style.top = "0";
        gc.style.left = "0";
        gc.style.width = "100%";
        gc.style.height = "100%";
        gc.style.zIndex = "1";
        gc.width = canvas.width;
        gc.height = canvas.height;
        vizContainerRef.current.appendChild(gc);
        return true;
      };

      if (!captureGlobalCanvas()) {
        const obs = new MutationObserver(() => {
          if (captureGlobalCanvas()) obs.disconnect();
        });
        obs.observe(document.body, { childList: true, subtree: true });
      }

      return updateCanvasSize;
    },
    [],
  );

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

      await new Promise((r) => setTimeout(r, 700));

      const sm = el.editor;
      if (sm) {
        sm.reconfigureExtension("isAutoCompletionEnabled", true);
        sm.reconfigureExtension("isTooltipEnabled", true);
        sm.reconfigureExtension("isBracketMatchingEnabled", true);
        sm.reconfigureExtension("isLineWrappingEnabled", true);
        sm.setFontSize(13);

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

  // Set up the viz canvas AFTER ready=true so the container has its full height
  useEffect(() => {
    if (!ready) return;
    const sm = getEditor();
    if (!sm) return;

    const timer = setTimeout(() => {
      setupVizCanvas(sm);
    }, 150);

    return () => clearTimeout(timer);
  }, [ready, getEditor, setupVizCanvas]);

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
          Math.max(380, Math.min(maxW, startW + (startX - ev.clientX))),
        );
        setPanelH(
          Math.max(320, Math.min(maxH, startH + (startY - ev.clientY))),
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

  // Resize viz canvases when panel dimensions change
  useEffect(() => {
    const container = vizContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = window.devicePixelRatio;

    const ownCanvas = vizCanvasRef.current;
    if (ownCanvas) {
      ownCanvas.width = rect.width * dpr;
      ownCanvas.height = rect.height * dpr;
    }

    const gc = document.getElementById("test-canvas");
    if (gc && gc.parentElement === container) {
      gc.width = rect.width * dpr;
      gc.height = rect.height * dpr;
    }
  }, [panelW, panelH]);

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
      const gc = document.getElementById("test-canvas");
      if (gc) gc.style.display = "none";
    };
  }, []);

  // Panel is always rendered but hidden via opacity+pointerEvents when closed.
  // This keeps the editor alive in the DOM (no re-init on reopen).
  return (
    <>
      {/* Collapsed button */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 40,
          display: open ? "none" : "block",
        }}
      >
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

      {/* Panel — always in DOM, visibility toggled */}
      <div
        data-strudel-panel
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: open ? 40 : -1,
          width: panelW,
          height: panelH,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .15s",
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        {/* Custom resize handle — top-left corner */}
        <div
          onMouseDown={startResize}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 22,
            height: 22,
            cursor: "nw-resize",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(100,60,200,.45)",
            fontSize: 11,
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
              overflow: "auto",
              minHeight: 0,
              position: "relative",
            }}
          />

          {/* Visualization canvas (draws pianoroll/scope when not inline) */}
          <div
            ref={vizContainerRef}
            style={{
              flexShrink: 0,
              position: "relative",
              height: ready ? 140 : 0,
              borderTop: ready
                ? "1px solid rgba(100,60,200,.12)"
                : "none",
              background: "rgba(0,0,0,.3)",
              overflow: "hidden",
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
            <span>
              Ctrl+Enter = eval &bull; Ctrl+. = stop &bull; type{" "}
              <b style={{ color: "#666" }}>.</b> for autocomplete
            </span>
            <span>drag {"\u2196"} to resize</span>
          </div>
        </div>

        <style>{`
          /* ── Container layout ── */
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

          /* ── CodeMirror editor ── */
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

          /* ── Inline widget containers (pianoroll, scope, spiral, etc.) ── */
          [data-strudel-container] .cm-widget-container {
            display: block !important;
            width: 100% !important;
            margin: 4px 0 !important;
            overflow: visible !important;
            line-height: 0 !important;
          }
          [data-strudel-container] .cm-widget-container canvas {
            display: block !important;
            max-width: 100% !important;
            border-radius: 3px !important;
            background: rgba(0,0,0,.25) !important;
          }
          [data-strudel-container] .cm-widget-placeholder {
            display: none !important;
          }

          /* ── Slider widgets ── */
          [data-strudel-container] .cm-slider-widget,
          [data-strudel-container] .cm-number-slider {
            display: inline-flex !important;
            align-items: center !important;
          }
          [data-strudel-container] input[type="range"] {
            accent-color: #a78bfa !important;
            cursor: pointer !important;
            height: 14px !important;
          }

          /* ── Autocomplete popup ── */
          .cm-tooltip-autocomplete {
            background: rgba(12,8,24,.97) !important;
            border: 1px solid rgba(100,60,200,.35) !important;
            border-radius: 6px !important;
            box-shadow: 0 4px 24px rgba(0,0,0,.6) !important;
            font-family: var(--font-mono, monospace) !important;
            font-size: 12px !important;
            max-height: 200px !important;
            overflow-y: auto !important;
          }
          .cm-tooltip-autocomplete ul {
            padding: 2px !important;
          }
          .cm-tooltip-autocomplete li {
            padding: 3px 8px !important;
            color: #b8b0d0 !important;
            border-radius: 3px !important;
          }
          .cm-tooltip-autocomplete li[aria-selected] {
            background: rgba(100,60,200,.3) !important;
            color: #e0d8f8 !important;
          }
          .cm-completionLabel {
            color: #c4b5fd !important;
          }
          .cm-completionDetail {
            color: #666 !important;
            font-style: italic !important;
          }

          /* ── Tooltips ── */
          .cm-tooltip {
            background: rgba(12,8,24,.97) !important;
            border: 1px solid rgba(100,60,200,.3) !important;
            border-radius: 5px !important;
            color: #b8b0d0 !important;
            font-size: 11px !important;
            font-family: var(--font-mono, monospace) !important;
            padding: 4px 8px !important;
            box-shadow: 0 2px 12px rgba(0,0,0,.5) !important;
          }

          /* ── Highlight flash on eval ── */
          [data-strudel-container] .cm-strudel-flash {
            background: rgba(100,60,200,.15) !important;
          }

          /* ── Active note highlighting ── */
          [data-strudel-container] .cm-strudel-highlight,
          [data-strudel-container] .cm-highlight {
            background: rgba(167,139,250,.18) !important;
            border-bottom: 2px solid rgba(167,139,250,.5) !important;
          }

          /* ── Bracket matching ── */
          [data-strudel-container] .cm-matchingBracket {
            background: rgba(100,60,200,.2) !important;
            color: #e0d8f8 !important;
            outline: 1px solid rgba(100,60,200,.4) !important;
          }
        `}</style>
      </div>
    </>
  );
}

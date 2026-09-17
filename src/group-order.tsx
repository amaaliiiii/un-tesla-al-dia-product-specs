import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Eye, EyeOff, Menu, X } from "lucide-react";
import "./group-order.css";
import { FIGMA_FILE, FLOWS, type GroupOrderFlow, type GroupOrderScreen } from "./group-order-data";
import { resolveGoScreen } from "./go-map";
import { renderGoScreen } from "./go-screens";

const KEY = "PremioDiario2026MX";
const STORE = "tesla-spec-access";

function AccessGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem(STORE) === KEY; } catch { return false; }
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (ok) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() !== KEY) { setError(true); return; }
    try { sessionStorage.setItem(STORE, KEY); } catch { /* sesión privada */ }
    setOk(true);
  };

  return <div className="gate">
    <form className="gate-card" onSubmit={submit}>
      <b>Group Order ID</b>
      <span>INI-11230 · Figma 2nd review, pantalla por pantalla</span>
      <input
        type="password"
        autoFocus
        placeholder="Clave de acceso"
        value={value}
        onChange={e => { setValue(e.target.value); setError(false); }}
        aria-label="Clave de acceso"
      />
      {error && <em>Clave incorrecta</em>}
      <button type="submit">Entrar</button>
    </form>
  </div>;
}

function figmaUrl(nodeId: string) {
  return `https://www.figma.com/design/${FIGMA_FILE}/Group-Order-ID?node-id=${nodeId.replace(":", "-")}&m=dev`;
}

function parseHash(): { flow: number; step: number } {
  const id = location.hash.replace(/^#/, "");
  const m = id.match(/^(flujo-(\d+))(?:\/(\d+))?$/);
  if (!m) return { flow: 0, step: 0 };
  const fi = FLOWS.findIndex(f => f.id === m[1] || f.figma === Number(m[2]));
  if (fi < 0) return { flow: 0, step: 0 };
  const n = m[3] ? Number(m[3]) : 1;
  const si = FLOWS[fi].screens.findIndex(s => s.n === n);
  return { flow: fi, step: si >= 0 ? si : 0 };
}

function writeHash(flow: GroupOrderFlow, screen: GroupOrderScreen) {
  const next = `#${flow.id}/${screen.n}`;
  if (location.hash !== next) history.replaceState(null, "", next);
}

function App() {
  const initial = parseHash();
  const [flowIndex, setFlowIndex] = useState(initial.flow);
  const [stepIndex, setStepIndex] = useState(initial.step);
  const [hotspots, setHotspots] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  const flow = FLOWS[flowIndex];
  const step = flow.screens[stepIndex];
  const resolved = useMemo(() => resolveGoScreen(flow, step), [flow, step]);

  useEffect(() => {
    const apply = () => {
      const { flow: f, step: s } = parseHash();
      setFlowIndex(f);
      setStepIndex(s);
    };
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    writeHash(flow, step);
  }, [flow, step]);

  const chooseFlow = (i: number) => {
    setFlowIndex(i);
    setStepIndex(0);
    setMobileMenu(false);
  };
  const jumpTo = (i: number) => setStepIndex(i);
  const next = () => setStepIndex(i => (i < flow.screens.length - 1 ? i + 1 : 0));
  const prev = () => setStepIndex(i => Math.max(0, i - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progress = useMemo(() => ((stepIndex + 1) / flow.screens.length) * 100, [flow, stepIndex]);
  const stageKicker = `FLUJO ${String(flow.figma).padStart(2, "0")}`;

  return <main className={hotspots ? "show-hotspots" : ""}>
    <header className="workspace-header">
      <div className="brand">
        <div>
          <b>Group Order ID</b>
          <span>INI-11230 · pantallas reconstruidas en HTML, como Tesla</span>
        </div>
      </div>
      <div className="header-actions">
        <button type="button" onClick={() => setHotspots(!hotspots)}>
          {hotspots ? <Eye size={17} /> : <EyeOff size={17} />}
          {hotspots ? "Zonas activas" : "Mostrar zonas"}
        </button>
        <button className="mobile-flow-menu" type="button" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button>
      </div>
    </header>

    <div className="workspace">
      <aside className={mobileMenu ? "open" : ""}>
        <div className="aside-title"><span>PRODUCT SPECS</span><button type="button" onClick={() => setMobileMenu(false)}><X /></button></div>
        <div className="menu-sec is-open">
          <button type="button" className="menu-sec-h" onClick={() => undefined}>
            <span>Flujos</span>
          </button>
          <div className="menu-sec-body">
            <p className="menu-hint">Figma 2nd review, en el orden del archivo</p>
            <nav>{FLOWS.map((f, i) =>
              <button type="button" className={i === flowIndex ? "active" : ""} key={f.id} onClick={() => chooseFlow(i)}>
                <span><b>{f.label}</b><small>{f.screens.length} pantallas</small></span>
                <ChevronRight />
              </button>)}
            </nav>
          </div>
        </div>
      </aside>

      <section className="stage">
        <div className="stage-heading">
          <div>
            <span>{stageKicker}</span>
            <h1>{flow.label}</h1>
            <p>{flow.description}</p>
          </div>
          <div className="step-count">
            <b>{String(step.n).padStart(2, "0")}</b>
            <span>/ {String(flow.screens.length).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="demo-area">
          <div className="step-dots">{flow.screens.map((s, i) =>
            <button
              key={s.nodeId}
              type="button"
              className={i === stepIndex ? "active" : i < stepIndex ? "done" : ""}
              onClick={() => jumpTo(i)}
            >
              <i>{i < stepIndex ? <Check /> : s.n}</i>
              <span><b>{s.figmaName}</b>{s.title}</span>
            </button>)}
          </div>

          <div className="phone-slot">
            <div className="phone-shell">
              <div className="phone-buttons" />
              <div className="phone-screen">
                {renderGoScreen(resolved, next)}
              </div>
              <div className="home-indicator" />
            </div>
          </div>

          <div className="explanation">
            <div className="explanation-top">
              <span>PANTALLA ACTUAL</span>
              <b>{resolved.panelTitle}</b>
            </div>
            <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            {resolved.hotspots.length
              ? <ol className="action-list">{resolved.hotspots.map((h, i) =>
                  <li className="action-item" key={h.label}><span className="num">{i + 1}</span><div><b>{h.label}</b><small>{h.desc}</small></div></li>)}
                </ol>
              : <div className="action-card">
                  <div className="tap-icon"><span>●</span></div>
                  <div>
                    <b>{step.figmaName}</b>
                    <p>{resolved.note} Corte de diseño: no hay zonas activas de app.</p>
                  </div>
                </div>}
            <p className="figma-meta">
              {step.width}×{step.height} · {step.nodeId} · HTML
              {" · "}
              <a href={figmaUrl(step.nodeId)} target="_blank" rel="noreferrer">Abrir en Figma</a>
            </p>
            {resolved.kind !== "cover" && <p className="spec-note">{resolved.note}</p>}
            <p className="spec-note">Tabs = flujos de la sección 2nd review. Multi-formato no tiene frame en este archivo, así que no hay tab.</p>
            <p className="disclaimer">Lo que no está marcado en morado, es solo informativo.</p>
            <div className="nav-buttons">
              <button type="button" onClick={prev} disabled={stepIndex === 0}><ArrowLeft />Anterior</button>
              <button type="button" onClick={next}>{stepIndex === flow.screens.length - 1 ? "Reiniciar flujo" : "Siguiente"}<ArrowRight /></button>
            </div>
            <small className="hint">También puedes usar ← → en el teclado</small>
          </div>
        </div>
      </section>
    </div>
  </main>;
}

createRoot(document.getElementById("root")!).render(<AccessGate><App /></AccessGate>);

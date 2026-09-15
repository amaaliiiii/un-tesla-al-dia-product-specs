import { useState } from "react";

const KEY = "PremioDiario2026MX";
const STORE = "tesla-spec-access";

export function AccessGate({ children }: { children: React.ReactNode }) {
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
      <b>Un Tesla al día</b>
      <span>Flows por product specs. Interactions and placements visual</span>
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

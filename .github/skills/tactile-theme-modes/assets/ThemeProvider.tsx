import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeChoice = "system" | "light" | "dark";
type ThemeCtx = { choice: ThemeChoice; resolved: "light" | "dark"; setChoice: (c: ThemeChoice) => void };

const KEY = "theme";
const Ctx = createContext<ThemeCtx | null>(null);
const mq = () => window.matchMedia("(prefers-color-scheme: dark)");

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  // Switch without animating every shadow and color from the old mode to the new one.
  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(freeze);

  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);

  // Keep browser UI (mobile address bar) matched to the active ground color.
  const bg = getComputedStyle(root).getPropertyValue("--color-bg-base").trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute("content", bg);
    if (choice !== "system") m.removeAttribute("media");
  });

  void getComputedStyle(document.body).opacity; // flush styles, then re-enable transitions
  setTimeout(() => freeze.remove(), 0);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(readChoice);
  const [systemDark, setSystemDark] = useState(() => mq().matches);

  useEffect(() => {
    const m = mq();
    const on = () => setSystemDark(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  useEffect(() => applyTheme(choice), [choice, systemDark]);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    try {
      if (c === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, c);
    } catch {}
  }, []);

  const resolved = choice === "system" ? (systemDark ? "dark" : "light") : choice;
  const value = useMemo(() => ({ choice, resolved, setChoice }), [choice, resolved, setChoice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside <ThemeProvider>");
  return v;
}

/** Charts, canvas, and anything that needs a literal color: read tokens, re-read when `resolved` changes. */
export function useToken(name: string) {
  const { resolved } = useTheme();
  return useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    [name, resolved]
  );
}

/** Three-way switch: system / light / dark. Uses tactile surfaces. */
export function ThemeToggle() {
  const { choice, setChoice } = useTheme();
  const opts: ThemeChoice[] = ["system", "light", "dark"];
  return (
    <div role="group" aria-label="Color theme" className="tactile-sunken" style={{ display: "inline-flex", padding: 6, gap: 4 }}>
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={choice === o}
          onClick={() => setChoice(o)}
          className={choice === o ? "tactile-raised tactile-button sm" : "tactile-button"}
          style={{ minHeight: 44, textTransform: "capitalize", background: "transparent",
            color: choice === o ? "var(--color-accent-warm-text)" : "var(--color-text-secondary)" }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

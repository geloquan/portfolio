#!/usr/bin/env python3
"""Verify light/dark theme tokens and scan a React project for mode-specific color bugs.

  python theme_check.py contrast theme.css [more.css ...] [--suggest]
      Parse tokens per mode, check WCAG contrast for the key pairs, and check that the two
      dark definitions (prefers-color-scheme and [data-theme="dark"]) are identical.

  python theme_check.py scan <project-root> [--json out.json]
      Find hardcoded colors, per-component mode logic, Tailwind dark: variants, missing
      color-scheme / theme-color / pre-paint script, duplicate token sources, token gaps.

Exit code 1 when any error exists. Suppress a deliberate exception with a comment
containing `theme-ignore: reason` on the same line or the line above.
"""
import argparse, colorsys, json, os, re, sys
from pathlib import Path

SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "coverage", "vendor", "__pycache__", ".venv", ".cache"}
SCAN_EXTS = {".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".ts", ".js", ".html"}
SKIP_NAME_PARTS = (".test.", ".spec.", ".d.ts", ".min.")
HEX = re.compile(r"(?<![\w.&/\-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])")
RGB = re.compile(r"rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?))?\s*\)")
HSL = re.compile(r"hsla?\(")
NAMED = re.compile(r"(?i)(?:color|background(?:-color)?|backgroundColor|border(?:-color)?|borderColor|fill|stroke)\s*:\s*['\"]?(black|white)(?![\w-])")
TW_FIXED = re.compile(r"(?<![\w:-])(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline)-"
                      r"(?:(?:black|white)|(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?![\w-])")
TW_DARK = re.compile(r"(?<![\w-])dark:[\w\[\]#:/.-]+")
MEDIA_USE = re.compile(r"prefers-color-scheme")
INVERT = re.compile(r"filter\s*:\s*[^;]*invert\(|invert\s*:\s*['\"]?\d")

findings = []


def add(rule, sev, file, line, msg, snippet=""):
  findings.append({"rule": rule, "severity": sev, "file": file, "line": line,
                   "message": msg, "snippet": snippet.strip()[:140]})


# ---------------------------------------------------------------- color math
def parse_hex(h):
  h = h.strip().lstrip("#").lower()
  if len(h) in (3, 4):
    h = "".join(c * 2 for c in h)
  return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lin(c):
  c /= 255
  return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(rgb):
  r, g, b = (lin(c) for c in rgb)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
  la, lb = sorted((lum(parse_hex(a)), lum(parse_hex(b))), reverse=True)
  return (la + 0.05) / (lb + 0.05)


def suggest(fg, bgs, target):
  r, g, b = (c / 255 for c in parse_hex(fg))
  h, l, s = colorsys.rgb_to_hls(r, g, b)
  bg_lum = sum(lum(parse_hex(x)) for x in bgs) / len(bgs)
  direction = -1 if lum(parse_hex(fg)) < bg_lum else 1  # darker text on light bg, lighter on dark bg
  for _ in range(200):
    l = min(1, max(0, l + direction * 0.005))
    rr, gg, bb = colorsys.hls_to_rgb(h, l, s)
    cand = "#%02x%02x%02x" % (round(rr * 255), round(gg * 255), round(bb * 255))
    if all(ratio(cand, x) >= target + 0.1 for x in bgs):
      return cand
  return None


# ---------------------------------------------------------------- token parsing
def strip_comments(t):
  return re.sub(r"/\*.*?\*/", "", t, flags=re.S)


def classify(stack):
  joined = " ".join(stack)
  m = re.search(r"prefers-color-scheme\s*:\s*(dark|light)", joined)
  if m:
    return "media-" + m.group(1)
  if any(s.startswith("@") for s in stack):
    return "other"
  sel = re.sub(r":not\([^)]*\)", "", stack[-1]) if stack else ""
  m = re.search(r"\[data-theme=[\"']?(dark|light)[\"']?\]|(?:^|[\s:])\.(dark|light)\b", sel)
  if m:
    return "attr-" + (m.group(1) or m.group(2))
  if re.search(r":root|\bhtml\b|\bbody\b", sel):
    return "base"
  return "other"


def parse_tokens(text):
  out = {k: {} for k in ("base", "media-light", "media-dark", "attr-light", "attr-dark")}
  stack, buf = [], ""

  def handle(decl):
    m = re.match(r"(--[\w-]+)\s*:\s*(.+)$", decl.strip(), re.S)
    if m and stack:
      src = classify(stack)
      if src in out:
        out[src][m.group(1)] = m.group(2).strip()

  for ch in strip_comments(text):
    if ch == "{":
      stack.append(buf.strip())
      buf = ""
    elif ch == "}":
      if buf.strip():
        handle(buf)
      if stack:
        stack.pop()
      buf = ""
    elif ch == ";":
      handle(buf)
      buf = ""
    else:
      buf += ch
  return out


def is_color(v):
  return bool(re.match(r"^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()", v.strip()))


def resolve(name, tokens, depth=0):
  v = tokens.get(name)
  if v is None or depth > 6:
    return None
  m = re.match(r"^var\((--[\w-]+)\)$", v.strip())
  if m:
    return resolve(m.group(1), tokens, depth + 1)
  return v.strip() if re.match(r"^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$", v.strip()) else None


# ---------------------------------------------------------------- contrast subcommand
PAIRS = [
  # (fg token, [bg tokens], required minimum, advisory minimum, note)
  ("--color-text-primary", ["--color-bg-base", "--color-bg-surface"], 4.5, None, "body text"),
  ("--color-text-secondary", ["--color-bg-base", "--color-bg-surface"], 4.5, None, "small secondary text"),
  ("--color-text-muted", ["--color-bg-base", "--color-bg-surface"], 3.0, 4.5, "decorative, disabled, or large text only"),
  ("--color-accent-warm", ["--color-bg-base", "--color-bg-surface"], 3.0, 4.5, "icons, large text, focus ring, fills"),
  ("--color-accent-warm-text", ["--color-bg-base", "--color-bg-surface"], 4.5, None, "brass small text"),
  ("--color-focus-ring", ["--color-bg-base", "--color-bg-surface"], 3.0, None, "focus indicator"),
  ("--color-on-accent", ["--color-accent-warm"], 4.5, None, "label on brass fill"),
  ("--color-on-earth", ["--color-accent-earth"], 4.5, None, "label on moss fill"),
  ("--color-danger", ["--color-bg-base", "--color-bg-surface"], 4.5, None, "error text"),
  ("--color-success", ["--color-bg-base", "--color-bg-surface"], 4.5, None, "success text"),
]


def run_contrast(files, want_suggest):
  text = "\n".join(Path(f).read_text(encoding="utf-8", errors="ignore") for f in files)
  src = parse_tokens(text)
  if not any(src.values()):
    print("No custom properties found.")
    return 1
  light = {**src["base"], **src["media-light"], **src["attr-light"]}
  dark = {**src["base"], **src["media-dark"], **src["attr-dark"]}
  errors = 0

  # token completeness
  base_color = {k for k, v in src["base"].items() if is_color(v)}
  dark_explicit = set(src["media-dark"]) | set(src["attr-dark"])
  light_explicit = set(src["media-light"]) | set(src["attr-light"])
  if dark_explicit:
    for k in sorted(light_explicit - dark_explicit - set(src["base"])):
      print(f"ERROR  {k} has a light value but no dark value")
      errors += 1
    for k in sorted(dark_explicit - light_explicit - set(src["base"])):
      print(f"ERROR  {k} has a dark value but no light value")
      errors += 1
    for k in sorted(base_color - dark_explicit):
      print(f"WARN   {k} is the same in both modes; confirm that is intentional")

  # drift between the two dark definitions
  md, ad = src["media-dark"], src["attr-dark"]
  if md and ad:
    for k in sorted(set(md) | set(ad)):
      if md.get(k) != ad.get(k):
        print(f"ERROR  dark drift: {k} is {md.get(k)!r} in prefers-color-scheme but {ad.get(k)!r} in [data-theme=\"dark\"]")
        errors += 1
  ml, al = src["media-light"], src["attr-light"]
  if ml and al:
    for k in sorted(set(ml) | set(al)):
      if ml.get(k) != al.get(k):
        print(f"ERROR  light drift: {k} differs between prefers-color-scheme and [data-theme=\"light\"]")
        errors += 1

  for mode, toks in (("LIGHT", light), ("DARK", dark)):
    print(f"\n{mode}")
    print(f"  {'pair':58} {'ratio':>6}  result")
    for fg, bgs, req, adv, note in PAIRS:
      fv = resolve(fg, toks)
      if fv is None:
        if fg in ("--color-text-primary", "--color-accent-warm"):
          print(f"  {fg:58} missing -> ERROR")
          errors += 1
        continue
      worst = None
      for bg in bgs:
        bv = resolve(bg, toks)
        if bv is None:
          continue
        r = ratio(fv, bv)
        worst = r if worst is None else min(worst, r)
        label = f"{fg} on {bg.replace('--color-', '')}"
        status = "ok"
        if r < req:
          status, errors = f"FAIL (needs {req}) [{note}]", errors + 1
        elif adv and r < adv:
          status = f"ok for {note} (below {adv} for small text)"
        print(f"  {label:58} {r:6.2f}  {status}")
      if want_suggest and worst is not None and worst < (adv or req):
        tgt = req if worst < req else adv
        s = suggest(fv, [resolve(b, toks) for b in bgs if resolve(b, toks)], tgt)
        if s:
          print(f"      suggestion: {fg}: {s}  (reaches {tgt}:1 on all backgrounds)")
    surf = resolve("--color-bg-surface", toks)
    for tok in ("--shadow-light-source", "--shadow-dark-sink"):
      v = resolve(tok, toks)
      if v and surf:
        r = ratio(v, surf)
        status = "ok"
        if r < 1.08:
          status = "WARN depth nearly invisible"
        elif r > 4:
          status = "WARN harsh, will look dirty"
        print(f"  {tok + ' vs surface':58} {r:6.2f}  {status}")
    for name in ("--color-accent-earth",):
      v, b = resolve(name, toks), resolve("--color-bg-base", toks)
      if v and b:
        r = ratio(v, b)
        print(f"  {name + ' on base':58} {r:6.2f}  {'ok' if r >= 3 else 'decorative only (fills, rules); never text or required UI'}")

  print("\n" + ("PASS" if not errors else f"{errors} error(s)"))
  return 1 if errors else 0


# ---------------------------------------------------------------- scan subcommand
def walk(root):
  for dp, dn, fn in os.walk(root):
    dn[:] = [d for d in dn if d not in SKIP_DIRS]
    for f in fn:
      p = Path(dp) / f
      if p.suffix.lower() in SCAN_EXTS and not any(x in f for x in SKIP_NAME_PARTS):
        try:
          if p.stat().st_size < 1_000_000:
            yield p
        except OSError:
          pass


def ignored(lines, ln):
  return any(0 <= i < len(lines) and "theme-ignore" in lines[i] for i in (ln - 1, ln - 2))


def run_scan(root, json_out):
  root = Path(root).resolve()
  files = {p: p.read_text(encoding="utf-8", errors="ignore") for p in walk(root)}
  token_files = [p for p, t in files.items() if re.search(r"--color-bg-base\s*:", t)]
  rel = lambda p: str(p.relative_to(root))

  if not token_files:
    add("TOKENS_MISSING", "error", "(project)", 0, "No file defines --color-bg-base. Install theme.css and import it once.")
  elif len(token_files) > 1:
    add("DUPLICATE_TOKEN_SOURCE", "error", "(project)", 0,
        "Color tokens are defined in several files (" + ", ".join(rel(p) for p in token_files) +
        "). Keep one source (theme.css) and delete the color tokens from the others, or modes will diverge.")
  theme_text = "\n".join(files[p] for p in token_files)
  if theme_text:
    if "color-scheme" not in strip_comments(theme_text):
      add("NO_COLOR_SCHEME", "error", rel(token_files[0]), 0,
          "No `color-scheme` declaration. Native controls, scrollbars, and form fields will stay light in dark mode.")
    src = parse_tokens(theme_text)
    if not (src["media-dark"] or src["attr-dark"]):
      add("NO_DARK_MODE", "error", rel(token_files[0]), 0, "No dark-mode token values found.")
    if not (src["media-light"] or src["attr-light"] or src["base"]):
      add("NO_LIGHT_MODE", "error", rel(token_files[0]), 0, "No light-mode token values found.")

  uses_manual = False
  for p, text in files.items():
    if p in token_files or p.name.startswith("ThemeProvider"):
      if re.search(r"data-theme|dataset\.theme", text):
        uses_manual = True
      continue
    lines = text.split("\n")
    r = rel(p)
    for ln, line in enumerate(lines, 1):
      if ignored(lines, ln):
        continue
      if re.search(r"""setAttribute\(\s*['"]data-theme|dataset\.theme""", line):
        uses_manual = True
      stripped = line.strip()
      if stripped.startswith(("//", "*", "/*")) and "color" not in stripped.lower()[:0]:
        pass
      for m in RGB.finditer(line):
        rr, gg, bb, a = m.groups()
        rgb = (int(rr), int(gg), int(bb))
        if rgb in ((0, 0, 0), (255, 255, 255)):
          add("TRANSLUCENT_BLACK_WHITE", "warning", r, ln,
              "rgba black/white is fixed across modes: too heavy in light, invisible in dark. Derive overlays with "
              "color-mix(in srgb, var(--color-bg-base) 70%, transparent) and shadows from the shadow tokens.", line)
        else:
          add("HARDCODED_COLOR", "warning", r, ln, "Hardcoded rgb() color is right in at most one mode. Use a token.", line)
      for m in HEX.finditer(line):
        if "href=" in line:
          continue
        h = m.group(0).lower()
        h6 = h if len(h) in (7, 9) else "#" + "".join(c * 2 for c in h[1:])
        if h6[:7] in ("#000000", "#ffffff"):
          add("HARDCODED_COLOR", "error", r, ln, f"{m.group(0)} is pure black/white and cannot be correct in both modes. Use a token.", line)
        else:
          add("HARDCODED_COLOR", "warning", r, ln, f"{m.group(0)} is correct in at most one mode. Use a token (or a per-mode asset).", line)
      if HSL.search(line):
        add("HARDCODED_COLOR", "warning", r, ln, "Hardcoded hsl() color. Use a token.", line)
      for m in NAMED.finditer(line):
        add("HARDCODED_COLOR", "error", r, ln, f"Named color '{m.group(1)}' is mode-specific. Use a token.", line)
      for m in TW_FIXED.finditer(line):
        add("FIXED_TAILWIND_COLOR", "warning", r, ln,
            f"Tailwind {m.group(0)} is the same in both modes. Map tokens in the Tailwind theme (bg-surface, text-ink) instead.", line)
      for m in TW_DARK.finditer(line):
        add("TAILWIND_DARK_VARIANT", "warning", r, ln,
            f"{m.group(0)}: per-class dark overrides drift from the palette. Use token-backed classes and let the variables switch.", line)
      if MEDIA_USE.search(line) and "matchMedia" not in line:
        add("PER_COMPONENT_MODE_LOGIC", "warning", r, ln,
            "prefers-color-scheme used outside the token file. Mode logic belongs in the tokens; components stay mode-agnostic.", line)
      if "matchMedia" in line and MEDIA_USE.search(line):
        add("PER_COMPONENT_MODE_LOGIC", "info", r, ln,
            "Component reads the color scheme in JS. Use the useTheme hook (or tokens) so there is one source of truth.", line)
      if INVERT.search(line):
        add("INVERT_FILTER", "warning", r, ln, "filter: invert() produces off-palette colors. Use tokens or separate light/dark assets.", line)

  if uses_manual:
    idx = [p for p in files if p.name == "index.html"]
    if idx and not any(re.search(r"localStorage|data-theme", files[p]) for p in idx):
      add("NO_PREPAINT_SCRIPT", "warning", rel(idx[0]), 0,
          "Theme is switched with data-theme but index.html has no pre-paint script: users will see a flash of the wrong theme. See assets/theme-init.html.")
  idx = [p for p in files if p.name == "index.html"]
  if idx and not any("theme-color" in files[p] for p in idx):
    add("NO_THEME_COLOR_META", "warning", rel(idx[0]), 0,
        'No <meta name="theme-color">. Mobile browser chrome will not match the page in either mode.')
  if idx and not any(re.search(r'name=["\']color-scheme["\']', files[p]) for p in idx):
    add("NO_COLOR_SCHEME_META", "info", rel(idx[0]), 0,
        'Add <meta name="color-scheme" content="light dark"> so the first paint uses the right canvas.')

  order = {"error": 0, "warning": 1, "info": 2}
  findings.sort(key=lambda f: (order[f["severity"]], f["rule"], f["file"], f["line"]))
  counts = {s: sum(1 for f in findings if f["severity"] == s) for s in order}
  print(f"Theme scan: {len(files)} files under {root}")
  print(f"errors={counts['error']} warnings={counts['warning']} info={counts['info']}\n")
  cur = None
  for f in findings:
    if f["severity"] != cur:
      cur = f["severity"]
      print(f"== {cur.upper()} ==")
    loc = f["file"] if not f["line"] else f"{f['file']}:{f['line']}"
    print(f"[{f['rule']}] {loc}\n    {f['message']}" + (f"\n    > {f['snippet']}" if f["snippet"] else ""))
  print("\nNot checkable by script: look at every screen in both modes, in every state"
        " (hover, focus, pressed, disabled, error), plus images, charts, and embeds.")
  if json_out:
    Path(json_out).write_text(json.dumps({"counts": counts, "findings": findings}, indent=2))
  return 1 if counts["error"] else 0


def main():
  ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
  sub = ap.add_subparsers(dest="cmd", required=True)
  c = sub.add_parser("contrast")
  c.add_argument("files", nargs="+")
  c.add_argument("--suggest", action="store_true")
  s = sub.add_parser("scan")
  s.add_argument("root", nargs="?", default=".")
  s.add_argument("--json")
  a = ap.parse_args()
  return run_contrast(a.files, a.suggest) if a.cmd == "contrast" else run_scan(a.root, a.json)


if __name__ == "__main__":
  sys.exit(main())

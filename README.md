# MetricCard — Solution

Reference implementation for the MetricCard exercise.
This document explains every decision made: architecture, patterns, and tradeoffs.

---

## Running it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. All four widget modes are rendered side by side.

---

## File map

```
src/
  App.jsx                          — renders all modes, manages socket lifecycle
  utils/
    formatValue.js                 — value formatting (number / percent / abbreviated)
    createMockSocket.js            — fake EventSource, random 1–4s intervals
  components/
    MetricCard/
      index.jsx                    — Part 1: the static card
      styles.css                   — Part 1: card styles
    DataWidget/
      index.jsx                    — Part 2: mode-aware wrapper
      styles.css                   — Part 2: skeleton + live styles
```

---

## Part 1 — MetricCard

### Component structure

`MetricCard` is a pure presentational component. It receives data, renders markup.
No internal state, no side effects.

```
MetricCard
  ├── header row
  │     ├── label (+ optional icon)
  │     └── StatusPill
  ├── body row
  │     ├── formatted value
  │     └── TrendBadge
  └── Sparkline (SVG)
```

### Sparkline

The sparkline is a hand-drawn `<polyline>` inside an `<svg>`. No library.

The core math — normalize each data point to fit the SVG's height:

```js
const min = Math.min(...data)
const max = Math.max(...data)
const range = max - min || 1   // guard against flat lines (all same value)

const points = data.map((v, i) => {
  const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
  const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
  return `${x},${y}`
}).join(' ')
```

`PAD` keeps the stroke from clipping at the SVG boundary.
`strokeLinejoin="round"` and `strokeLinecap="round"` smooth the corners.
The stroke color matches the card's `status` color so the line is always contextually meaningful.

### Status colors via CSS custom property

The status pill uses a single CSS class and a `--status-color` custom property
set inline. This avoids three separate modifier classes:

```jsx
<span className="metric-card__status-pill" style={{ '--status-color': color }}>
```

```css
.metric-card__status-pill {
  color: var(--status-color);
  background-color: color-mix(in srgb, var(--status-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--status-color) 28%, transparent);
}
```

`color-mix` derives the tinted background and border from the same color token.
No separate rgba values to keep in sync per status.

### formatValue

Three cases: `number` (toLocaleString), `percent` (toFixed(1) + %), `abbreviated` (K/M suffix).

```js
export const formatValue = (value, unit = 'number') => {
  if (unit === 'percent')     return `${value.toFixed(1)}%`
  if (unit === 'abbreviated') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`
    return String(value)
  }
  return value.toLocaleString()
}
```

`font-variant-numeric: tabular-nums` on the value element prevents layout shifts
when digits change width (especially important in live mode).

---

## Part 2 — DataWidget

### The mode discriminant

`DataWidget` uses a single `mode` prop to select behavior. The three modes are
structurally distinct enough that each is a separate render path — not flags on
a single component:

```jsx
export const DataWidget = (props) => {
  if (props.mode === 'skeleton') return <SkeletonCard />
  if (props.mode === 'live')     return <LiveCard {...props} />
  return <MetricCard {...props} />   // static (default)
}
```

This is the same pattern MUI uses internally — the public API is one component,
the implementation branches early and cleanly.

### Skeleton

`SkeletonCard` mirrors the MetricCard layout exactly (same padding, same gaps,
same element positions) using `<div>` blocks instead of real content.

The shimmer animation runs on all skeleton blocks via a shared `.skeleton` class:

```css
.skeleton {
  background: linear-gradient(90deg, #1f3460 25%, #2a4580 50%, #1f3460 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Each block gets a size modifier class (`.skeleton--label`, `.skeleton--value`, etc.)
that only sets `width`, `height`, and `border-radius`. All animation is in the base class.

### Live mode — socket wiring

`LiveCard` subscribes to the socket in a `useEffect` and cleans up on unmount:

```js
useEffect(() => {
  const handler = (e) => {
    try {
      setSnapshot(JSON.parse(e.data))
    } catch {
      // ignore malformed messages
    }
  }

  socket.addEventListener('message', handler)

  return () => {
    socket.removeEventListener('message', handler)
    socket.close()
  }
}, [socket])
```

Key points:
- `socket` is in the dependency array — if the parent passes a new socket, the
  effect re-runs, cleans up the old one, and attaches to the new one.
- `socket.close()` is called on cleanup. The component owns the socket's lifetime
  once it receives it.
- The `try/catch` around `JSON.parse` means a malformed message silently drops
  rather than crashing the component.

### Socket lifecycle in App.jsx

Each live widget gets its own socket, created once with `useMemo`:

```js
const socketA = useMemo(() => createMockSocket(), [])
```

A `useEffect` cleanup closes both sockets if the `App` itself ever unmounts
(e.g. during dev HMR teardown). `DataWidget` handles the normal case; this is
a belt-and-suspenders fallback.

### Live indicator

A pulsing dot is positioned absolutely over the card, in the top-right corner.
The animation uses `transform: scale` rather than `opacity` alone so it feels
like a breathing indicator rather than a blink:

```css
@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(0.75); }
}
```

The `.data-widget--live` wrapper also tints the card's border blue to signal
that this instance is receiving data, without changing the card's own CSS.

---

## What a strong candidate submission looks like

| Dimension | Signal |
|-----------|--------|
| Sparkline | Hand-drawn SVG with correct normalization, round joins, status-aware color |
| CSS | BEM or equivalent naming, no inline style sprawl, uses custom properties for dynamic values |
| Part 2 API | `mode` discriminant, not boolean flags; modes are self-contained |
| Cleanup | `removeEventListener` + `close()` in `useEffect` return — no leak |
| Skeleton | Same layout as real card, shimmer on a shared base class |
| Live stability | `font-variant-numeric: tabular-nums` or equivalent — no layout shifts on update |
| Code volume | MetricCard under ~80 lines of JSX, DataWidget under ~70 — no over-engineering |

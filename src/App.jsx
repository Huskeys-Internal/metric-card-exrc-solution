import React, { useMemo, useEffect } from 'react'
import { MetricCard } from './components/MetricCard'
import { DataWidget } from './components/DataWidget'
import { createMockSocket } from './utils/createMockSocket'

const STATIC_METRICS = [
  {
    label: 'Blocked Requests',
    value: 1243800,
    unit: 'abbreviated',
    trend: [40, 55, 48, 70, 65, 80, 84],
    trendDelta: 12.4,
    status: 'critical',
  },
  {
    label: 'Block Rate',
    value: 84.3,
    unit: 'percent',
    trend: [60, 72, 68, 75, 79, 81, 84],
    trendDelta: -2.1,
    status: 'warning',
  },
  {
    label: 'Unique IPs',
    value: 342,
    unit: 'number',
    trend: [100, 150, 130, 200, 180, 250, 342],
    trendDelta: 36.8,
    status: 'healthy',
  },
]

const LIVE_INITIAL = {
  value: 0,
  trend: [0, 0, 0, 0, 0, 0, 0],
  trendDelta: 0,
  status: 'healthy',
}

const sectionStyle = {
  marginBottom: '48px',
}

const headingStyle = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '20px',
  marginTop: 0,
}

const rowStyle = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
}

export default function App() {
  // Each live widget owns its own socket
  const socketA = useMemo(() => createMockSocket(), [])
  const socketB = useMemo(() => createMockSocket(), [])

  // DataWidget closes its socket on unmount, but if the component
  // is never unmounted (e.g. during dev HMR), this is a fallback.
  useEffect(() => {
    return () => {
      socketA.close()
      socketB.close()
    }
  }, [socketA, socketB])

  return (
    <div style={{ padding: '48px 40px', background: '#0b0f1e', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Part 1 — MetricCard (static)</h2>
        <div style={rowStyle}>
          {STATIC_METRICS.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Part 2 — DataWidget · static mode</h2>
        <div style={rowStyle}>
          {STATIC_METRICS.map((m) => (
            <DataWidget key={m.label} mode="static" {...m} />
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Part 2 — DataWidget · skeleton mode</h2>
        <div style={rowStyle}>
          <DataWidget mode="skeleton" />
          <DataWidget mode="skeleton" />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Part 2 — DataWidget · live mode</h2>
        <div style={rowStyle}>
          <DataWidget
            mode="live"
            socket={socketA}
            label="Live Threats"
            unit="abbreviated"
            {...LIVE_INITIAL}
          />
          <DataWidget
            mode="live"
            socket={socketB}
            label="Block Rate"
            unit="percent"
            {...LIVE_INITIAL}
          />
        </div>
      </section>

    </div>
  )
}

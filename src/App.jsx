import React, { useState, useEffect } from 'react'
import { MetricCard } from './components/MetricCard'
import { DataWidget } from './components/DataWidget'
import { createMockSocket } from './utils/createMockSocket'
import './App.css'

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
  const [liveSockets, setLiveSockets] = useState({ a: null, b: null })

  useEffect(() => {
    const a = createMockSocket()
    const b = createMockSocket()
    setLiveSockets({ a, b })
    return () => {
      a.close()
      b.close()
    }
  }, [])

  return (
    <div className="app">

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
          {liveSockets.a && (
            <DataWidget
              mode="live"
              socket={liveSockets.a}
              label="Live Threats"
              unit="abbreviated"
              {...LIVE_INITIAL}
            />
          )}
          {liveSockets.b && (
            <DataWidget
              mode="live"
              socket={liveSockets.b}
              label="Block Rate"
              unit="percent"
              {...LIVE_INITIAL}
            />
          )}
        </div>
      </section>

    </div>
  )
}

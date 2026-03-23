import React from 'react'
import { formatValue } from '../../utils/formatValue'
import './styles.css'

const STATUS_COLORS = {
  healthy: '#4ade80',
  warning: '#fbbf24',
  critical: '#f87171',
}

const Sparkline = ({ data, color }) => {
  const W = 120
  const H = 36
  const PAD = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="metric-card__sparkline-svg"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const MetricCard = ({ label, value, unit = 'number', trend, trendDelta, status, icon }) => {
  const color = STATUS_COLORS[status]
  const isPositive = trendDelta >= 0

  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <div className="metric-card__label-row">
          {icon && <span className="metric-card__icon">{icon}</span>}
          <span className="metric-card__label">{label}</span>
        </div>
        <span
          className="metric-card__status-pill"
          data-status={status}
          style={{ '--status-color': color }}
        >
          <span className="metric-card__status-dot" />
          {status}
        </span>
      </div>

      <div className="metric-card__body">
        <span className="metric-card__value">{formatValue(value, unit)}</span>
        <span
          className={`metric-card__trend-badge metric-card__trend-badge--${isPositive ? 'positive' : 'negative'}`}
        >
          {isPositive ? '▲' : '▼'} {Math.abs(trendDelta)}%
        </span>
      </div>

      <div className="metric-card__sparkline">
        <Sparkline data={trend} color={color} />
      </div>
    </div>
  )
}

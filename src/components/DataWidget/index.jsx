import React, { useState, useEffect } from 'react'
import { MetricCard } from '../MetricCard'
import './styles.css'

// Skeleton — same layout as MetricCard, no real data
const SkeletonCard = () => (
  <div className="data-widget__skeleton">
    <div className="data-widget__skeleton-header">
      <div className="skeleton skeleton--label" />
      <div className="skeleton skeleton--pill" />
    </div>
    <div className="data-widget__skeleton-body">
      <div className="skeleton skeleton--value" />
      <div className="skeleton skeleton--badge" />
    </div>
    <div className="skeleton skeleton--sparkline" />
  </div>
)

// Live wrapper — subscribes to socket, feeds MetricCard
const LiveCard = ({ socket, label, unit, icon, value, trendDelta, trend, status }) => {
  const [snapshot, setSnapshot] = useState({ value, trendDelta, trend, status })

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

  return (
    <div className="data-widget data-widget--live">
      <MetricCard
        label={label}
        unit={unit}
        icon={icon}
        value={snapshot.value}
        trendDelta={snapshot.trendDelta}
        trend={snapshot.trend}
        status={snapshot.status}
      />
      <div className="data-widget__live-badge" aria-label="Live data">
        <span className="data-widget__live-dot" />
        Live
      </div>
    </div>
  )
}

// DataWidget — public API
export const DataWidget = (props) => {
  if (props.mode === 'skeleton') {
    return <SkeletonCard />
  }

  if (props.mode === 'live') {
    const { mode, ...rest } = props
    return <LiveCard {...rest} />
  }

  // mode === 'static' (default)
  const { mode, ...cardProps } = props
  return <MetricCard {...cardProps} />
}

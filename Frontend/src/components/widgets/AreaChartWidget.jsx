import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import './styles/widgets.css'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color }} />
          <span className="chart-tooltip-name">{p.name}</span>
          <span className="chart-tooltip-val">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function AreaChartWidget({ title, data, loading, config = {} }) {
  if (loading || !data) {
    return (
      <div className="widget-card">
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ flex: 1, marginTop: 8 }} />
      </div>
    )
  }

  const color1 = config.color || '#54bd95'
  const color2 = config.color2 || '#3b82f6'
  const showLabels = !!config.showLabels
  const showGrid = config.showGrid !== false
  const showLegend = config.showLegend !== false
  const showBothSeries = config.showBothSeries !== false
  const fillStyle = config.fillStyle || 'gradient'  // 'gradient'|'solid'|'none'

  // Fill opacity based on fillStyle
  const fillOpacity1 = fillStyle === 'none' ? 0 : fillStyle === 'solid' ? 0.4 : 1
  const fillOpacity2 = fillStyle === 'none' ? 0 : fillStyle === 'solid' ? 0.3 : 1

  const gradId1 = `area-g1-${color1.replace('#', '')}`
  const gradId2 = `area-g2-${color2.replace('#', '')}`

  const fill1 = fillStyle === 'gradient' ? `url(#${gradId1})` : fillStyle === 'solid' ? color1 : 'transparent'
  const fill2 = fillStyle === 'gradient' ? `url(#${gradId2})` : fillStyle === 'solid' ? color2 : 'transparent'

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <div className="widget-title">{title}</div>
          <div className="widget-subtitle">New vs returning customers</div>
        </div>
        <button className="widget-menu-btn"><MoreHorizontal size={14} /></button>
      </div>
      <div className="widget-body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId1} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color1} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={gradId2} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color2} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color2} stopOpacity={0} />
              </linearGradient>
            </defs>

            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />}
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

            {/* New customers — always shown */}
            <Area
              type="monotone" dataKey="new" name="New"
              stroke={color1} strokeWidth={2}
              fill={fill1} fillOpacity={fillOpacity1}
            >
              {showLabels && (
                <LabelList dataKey="new" position="top" style={{ fontSize: 10, fill: '#6b7280' }} />
              )}
            </Area>

            {/* Returning customers — toggle via showBothSeries */}
            {showBothSeries && (
              <Area
                type="monotone" dataKey="returning" name="Returning"
                stroke={color2} strokeWidth={2}
                fill={fill2} fillOpacity={fillOpacity2}
              >
                {showLabels && (
                  <LabelList dataKey="returning" position="top" style={{ fontSize: 10, fill: '#6b7280' }} />
                )}
              </Area>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
import React from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis
} from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import './styles/widgets.css'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-name">Qty</span>
        <span className="chart-tooltip-val">{d?.x}</span>
      </div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-name">Revenue</span>
        <span className="chart-tooltip-val">${d?.y?.toLocaleString()}</span>
      </div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-name">Unit Price</span>
        <span className="chart-tooltip-val">${d?.z?.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function ScatterPlotWidget({ title, data, loading, config = {} }) {
  if (loading || !data) {
    return (
      <div className="widget-card">
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ flex: 1, marginTop: 8 }} />
      </div>
    )
  }

  const dotColor = config.color || '#54bd95'
  const opacity = parseFloat(config.opacity ?? '0.7')
  const showGrid = config.showGrid !== false
  const showAxisLabels = config.showAxisLabels !== false

  // Dot size range maps to ZAxis range
  const SIZE_MAP = { small: [20, 80], medium: [30, 150], large: [50, 250] }
  const zRange = SIZE_MAP[config.dotSize] || SIZE_MAP.medium

  const tickStyle = { fontSize: 11, fill: showAxisLabels ? '#6b7280' : 'transparent' }

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <div className="widget-title">{title}</div>
          <div className="widget-subtitle">Quantity vs Revenue (size = unit price)</div>
        </div>
        <button className="widget-menu-btn"><MoreHorizontal size={14} /></button>
      </div>
      <div className="widget-body">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis
              dataKey="x" name="Qty"
              tick={tickStyle} axisLine={false} tickLine={false}
              label={showAxisLabels ? { value: 'Quantity', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' } : undefined}
            />
            <YAxis
              dataKey="y" name="Revenue"
              tick={tickStyle} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <ZAxis dataKey="z" range={zRange} name="Unit Price" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#e5e7eb' }} />
            <Scatter data={data} fill={dotColor} fillOpacity={opacity} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
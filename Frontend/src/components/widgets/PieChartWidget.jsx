import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import './styles/widgets.css'

const PALETTES = {
  default: ['#54bd95', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#94a3b8'],
  warm: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#a16207', '#dc2626', '#b45309'],
  cool: ['#3b82f6', '#06b6d4', '#6366f1', '#0ea5e9', '#14b8a6', '#8b5cf6', '#2563eb'],
  pastel: ['#86efac', '#93c5fd', '#fcd34d', '#fca5a5', '#c4b5fd', '#f9a8d4', '#94a3b8'],
}

export default function PieChartWidget({ title, data, loading, config = {} }) {
  const [activeIndex, setActiveIndex] = useState(null)

  if (loading || !data) {
    return (
      <div className="widget-card">
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ flex: 1, marginTop: 8, borderRadius: '50%' }} />
      </div>
    )
  }

  const showLegend = config.showLegend !== false
  const showLabels = !!config.showLabels
  const showPercent = config.showPercent !== false
  const chartStyle = config.chartStyle || 'donut'   // 'donut' | 'pie'
  const maxSlices = parseInt(config.maxSlices ?? '6', 10)
  const palette = PALETTES[config.palette] || PALETTES.default

  // Slice data to maxSlices, collapse rest into "Other"
  let sliced = [...data]
  if (sliced.length > maxSlices) {
    const top = sliced.slice(0, maxSlices)
    const rest = sliced.slice(maxSlices)
    const otherVal = rest.reduce((s, d) => s + (d.value || 0), 0)
    top.push({ name: 'Other', value: Math.round(otherVal * 10) / 10, color: '#94a3b8' })
    sliced = top
  }

  // Apply palette colors
  const coloredData = sliced.map((item, i) => ({
    ...item,
    color: item.name === 'Other' ? '#94a3b8' : (palette[i % palette.length]),
  }))

  const innerRadius = chartStyle === 'pie' ? '0%' : '45%'

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <div className="widget-title">{title}</div>
          <div className="widget-subtitle">Revenue by product</div>
        </div>
        <button className="widget-menu-btn"><MoreHorizontal size={14} /></button>
      </div>

      <div className="widget-body" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ResponsiveContainer width={showLegend ? '55%' : '100%'} height="100%">
          <PieChart>
            <Pie
              data={coloredData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius="70%"
              dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {coloredData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                />
              ))}
              {showLabels && (
                <LabelList
                  dataKey="value"
                  position="outside"
                  style={{ fontSize: 11, fill: '#374151' }}
                  formatter={v => showPercent ? `${v}%` : v}
                />
              )}
            </Pie>
            <Tooltip
              formatter={(value, name) => [showPercent ? `${value}%` : value, name]}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {showLegend && (
          <div className="pie-legend">
            {coloredData.map(item => (
              <div key={item.name} className="pie-legend-item">
                <span className="pie-dot" style={{ background: item.color }} />
                <span className="pie-name">{item.name}</span>
                {showPercent && <span className="pie-pct">{item.value}%</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
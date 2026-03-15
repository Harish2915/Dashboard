import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import './Styles/widgets.css'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color }} />
          <span className="chart-tooltip-name">{p.name}</span>
          <span className="chart-tooltip-val">${(p.value / 1000).toFixed(0)}k</span>
        </div>
      ))}
    </div>
  )
}

export default function LineChartWidget({ title, data, loading }) {
  if (loading || !data) {
    return (
      <div className="widget-card">
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ flex: 1, marginTop: 8 }} />
      </div>
    )
  }

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div>
          <div className="widget-title">{title}</div>
          <div className="widget-subtitle">Actual vs forecast</div>
        </div>
        <button className="widget-menu-btn"><MoreHorizontal size={14} /></button>
      </div>
      <div className="widget-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#54bd95" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#93c5fd" strokeWidth={2} strokeDasharray="4 3" dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../utils/dateFilters'
import './Styles/widgets.css'

export default function KPIWidget({ title, metricKey, data, loading }) {
  if (loading || !data) {
    return (
      <div className="widget-card">
        <div className="skeleton" style={{ height: 14, width: '50%' }} />
        <div className="skeleton" style={{ height: 32, width: '70%', marginTop: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', marginTop: 6 }} />
      </div>
    )
  }

  const { value, change, trend } = data
  const isUp = trend === 'up'

  const displayValue = (metricKey === 'revenue' || metricKey === 'aov')
    ? formatCurrency(value)
    : formatNumber(value)

  return (
    <div className="widget-card kpi-card">
      <div className="kpi-top">
        <p className="kpi-label">{title}</p>
      </div>
      <div className="kpi-value">{displayValue}</div>
      <div className={`kpi-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        <span>{Math.abs(change)}%</span>
        <span className="kpi-period">vs last period</span>
      </div>
    </div>
  )
}
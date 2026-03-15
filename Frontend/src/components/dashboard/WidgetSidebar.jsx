import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  X, BarChart2, LineChart, PieChart, AreaChart,
  ScatterChart, Table, TrendingUp, GripVertical
} from 'lucide-react'
import { toggleWidgetSidebar, addWidget } from '../../store/dashboardSlice'
import './styles/WidgetSidebar.css'

const WIDGET_CATALOG = [
  {
    type: 'kpi',
    label: 'KPI Card',
    description: 'Key performance indicator with trend',
    icon: TrendingUp,
    color: '#4f7fff',
    defaultSize: { w: 3, h: 2 },
  },
  {
    type: 'bar',
    label: 'Bar Chart',
    description: 'Compare values across categories',
    icon: BarChart2,
    color: '#9b6dff',
    defaultSize: { w: 6, h: 4 },
  },
  {
    type: 'line',
    label: 'Line Chart',
    description: 'Track trends over time',
    icon: LineChart,
    color: '#00d4ff',
    defaultSize: { w: 6, h: 4 },
  },
  {
    type: 'pie',
    label: 'Pie / Donut',
    description: 'Show proportions and distributions',
    icon: PieChart,
    color: '#00e5a0',
    defaultSize: { w: 4, h: 4 },
  },
  {
    type: 'area',
    label: 'Area Chart',
    description: 'Visualize volume over time',
    icon: AreaChart,
    color: '#ff7d4d',
    defaultSize: { w: 8, h: 4 },
  },
  {
    type: 'scatter',
    label: 'Scatter Plot',
    description: 'Find correlations between variables',
    icon: ScatterChart,
    color: '#ffcc00',
    defaultSize: { w: 6, h: 4 },
  },
  {
    type: 'table',
    label: 'Data Table',
    description: 'Tabular data with sort & pagination',
    icon: Table,
    color: '#ff5fa3',
    defaultSize: { w: 12, h: 5 },
  },
]

function generateId(type) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function WidgetSidebar() {
  const dispatch = useDispatch()
  const { widgetSidebarOpen } = useSelector(s => s.dashboard)

  const handleAdd = (widget) => {
    dispatch(addWidget({
      id: generateId(widget.type),
      type: widget.type,
      title: widget.label,
      x: 0,
      y: Infinity,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h,
    }))
    dispatch(toggleWidgetSidebar())
  }

  return (
    <>
      {/* Backdrop */}
      {widgetSidebarOpen && (
        <div className="ws-backdrop" onClick={() => dispatch(toggleWidgetSidebar())} />
      )}

      <aside className={`widget-sidebar ${widgetSidebarOpen ? 'open' : ''}`}>
        <div className="ws-header">
          <div>
            <h3 className="ws-title">Add Widget</h3>
            <p className="ws-subtitle">Click to add to your dashboard</p>
          </div>
          <button className="ws-close" onClick={() => dispatch(toggleWidgetSidebar())}>
            <X size={16} />
          </button>
        </div>

        <div className="ws-body">
          <div className="ws-section-label">AVAILABLE WIDGETS</div>
          <div className="ws-list">
            {WIDGET_CATALOG.map(widget => {
              const Icon = widget.icon
              return (
                <div
                  key={widget.type}
                  className="ws-item"
                  onClick={() => handleAdd(widget)}
                >
                  <div className="ws-item-icon" style={{ background: `${widget.color}18`, color: widget.color }}>
                    <Icon size={18} />
                  </div>
                  <div className="ws-item-info">
                    <div className="ws-item-name">{widget.label}</div>
                    <div className="ws-item-desc">{widget.description}</div>
                  </div>
                  <div className="ws-item-size">
                    <span>{widget.defaultSize.w}×{widget.defaultSize.h}</span>
                  </div>
                  <GripVertical size={14} className="ws-drag-icon" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="ws-footer">
          <div className="ws-tip">
            💡 Widgets are added at the bottom of your dashboard. Drag to reposition.
          </div>
        </div>
      </aside>
    </>
  )
}
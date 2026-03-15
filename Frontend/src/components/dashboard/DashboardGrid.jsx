import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { Settings, Trash2 } from 'lucide-react'

import { updateLayout, removeWidget, selectWidget } from '../../store/dashboardSlice'
import { api } from '../../services/api'

import KPIWidget from '../widgets/KPIWidget'
import BarChartWidget from '../widgets/BarChartWidget'
import LineChartWidget from '../widgets/LineChartWidget'
import PieChartWidget from '../widgets/PieChartWidget'
import AreaChartWidget from '../widgets/AreaChartWidget'
import ScatterPlotWidget from '../widgets/ScatterPlotWidget'
import TableWidget from '../widgets/TableWidget'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './styles/DashboardGrid.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// FIX 6: xl and lg were only 50px apart (1350 vs 1300) causing
// constant breakpoint thrashing. Widen the gap so the browser
// settles on one breakpoint and savedLayout keys stay stable.
const COLS = { xl: 12, lg: 10, md: 6, sm: 4 }
const BREAKPOINTS = { xl: 1600, lg: 1200, md: 768, sm: 0 }

const KPI_META = {
  'kpi-revenue': { key: 'revenue', title: 'Total Revenue' },
  'kpi-orders': { key: 'orders', title: 'Total Orders' },
  'kpi-customers': { key: 'customers', title: 'Active Customers' },
  'kpi-aov': { key: 'aov', title: 'Avg Order Value' },
}

function clampW(w, cols) {
  return Math.max(1, Math.min(w, cols))
}

// Safe number check — rejects Infinity, NaN, null, undefined
function isValidNum(v) {
  return typeof v === 'number' && isFinite(v) && !isNaN(v)
}

function buildLayoutForBreakpoint(widgets, cols) {
  return widgets.map(w => ({
    i: w.id,
    // FIX 3a: w.x may be 0 after Infinity y was sanitised → safe fallback
    x: isValidNum(w.x) ? Math.max(0, w.x % cols) : 0,
    // FIX 3b: w.y was Infinity (not JSON-safe) → treat large numbers as 0
    y: isValidNum(w.y) ? Math.max(0, w.y) : 0,
    w: isValidNum(w.w) ? clampW(w.w, cols) : Math.min(4, cols),
    h: isValidNum(w.h) ? Math.max(1, w.h) : 4,
    minW: 1,
    minH: 2,
  }))
}

export default function DashboardGrid({ widgets = [], editable, savedLayout: propSavedLayout }) {

  const dispatch = useDispatch()
  const { dateFilter, savedLayout: reduxSavedLayout } = useSelector(s => s.dashboard)
  const savedLayout = propSavedLayout || reduxSavedLayout

  // FIX 1: onLayoutChange fires on mount with RGL's own compacted layout.
  // Without this guard that mount-time call overwrites savedLayout and
  // resets all positions.  We only dispatch after a real user interaction.
  const userInteracted = useRef(false)

  const [apiData, setApiData] = useState({
    kpis: null, sales: null, trend: null,
    categories: null, traffic: null, scatter: null,
  })
  const [loading, setLoading] = useState(true)

  /* ---------------- Fetch API Data ---------------- */

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getKPIs(dateFilter),
      api.getSalesData(dateFilter),
      api.getRevenueTrend(dateFilter),
      api.getCategoryData(dateFilter),
      api.getTrafficData(dateFilter),
      api.getScatterData(dateFilter),
    ])
      .then(([kpis, sales, trend, categories, traffic, scatter]) => {
        setApiData({ kpis, sales, trend, categories, traffic, scatter })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dateFilter])

  /* ---------------- Render Widget ---------------- */

  function renderContent(widget) {
    const meta = KPI_META[widget.id]
    switch (widget.type) {
      case 'kpi':
        return (
          <KPIWidget
            title={widget.title}
            metricKey={meta ? meta.key : 'revenue'}
            data={meta ? apiData.kpis?.[meta.key] : null}
            loading={loading}
            config={widget.config}
          />
        )
      case 'bar':
        return <BarChartWidget title={widget.title} data={apiData.sales} loading={loading} config={widget.config} />
      case 'line':
        return <LineChartWidget title={widget.title} data={apiData.trend} loading={loading} config={widget.config} />
      case 'pie':
        return <PieChartWidget title={widget.title} data={apiData.categories} loading={loading} config={widget.config} />
      case 'area':
        return <AreaChartWidget title={widget.title} data={apiData.traffic} loading={loading} config={widget.config} />
      case 'scatter':
        return <ScatterPlotWidget title={widget.title} data={apiData.scatter} loading={loading} config={widget.config} />
      case 'table':
        return <TableWidget title={widget.title} config={widget.config} />
      default:
        return <div className="widget-unknown">Unknown: {widget.type}</div>
    }
  }

  /* ---------------- Empty State ---------------- */

  if (!widgets.length) {
    return (
      <div className="grid-empty">
        <p>No widgets yet. Click a widget from the left panel to add it.</p>
      </div>
    )
  }

  /* ---------------- Layout Build ---------------- */

  let layouts

  // FIX 4: Previously only checked savedLayout?.lg?.length but COLS now has
  // xl as the widest breakpoint, so we check xl first, then fall back to lg.
  const hasSavedLayout = savedLayout && (
    (savedLayout.xl && savedLayout.xl.length > 0) ||
    (savedLayout.lg && savedLayout.lg.length > 0)
  )

  if (hasSavedLayout) {

    const currentWidgetIds = new Set(widgets.map(w => w.id))

    // FIX 5: Old mergeLayout kept stale items from savedLayout that no
    // longer exist in widgets[].  Those ghost items confused RGL and caused
    // it to fall back to a compacted single-column layout.
    // New mergeLayout: start from widgets[] (source of truth for IDs),
    // look up each one in savedLayout, fall back to buildLayoutForBreakpoint
    // only for widgets that are genuinely new.
    const mergeLayout = (savedBp, cols) => {
      const savedMap = new Map((savedBp || []).map(item => [item.i, item]))

      return widgets.map(w => {
        const s = savedMap.get(w.id)

        // Widget exists in saved layout and all values are valid numbers
        if (s && isValidNum(s.x) && isValidNum(s.y) && isValidNum(s.w) && isValidNum(s.h)) {
          return {
            i: w.id,
            x: Math.max(0, s.x),
            y: Math.max(0, s.y),
            w: clampW(s.w, cols),
            h: Math.max(1, s.h),
            minW: 1,
            minH: 2,
          }
        }

        // Widget is new or has corrupted saved values → safe fallback
        return buildLayoutForBreakpoint([w], cols)[0]
      })
    }

    layouts = {
      xl: mergeLayout(savedLayout.xl, COLS.xl),
      lg: mergeLayout(savedLayout.lg, COLS.lg),
      md: mergeLayout(savedLayout.md, COLS.md),
      sm: mergeLayout(savedLayout.sm, COLS.sm),
    }

  } else {
    layouts = {
      xl: buildLayoutForBreakpoint(widgets, COLS.xl),
      lg: buildLayoutForBreakpoint(widgets, COLS.lg),
      md: buildLayoutForBreakpoint(widgets, COLS.md),
      sm: buildLayoutForBreakpoint(widgets, COLS.sm),
    }
  }

  /* ---------------- Render Grid ---------------- */

  return (
    <div className="dashboard-grid-wrap">
      <ResponsiveGridLayout
        className="dashboard-rgl"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={80}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        isDraggable={editable}
        isResizable={editable}
        draggableHandle=".drag-handle"
        compactType={null}
        preventCollision={false}  // allow free placement anywhere — widgets can overlap during drag
        useCSSTransforms={true}
        // FIX 1: Mark that a real user interaction has started.
        // onLayoutChange will be ignored until one of these fires.
        onDragStart={() => { userInteracted.current = true }}
        onResizeStart={() => { userInteracted.current = true }}
        onLayoutChange={(currentLayout, allLayouts) => {
          if (!editable) return

          // FIX 1: Ignore the automatic mount-time call.
          // RGL fires onLayoutChange immediately on render with its own
          // compacted layout — without this guard that call overwrites the
          // real savedLayout and positions are lost.
          if (!userInteracted.current) return

          // FIX 2: Old code sent { lgLayout, allLayouts } but the slice
          // expected that exact shape.  We now send currentLayout (the
          // active breakpoint at time of drag) alongside allLayouts so
          // the slice can sync widget x/y/w/h from whatever breakpoint
          // was live, not always lg.
          dispatch(updateLayout({
            currentLayout,     // active breakpoint items (for widget sync)
            allLayouts,        // all breakpoints (xl, lg, md, sm)
          }))
        }}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="rgl-item">
            {editable && (
              <div className="widget-toolbar">
                <div className="drag-handle" title="Drag to move">⠿</div>
                <div className="toolbar-right">
                  <button
                    className="toolbar-btn"
                    title="Settings"
                    onClick={() => dispatch(selectWidget(widget.id))}
                  >
                    <Settings size={13} />
                  </button>
                  <button
                    className="toolbar-btn delete"
                    title="Delete"
                    onClick={() => dispatch(removeWidget(widget.id))}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
            <div className="rgl-inner">
              {renderContent(widget)}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}
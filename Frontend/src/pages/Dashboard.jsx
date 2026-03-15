import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, Settings, ChevronDown } from 'lucide-react'
import { setDateFilter } from '../store/dashboardSlice'
import { DATE_FILTERS } from '../utils/dateFilters'
import DashboardGrid from '../components/dashboard/DashboardGrid'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { savedWidgets, dateFilter } = useSelector(s => s.dashboard)

  // No useEffect or backend call needed.
  // store.js persists the full state to localStorage and restores it
  // on every load — refresh, new tab, new entry — automatically.
  // savedWidgets and savedLayout are always in sync with what was last saved.

  // ── Empty state ───────────────────────────────────────────────────────────
  if (savedWidgets.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="empty-card">
          <div className="empty-icon">
            <LayoutDashboard size={36} />
          </div>
          <h2 className="empty-title">Your dashboard is empty</h2>
          <p className="empty-desc">
            Add widgets and save your layout to see data here.
          </p>
          <button className="btn-primary" onClick={() => navigate('/configure')}>
            <Settings size={15} />
            Configure Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Populated dashboard ───────────────────────────────────────────────────
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dash-header-left">
          <h2 className="page-heading">Overview</h2>
        </div>

        <div className="dash-header-right">
          <div className="dash-date-filter">
            <label className="dash-filter-label">Show data for</label>
            <div className="dash-filter-select-wrap">
              <select
                className="dash-filter-select"
                value={dateFilter}
                onChange={e => dispatch(setDateFilter(e.target.value))}
              >
                {DATE_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="dash-filter-arrow" />
            </div>
          </div>

          <button className="btn-secondary" onClick={() => navigate('/configure')}>
            <Settings size={14} />
            Configure
          </button>
        </div>
      </div>

      <DashboardGrid widgets={savedWidgets} editable={false} />
    </div>
  )
}
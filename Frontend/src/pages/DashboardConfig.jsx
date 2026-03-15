import React from 'react'
import { Link } from 'react-router-dom'
import { Save, X, Layers, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWidgetSidebar } from '../store/dashboardSlice'

import DashboardGrid from '../components/dashboard/DashboardGrid'
import WidgetSidebar from '../components/dashboard/WidgetSidebar'
import WidgetSettingsPanel from '../components/dashboard/WidgetSettingsPanel'

import './Dashboard.css'

export default function DashboardConfig() {

  const dispatch = useDispatch()

  // 🔹 Get widgets from Redux
  const widgets = useSelector(state => state.dashboard.widgets)

  return (
    <div className="config-page animate-fade-up">

      {/* Header */}
      <div className="config-header">

        <div className="config-header-left">
          <div className="dash-icon">
            <Layers size={18} />
          </div>

          <div>
            <h2 className="dash-heading">Dashboard Builder</h2>
            <p className="dash-subheading">
              Drag, resize and configure your widgets
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>

          <button
            className="dash-refresh-btn"
            onClick={() => dispatch(toggleWidgetSidebar())}
          >
            <Plus size={14} />
            Add Widget
          </button>

          <Link
            to="/dashboard"
            className="config-save-btn"
            style={{ textDecoration: 'none' }}
          >
            <Save size={14} />
            Save & View
          </Link>

        </div>

      </div>

      {/* Edit mode banner */}
      <div className="config-edit-bar">
        <div className="config-edit-bar-text">
          🎨 <strong>Edit Mode Active</strong> — Drag widgets to rearrange.
          Click the settings icon on any widget to configure it.
          Use the resize handle at the bottom-right corner to resize.
        </div>

        <Link to="/dashboard" className="config-discard-btn">
          <X size={13} />
          Discard
        </Link>
      </div>

      {/* Editable Grid */}
      <DashboardGrid
        widgets={widgets}
        editable={true}
      />

      {/* Panels */}
      <WidgetSidebar />
      <WidgetSettingsPanel />

    </div>
  )
}
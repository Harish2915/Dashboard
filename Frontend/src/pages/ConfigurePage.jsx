import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Save, CheckCircle } from 'lucide-react'
import { addWidget, saveDashboard, selectWidget } from '../store/dashboardSlice'
import { api } from '../services/api'
import DashboardGrid from '../components/dashboard/DashboardGrid'
import WidgetSettingsPanel from '../components/dashboard/WidgetSettingsPanel'
import './ConfigurePage.css'

const CATALOG = [
    {
        category: 'KPIs',
        items: [
            { type: 'kpi', id: 'kpi-revenue', label: 'Total Revenue', emoji: '💰', w: 2, h: 2 },
            { type: 'kpi', id: 'kpi-orders', label: 'Total Orders', emoji: '🛒', w: 2, h: 2 },
            { type: 'kpi', id: 'kpi-customers', label: 'Active Customers', emoji: '👥', w: 2, h: 2 },
            { type: 'kpi', id: 'kpi-aov', label: 'Avg Order Value', emoji: '📦', w: 2, h: 2 },
        ],
    },
    {
        category: 'Charts',
        items: [
            { type: 'bar', id: 'chart-bar', label: 'Bar Chart', emoji: '📊', w: 5, h: 5 },
            { type: 'line', id: 'chart-line', label: 'Line Chart', emoji: '📈', w: 5, h: 5 },
            { type: 'pie', id: 'chart-pie', label: 'Pie Chart', emoji: '🥧', w: 4, h: 5 },
            { type: 'area', id: 'chart-area', label: 'Area Chart', emoji: '🌊', w: 5, h: 5 },
            { type: 'scatter', id: 'chart-scatter', label: 'Scatter Plot', emoji: '⬤', w: 5, h: 5 },
        ],
    },
    {
        category: 'Tables',
        items: [
            { type: 'table', id: 'table-data', label: 'Data Table', emoji: '📋', w: 12, h: 5 },
        ],
    },
]

export default function ConfigurePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { widgets, selectedWidget } = useSelector(s => s.dashboard)

    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    // No useEffect needed — localStorage in store.js restores state
    // automatically on every load including refresh and new entry.

    function isAlreadyAdded(item) {
        return widgets.some(w => w.id === item.id)
    }

    function handleAdd(item) {
        if (isAlreadyAdded(item)) return

        dispatch(addWidget({
            id: item.id,
            type: item.type,
            title: item.label,
            x: 0,
            y: 9999,
            w: item.w,
            h: item.h,
            config: {},
        }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            await api.saveLayout(widgets)
        } catch (_) { }

        dispatch(saveDashboard())
        setSaved(true)
        setSaving(false)
        setTimeout(() => navigate('/dashboard'), 900)
    }

    return (
        <div className="configure-page">

            {/* ── Left: widget catalog ── */}
            <aside className="catalog-panel">
                <div className="catalog-head">
                    <div className="catalog-head-title">Widgets</div>
                    <div className="catalog-head-sub">Click to add · Grayed = already added</div>
                </div>
                <div className="catalog-list">
                    {CATALOG.map(group => (
                        <div key={group.category} className="catalog-group">
                            <div className="catalog-group-title">{group.category}</div>
                            <div className="catalog-cards">
                                {group.items.map(item => {
                                    const added = isAlreadyAdded(item)
                                    return (
                                        <button
                                            key={item.id}
                                            className={`catalog-card ${added ? 'catalog-card--added' : ''}`}
                                            onClick={() => handleAdd(item)}
                                            title={added ? `${item.label} is already added` : `Add ${item.label}`}
                                            disabled={added}
                                        >
                                            <span className="catalog-card-emoji">{item.emoji}</span>
                                            <span className="catalog-card-label">{item.label}</span>
                                            <span className="catalog-card-size">
                                                {added ? '✓ Added' : `${item.w}×${item.h}`}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ── Centre: grid builder ── */}
            <div className="builder-area">
                <div className="builder-toolbar">
                    <span className="builder-hint">
                        Drag anywhere · Resize from corner · Hover for ⚙ settings
                    </span>
                    <button
                        className={`save-config-btn ${saved ? 'done' : ''}`}
                        onClick={handleSave}
                        disabled={saving || saved}
                    >
                        {saved ? <><CheckCircle size={15} /> Saved!</>
                            : saving ? <>Saving...</>
                                : <><Save size={15} /> Save Configuration</>}
                    </button>
                </div>

                <div className="builder-grid-scroll">
                    <DashboardGrid widgets={widgets} editable={true} />
                </div>
            </div>

            {/* ── Right: settings panel ── */}
            {selectedWidget && <WidgetSettingsPanel />}

        </div>
    )
}
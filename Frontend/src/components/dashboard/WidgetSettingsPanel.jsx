import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Save } from 'lucide-react'
import { updateWidget, selectWidget } from '../../store/dashboardSlice'
import './styles/WidgetSettingsPanel.css'

// ── Primitive UI helpers ──────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div className="sf-field">
      <label className="sf-label">
        {label}
        {hint && <span className="sf-hint">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', min, max }) {
  return (
    <input
      className="sf-input"
      type={type}
      value={value ?? ''}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select className="sf-input" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  )
}

function ColorRow({ label, value, defaultColor = '#54bd95', onChange }) {
  return (
    <Field label={label}>
      <div className="sf-color-row">
        <input
          type="color"
          className="sf-color"
          value={value || defaultColor}
          onChange={e => onChange(e.target.value)}
        />
        <span className="sf-color-val">{value || defaultColor}</span>
        {value && value !== defaultColor && (
          <button className="sf-color-reset" onClick={() => onChange('')} title="Reset to default">↺</button>
        )}
      </div>
    </Field>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="sf-toggle-row">
      <span className="sf-toggle-label">{label}</span>
      <div className={`sf-toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
        <div className="sf-toggle-thumb" />
      </div>
    </label>
  )
}

function Divider({ label }) {
  return (
    <div className="sf-section-divider">
      <span>{label}</span>
    </div>
  )
}

// ── KPI Card Config ───────────────────────────────────────────────────────────
// Controls: format, decimals, accent colour, show/hide change badge,
//           show/hide trend icon, background colour
function KPIConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })
  return (
    <>
      <Divider label="Display" />

      <Field label="Value Format">
        <Select
          value={cfg.format || 'Currency'}
          onChange={v => set({ format: v })}
          options={[
            { value: 'Currency', label: 'Currency  ($18.5K)' },
            { value: 'Number', label: 'Number    (18500)' },
          ]}
        />
      </Field>

      <Field label="Decimal Places">
        <Select
          value={cfg.decimals ?? '1'}
          onChange={v => set({ decimals: v })}
          options={[
            { value: '0', label: '0  →  $18K' },
            { value: '1', label: '1  →  $18.5K' },
            { value: '2', label: '2  →  $18.50K' },
          ]}
        />
      </Field>

      <Divider label="Appearance" />

      <ColorRow
        label="Accent Color"
        value={cfg.accentColor}
        defaultColor="#54bd95"
        onChange={v => set({ accentColor: v })}
      />

      <ColorRow
        label="Card Background"
        value={cfg.bgColor}
        defaultColor="#ffffff"
        onChange={v => set({ bgColor: v })}
      />

      <Divider label="Visibility" />

      <Toggle
        label="Show % Change Badge"
        checked={cfg.showChange !== false}
        onChange={v => set({ showChange: v })}
      />

      <Toggle
        label="Show Trend Icon"
        checked={cfg.showTrend !== false}
        onChange={v => set({ showTrend: v })}
      />

      <Toggle
        label="Show Subtitle"
        checked={cfg.showSubtitle !== false}
        onChange={v => set({ showSubtitle: v })}
      />
    </>
  )
}

// ── Bar Chart Config ──────────────────────────────────────────────────────────
// Controls: primary colour, secondary (target) colour, show/hide target bar,
//           show labels, bar radius, show grid, show legend
function BarConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })
  return (
    <>
      <Divider label="Data" />

      <Field label="Primary Metric">
        <Select
          value={cfg.yAxis || 'revenue'}
          onChange={v => set({ yAxis: v })}
          options={[
            { value: 'revenue', label: 'Revenue' },
            { value: 'order_count', label: 'Order Count' },
            { value: 'target', label: 'Target' },
          ]}
        />
      </Field>

      <Divider label="Appearance" />

      <ColorRow
        label="Bar Color"
        value={cfg.color}
        defaultColor="#54bd95"
        onChange={v => set({ color: v })}
      />

      <ColorRow
        label="Target Bar Color"
        value={cfg.targetColor}
        defaultColor="#e5e7eb"
        onChange={v => set({ targetColor: v })}
      />

      <Field label="Bar Corner Radius">
        <Select
          value={cfg.barRadius ?? '4'}
          onChange={v => set({ barRadius: v })}
          options={[
            { value: '0', label: 'Square  (0px)' },
            { value: '4', label: 'Rounded (4px)' },
            { value: '8', label: 'Pill    (8px)' },
          ]}
        />
      </Field>

      <Divider label="Visibility" />

      <Toggle
        label="Show Target Bar"
        checked={cfg.showTarget !== false}
        onChange={v => set({ showTarget: v })}
      />

      <Toggle
        label="Show Value Labels"
        checked={!!cfg.showLabels}
        onChange={v => set({ showLabels: v })}
      />

      <Toggle
        label="Show Grid Lines"
        checked={cfg.showGrid !== false}
        onChange={v => set({ showGrid: v })}
      />

      <Toggle
        label="Show Legend"
        checked={cfg.showLegend !== false}
        onChange={v => set({ showLegend: v })}
      />
    </>
  )
}

// ── Line Chart Config ─────────────────────────────────────────────────────────
// Controls: line colour, forecast colour, show forecast line,
//           dot visibility, line thickness, show labels, show grid
function LineConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })
  return (
    <>
      <Divider label="Data" />

      <Field label="Primary Metric">
        <Select
          value={cfg.yAxis || 'revenue'}
          onChange={v => set({ yAxis: v })}
          options={[
            { value: 'revenue', label: 'Revenue' },
            { value: 'order_count', label: 'Order Count' },
            { value: 'forecast', label: 'Forecast' },
          ]}
        />
      </Field>

      <Divider label="Appearance" />

      <ColorRow
        label="Line Color"
        value={cfg.color}
        defaultColor="#54bd95"
        onChange={v => set({ color: v })}
      />

      <ColorRow
        label="Forecast Line Color"
        value={cfg.forecastColor}
        defaultColor="#93c5fd"
        onChange={v => set({ forecastColor: v })}
      />

      <Field label="Line Thickness">
        <Select
          value={cfg.strokeWidth ?? '2.5'}
          onChange={v => set({ strokeWidth: v })}
          options={[
            { value: '1.5', label: 'Thin   (1.5px)' },
            { value: '2.5', label: 'Normal (2.5px)' },
            { value: '4', label: 'Thick  (4px)' },
          ]}
        />
      </Field>

      <Divider label="Visibility" />

      <Toggle
        label="Show Forecast Line"
        checked={cfg.showForecast !== false}
        onChange={v => set({ showForecast: v })}
      />

      <Toggle
        label="Show Data Points"
        checked={!!cfg.showDots}
        onChange={v => set({ showDots: v })}
      />

      <Toggle
        label="Show Value Labels"
        checked={!!cfg.showLabels}
        onChange={v => set({ showLabels: v })}
      />

      <Toggle
        label="Show Grid Lines"
        checked={cfg.showGrid !== false}
        onChange={v => set({ showGrid: v })}
      />
    </>
  )
}

// ── Pie / Donut Chart Config ──────────────────────────────────────────────────
// Controls: chart type (pie vs donut), colour palette,
//           show legend, show labels on slices, max slices
function PieConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })

  const PALETTES = [
    { value: 'default', label: 'Default  (Green/Blue/Amber)' },
    { value: 'warm', label: 'Warm     (Red/Orange/Yellow)' },
    { value: 'cool', label: 'Cool     (Blue/Teal/Indigo)' },
    { value: 'pastel', label: 'Pastel   (Soft tones)' },
  ]

  return (
    <>
      <Divider label="Chart Type" />

      <Field label="Style">
        <Select
          value={cfg.chartStyle || 'donut'}
          onChange={v => set({ chartStyle: v })}
          options={[
            { value: 'donut', label: 'Donut (hollow center)' },
            { value: 'pie', label: 'Pie   (filled)' },
          ]}
        />
      </Field>

      <Divider label="Data" />

      <Field label="Max Slices" hint="Rest grouped as 'Other'">
        <Select
          value={cfg.maxSlices ?? '6'}
          onChange={v => set({ maxSlices: v })}
          options={['3', '4', '5', '6', '8', '10'].map(v => ({ value: v, label: v }))}
        />
      </Field>

      <Divider label="Appearance" />

      <Field label="Color Palette">
        <Select
          value={cfg.palette || 'default'}
          onChange={v => set({ palette: v })}
          options={PALETTES}
        />
      </Field>

      <Divider label="Visibility" />

      <Toggle
        label="Show Legend"
        checked={cfg.showLegend !== false}
        onChange={v => set({ showLegend: v })}
      />

      <Toggle
        label="Show Slice Labels"
        checked={!!cfg.showLabels}
        onChange={v => set({ showLabels: v })}
      />

      <Toggle
        label="Show Percentage"
        checked={cfg.showPercent !== false}
        onChange={v => set({ showPercent: v })}
      />
    </>
  )
}

// ── Area Chart Config ─────────────────────────────────────────────────────────
// Controls: primary series (new/returning), colours for both series,
//           stacked vs overlapping, show labels, show grid, show legend
function AreaConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })
  return (
    <>
      <Divider label="Data" />

      <Field label="Primary Series">
        <Select
          value={cfg.yAxis || 'new'}
          onChange={v => set({ yAxis: v })}
          options={[
            { value: 'new', label: 'New Customers' },
            { value: 'returning', label: 'Returning Customers' },
          ]}
        />
      </Field>

      <Divider label="Appearance" />

      <ColorRow
        label="New Customers Color"
        value={cfg.color}
        defaultColor="#54bd95"
        onChange={v => set({ color: v })}
      />

      <ColorRow
        label="Returning Customers Color"
        value={cfg.color2}
        defaultColor="#3b82f6"
        onChange={v => set({ color2: v })}
      />

      <Field label="Fill Style">
        <Select
          value={cfg.fillStyle || 'gradient'}
          onChange={v => set({ fillStyle: v })}
          options={[
            { value: 'gradient', label: 'Gradient fill' },
            { value: 'solid', label: 'Solid fill' },
            { value: 'none', label: 'Lines only' },
          ]}
        />
      </Field>

      <Divider label="Visibility" />

      <Toggle
        label="Show Both Series"
        checked={cfg.showBothSeries !== false}
        onChange={v => set({ showBothSeries: v })}
      />

      <Toggle
        label="Show Value Labels"
        checked={!!cfg.showLabels}
        onChange={v => set({ showLabels: v })}
      />

      <Toggle
        label="Show Grid Lines"
        checked={cfg.showGrid !== false}
        onChange={v => set({ showGrid: v })}
      />

      <Toggle
        label="Show Legend"
        checked={cfg.showLegend !== false}
        onChange={v => set({ showLegend: v })}
      />
    </>
  )
}

// ── Scatter Plot Config ───────────────────────────────────────────────────────
// Controls: dot colour, dot opacity, dot size range,
//           show grid, show tooltip, X/Y axis labels
function ScatterConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })
  return (
    <>
      <Divider label="Appearance" />

      <ColorRow
        label="Dot Color"
        value={cfg.color}
        defaultColor="#54bd95"
        onChange={v => set({ color: v })}
      />

      <Field label="Dot Opacity">
        <Select
          value={cfg.opacity ?? '0.7'}
          onChange={v => set({ opacity: v })}
          options={[
            { value: '0.3', label: '30%  (Very light)' },
            { value: '0.5', label: '50%  (Light)' },
            { value: '0.7', label: '70%  (Normal)' },
            { value: '1', label: '100% (Solid)' },
          ]}
        />
      </Field>

      <Field label="Dot Size">
        <Select
          value={cfg.dotSize || 'medium'}
          onChange={v => set({ dotSize: v })}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
        />
      </Field>

      <Divider label="Visibility" />

      <Toggle
        label="Show Grid Lines"
        checked={cfg.showGrid !== false}
        onChange={v => set({ showGrid: v })}
      />

      <Toggle
        label="Show Axis Labels"
        checked={cfg.showAxisLabels !== false}
        onChange={v => set({ showAxisLabels: v })}
      />
    </>
  )
}

// ── Table Config ──────────────────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: 'id', label: 'Order ID' },
  { key: 'first_name', label: 'Customer' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'product', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unit_price', label: 'Unit Price' },
  { key: 'total_amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Date' },
]
const ALL_COLUMN_KEYS = ALL_COLUMNS.map(c => c.key)

function TableConfig({ cfg, onChange }) {
  const set = patch => onChange({ ...cfg, ...patch })
  const chosen = cfg.columns || ALL_COLUMN_KEYS

  function toggleCol(key) {
    const next = chosen.includes(key) ? chosen.filter(k => k !== key) : [...chosen, key]
    const ordered = ALL_COLUMN_KEYS.filter(k => next.includes(k))
    set({ columns: ordered })
  }

  return (
    <>
      <Divider label="Columns" />

      <Field label="Visible Columns">
        <div className="sf-col-list">
          {ALL_COLUMNS.map(col => (
            <label key={col.key} className="sf-check-row">
              <input
                type="checkbox"
                checked={chosen.includes(col.key)}
                onChange={() => toggleCol(col.key)}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      </Field>

      <Divider label="Sorting & Pagination" />

      <Field label="Default Sort By">
        <Select
          value={cfg.sortBy || 'created_at'}
          onChange={v => set({ sortBy: v })}
          options={ALL_COLUMNS.map(c => ({ value: c.key, label: c.label }))}
        />
      </Field>

      <Field label="Sort Order">
        <Select
          value={cfg.sortOrder || 'desc'}
          onChange={v => set({ sortOrder: v })}
          options={[
            { value: 'asc', label: '↑ Ascending' },
            { value: 'desc', label: '↓ Descending' },
          ]}
        />
      </Field>

      <Field label="Rows Per Page">
        <Select
          value={cfg.pageSize || '10'}
          onChange={v => set({ pageSize: v })}
          options={['5', '8', '10', '15', '20', '50'].map(v => ({ value: v, label: `${v} rows` }))}
        />
      </Field>

      <Divider label="Appearance" />

      <ColorRow
        label="Header Background"
        value={cfg.headerBg}
        defaultColor="#f9fafb"
        onChange={v => set({ headerBg: v })}
      />

      <ColorRow
        label="Row Stripe Color"
        value={cfg.stripeColor}
        defaultColor="#f9fafb"
        onChange={v => set({ stripeColor: v })}
      />

      <Divider label="Visibility" />

      <Toggle
        label="Striped Rows"
        checked={!!cfg.striped}
        onChange={v => set({ striped: v })}
      />

      <Toggle
        label="Show Row Borders"
        checked={cfg.showBorders !== false}
        onChange={v => set({ showBorders: v })}
      />

      <Toggle
        label="Compact Mode"
        checked={!!cfg.compact}
        onChange={v => set({ compact: v })}
      />
    </>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────
const TYPE_LABELS = {
  kpi: 'KPI Card',
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  area: 'Area Chart',
  scatter: 'Scatter Plot',
  table: 'Data Table',
}

export default function WidgetSettingsPanel() {
  const dispatch = useDispatch()
  const { widgets, selectedWidget } = useSelector(s => s.dashboard)
  const widget = widgets.find(w => w.id === selectedWidget)

  const [title, setTitle] = useState('')
  const [width, setWidth] = useState(4)
  const [height, setHeight] = useState(4)
  const [cfg, setCfg] = useState({})

  useEffect(() => {
    if (widget) {
      setTitle(widget.title || '')
      setWidth(widget.w || 4)
      setHeight(widget.h || 4)
      setCfg(JSON.parse(JSON.stringify(widget.config || {})))
    }
  }, [widget?.id])

  if (!widget) return null

  function handleApply() {
    dispatch(updateWidget({
      id: widget.id,
      title: title.trim() || widget.title,
      w: Math.max(1, Number(width) || 1),
      h: Math.max(1, Number(height) || 1),
      config: cfg,
    }))
    dispatch(selectWidget(null))
  }

  function renderTypeConfig() {
    switch (widget.type) {
      case 'kpi': return <KPIConfig cfg={cfg} onChange={setCfg} />
      case 'bar': return <BarConfig cfg={cfg} onChange={setCfg} />
      case 'line': return <LineConfig cfg={cfg} onChange={setCfg} />
      case 'pie': return <PieConfig cfg={cfg} onChange={setCfg} />
      case 'area': return <AreaConfig cfg={cfg} onChange={setCfg} />
      case 'scatter': return <ScatterConfig cfg={cfg} onChange={setCfg} />
      case 'table': return <TableConfig cfg={cfg} onChange={setCfg} />
      default: return null
    }
  }

  return (
    <aside className="settings-panel">
      <div className="settings-header">
        <div>
          <h3 className="settings-title">Widget Settings</h3>
          <span className="settings-type-badge">{TYPE_LABELS[widget.type] || widget.type}</span>
        </div>
        <button className="settings-close" onClick={() => dispatch(selectWidget(null))} title="Close">
          <X size={16} />
        </button>
      </div>

      <div className="settings-body">

        {/* ── Common: title + size ── */}
        <Field label="Widget Title">
          <Input value={title} onChange={setTitle} placeholder="Enter title" />
        </Field>

        <div className="sf-row">
          <Field label="Width (cols)">
            <Input type="number" value={width} onChange={setWidth} min={1} max={12} />
          </Field>
          <Field label="Height (rows)">
            <Input type="number" value={height} onChange={setHeight} min={1} max={20} />
          </Field>
        </div>

        <div className="sf-divider" />

        {/* ── Type-specific config ── */}
        {renderTypeConfig()}

      </div>

      <div className="settings-footer">
        <button className="btn-secondary" onClick={() => dispatch(selectWidget(null))}>Cancel</button>
        <button className="btn-primary" onClick={handleApply}><Save size={14} /> Apply</button>
      </div>
    </aside>
  )
}
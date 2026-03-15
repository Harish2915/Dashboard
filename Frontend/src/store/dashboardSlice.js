import { createSlice } from '@reduxjs/toolkit'

const ALL_BREAKPOINTS = ['xl', 'lg', 'md', 'sm']

// ─────────────────────────────────────────────────────────────────────────────
// findFirstFit — scans row-by-row, col-by-col and returns the first
// { x, y } where a widget of size (needW × needH) fits without overlapping.
// Falls back to { x:0, y:maxY } (append at bottom) if no gap found.
// ─────────────────────────────────────────────────────────────────────────────
function findFirstFit(existingWidgets, needW, needH, cols = 12) {
  if (!existingWidgets || existingWidgets.length === 0) return { x: 0, y: 0 }

  const w = Math.min(needW, cols)

  const occupied = new Set()
  existingWidgets.forEach(widget => {
    const wx = Number.isFinite(widget.x) ? widget.x : 0
    const wy = Number.isFinite(widget.y) ? widget.y : 0
    const ww = Number.isFinite(widget.w) ? widget.w : 1
    const wh = Number.isFinite(widget.h) ? widget.h : 1
    for (let row = wy; row < wy + wh; row++)
      for (let col = wx; col < wx + ww; col++)
        occupied.add(`${col},${row}`)
  })

  const maxY = Math.max(
    ...existingWidgets.map(widget =>
      (Number.isFinite(widget.y) ? widget.y : 0) +
      (Number.isFinite(widget.h) ? widget.h : 1)
    )
  )

  for (let cy = 0; cy <= maxY; cy++) {
    for (let cx = 0; cx <= cols - w; cx++) {
      let fits = true
      outer: for (let row = cy; row < cy + needH; row++) {
        for (let col = cx; col < cx + w; col++) {
          if (occupied.has(`${col},${row}`)) { fits = false; break outer }
        }
      }
      if (fits) return { x: cx, y: cy }
    }
  }

  return { x: 0, y: maxY }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    widgets: [],
    savedWidgets: [],
    savedLayout: null,
    sidebarCollapsed: false,
    sidebarOpen: false,
    selectedWidget: null,
    dateFilter: 'all',
    orders: [],
  },
  reducers: {
    toggleSidebar(state) { state.sidebarCollapsed = !state.sidebarCollapsed },
    toggleMobileSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    closeMobileSidebar(state) { state.sidebarOpen = false },

    addWidget(state, action) {
      const w = action.payload

      // Every catalog item now has a stable fixed id (set in ConfigurePage).
      // Block any duplicate — same protection for KPIs, charts, and tables.
      // Also protects against React StrictMode double-dispatch and hot-reload.
      const alreadyExists = state.widgets.some(existing => existing.id === w.id)
      if (alreadyExists) return

      const needsPlacement = !Number.isFinite(w.y) || w.y >= 9000

      if (needsPlacement) {
        // Find the first gap in the grid that fits this widget
        const { x, y } = findFirstFit(state.widgets, w.w || 4, w.h || 4, 12)
        state.widgets.push({ ...w, x, y })
      } else {
        // Restoring from backend — keep saved coordinates exactly
        state.widgets.push({ ...w })
      }
    },

    removeWidget(state, action) {
      state.widgets = state.widgets.filter(w => w.id !== action.payload)
      if (state.selectedWidget === action.payload) state.selectedWidget = null
    },

    updateWidget(state, action) {
      const payload = action.payload

      // FIX 1: Update state.widgets (used by configure page grid)
      const idx = state.widgets.findIndex(w => w.id === payload.id)
      if (idx !== -1) {
        state.widgets[idx] = { ...state.widgets[idx], ...payload }
      }

      // FIX 2: Also update state.savedWidgets (used by dashboard view).
      // Without this, changing title/config/size in the settings panel
      // has no effect on the live dashboard — savedWidgets kept the old values.
      const savedIdx = state.savedWidgets.findIndex(w => w.id === payload.id)
      if (savedIdx !== -1) {
        state.savedWidgets[savedIdx] = { ...state.savedWidgets[savedIdx], ...payload }
      }

      // FIX 3: Sync w/h into savedLayout for every breakpoint so the grid
      // respects the new size immediately without needing a full save.
      if (state.savedLayout) {
        ALL_BREAKPOINTS.forEach(bp => {
          if (state.savedLayout[bp]) {
            const item = state.savedLayout[bp].find(it => it.i === payload.id)
            if (item) {
              if (payload.w !== undefined) item.w = payload.w
              if (payload.h !== undefined) item.h = payload.h
            }
          }
        })
      }
    },

    updateLayout(state, action) {
      const { currentLayout, allLayouts } = action.payload

      if (currentLayout) {
        currentLayout.forEach(item => {
          const widget = state.widgets.find(w => w.id === item.i)
          if (widget) {
            widget.x = item.x
            widget.y = item.y
            widget.w = item.w
            widget.h = item.h
          }
        })
      }

      if (allLayouts) {
        state.savedLayout = JSON.parse(JSON.stringify(allLayouts))
      }
    },

    saveDashboard(state) {
      state.savedWidgets = JSON.parse(JSON.stringify(state.widgets))
        .map(w => ({ ...w, y: Number.isFinite(w.y) ? w.y : 0 }))

      if (state.savedLayout) {
        state.savedLayout = JSON.parse(JSON.stringify(state.savedLayout))
        ALL_BREAKPOINTS.forEach(bp => {
          if (state.savedLayout[bp]) {
            state.savedLayout[bp] = state.savedLayout[bp]
              .map(item => ({ ...item, y: Number.isFinite(item.y) ? item.y : 0 }))
          }
        })
      }
    },

    setSavedLayout(state, action) { state.savedLayout = action.payload },
    selectWidget(state, action) { state.selectedWidget = action.payload },
    setDateFilter(state, action) { state.dateFilter = action.payload },

    addOrder(state, action) { state.orders.push(action.payload) },
    updateOrder(state, action) {
      const idx = state.orders.findIndex(o => o.id === action.payload.id)
      if (idx !== -1) state.orders[idx] = action.payload
    },
    deleteOrder(state, action) {
      state.orders = state.orders.filter(o => o.id !== action.payload)
    },
  },
})

export const {
  toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
  addWidget, removeWidget, updateWidget, updateLayout,
  saveDashboard, setSavedLayout,
  selectWidget, setDateFilter,
  addOrder, updateOrder, deleteOrder,
} = dashboardSlice.actions

export default dashboardSlice.reducer
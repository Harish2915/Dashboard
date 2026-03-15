import React, { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useSelector } from 'react-redux'
import { api } from '../../services/api'
import './Styles/TableWidget.css'

const ALL_COLUMNS = [
  { key: 'id', label: 'Order ID', sortable: true },
  { key: 'first_name', label: 'Customer', sortable: true },
  { key: 'last_name', label: 'Last Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'product', label: 'Product', sortable: false },
  { key: 'quantity', label: 'Qty', sortable: true },
  { key: 'unit_price', label: 'Unit $', sortable: true },
  { key: 'total_amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Date', sortable: true },
]

const STATUS_CLASS = {
  Delivered: 'badge-green',
  Processing: 'badge-blue',
  Shipped: 'badge-blue',
  Cancelled: 'badge-red',
  Pending: 'badge-yellow',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function TableWidget({ title, config = {} }) {
  const { dateFilter } = useSelector(s => s.dashboard)

  // config.columns   — array of column keys to show
  // config.sortBy    — default sort key
  // config.sortOrder — 'asc' | 'desc'
  // config.pageSize  — rows per page
  // config.headerBg  — header background color
  const visibleKeys = config.columns || ALL_COLUMNS.map(c => c.key)
  const defaultSort = config.sortBy || 'created_at'
  const defaultDir = config.sortOrder || 'desc'
  const pageSize = parseInt(config.pageSize || '8', 10)
  const headerBg = config.headerBg || '#fafafa'

  const visibleCols = ALL_COLUMNS.filter(c => visibleKeys.includes(c.key))

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortKey, setSortKey] = useState(defaultSort)
  const [sortDir, setSortDir] = useState(defaultDir)

  // Reset sort + page whenever any config property that affects display changes.
  // config.columns is included so the table re-renders correct columns immediately
  // after the user toggles them in the settings panel.
  useEffect(() => {
    setPage(1)
    setSortKey(config.sortBy || 'created_at')
    setSortDir(config.sortOrder || 'desc')
  }, [config.sortBy, config.sortOrder, config.pageSize, config.columns])

  useEffect(() => {
    setLoading(true)
    api.getOrders(page, pageSize, '', dateFilter)
      .then(res => {
        setData(res.orders)
        setTotal(res.total)
        setTotalPages(res.total_pages)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, dateFilter, pageSize])

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    let va = a[sortKey]
    let vb = b[sortKey]
    if (sortKey === 'total_amount' || sortKey === 'quantity' || sortKey === 'unit_price') {
      va = Number(va); vb = Number(vb)
    } else {
      va = String(va ?? ''); vb = String(vb ?? '')
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function renderCell(row, key) {
    switch (key) {
      case 'total_amount':
      case 'unit_price': return `$${parseFloat(row[key] || 0).toFixed(2)}`
      case 'created_at': return formatDate(row[key])
      case 'status':
        return (
          <span className={`badge ${STATUS_CLASS[row.status] || 'badge-gray'}`}>
            {row.status}
          </span>
        )
      case 'first_name': return `${row.first_name} ${row.last_name}`
      default: return row[key] ?? '—'
    }
  }

  return (
    <div className="widget-card table-widget">
      <div className="widget-header">
        <div className="widget-title">{title || 'Recent Orders'}</div>
        <span className="table-count">{total.toLocaleString()} orders</span>
      </div>

      <div className="widget-body table-body">
        {loading ? (
          <div className="table-loading">Loading...</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead style={{ background: headerBg }}>
                <tr>
                  {visibleCols.map(col => (
                    <th
                      key={col.key}
                      className={col.sortable ? 'sortable' : ''}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      {col.label}
                      {col.sortable && (
                        <span className="sort-icons">
                          <ChevronUp size={10} className={sortKey === col.key && sortDir === 'asc' ? 'active' : ''} />
                          <ChevronDown size={10} className={sortKey === col.key && sortDir === 'desc' ? 'active' : ''} />
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No orders yet
                    </td>
                  </tr>
                ) : sorted.map(row => (
                  <tr key={row.id}>
                    {visibleCols.map(col => (
                      <td key={col.key} className={col.key === 'id' ? 'td-id' : ''}>
                        {renderCell(row, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="table-pagination">
        <span className="pagination-info">Page {page} of {totalPages}</span>
        <div className="pagination-btns">
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
        </div>
      </div>
    </div>
  )
}
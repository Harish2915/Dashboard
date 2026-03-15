import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Search, ChevronDown } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../services/api'
import { setDateFilter } from '../store/dashboardSlice'
import { DATE_FILTERS } from '../utils/dateFilters'
import './CustomerOrders.css'

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Singapore', 'Other']
const PRODUCTS = ['MacBook Pro', 'iPhone 15', 'iPad Air', 'AirPods Max', 'Apple Watch', 'Samsung S24', 'Dell XPS 15', 'Sony WH-1000XM5']
const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const CREATED_BY = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Lee']

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '',
  street: '', city: '', state: '', postal_code: '', country: '',
  product: '', quantity: '1', unit_price: '', total_amount: '',
  status: 'Pending', created_by: '',
}

const REQUIRED = [
  'first_name', 'last_name', 'email', 'phone',
  'street', 'city', 'state', 'postal_code', 'country',
  'product', 'quantity', 'unit_price', 'status', 'created_by',
]

function getStatusBadgeClass(status) {
  const map = {
    Delivered: 'badge-green', Processing: 'badge-blue',
    Shipped: 'badge-blue', Pending: 'badge-yellow', Cancelled: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export default function CustomerOrders() {
  const dispatch = useDispatch()
  const { dateFilter } = useSelector(s => s.dashboard)

  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatus] = useState('')
  const [searchQuery, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Reload whenever page, status tab, or date filter changes
  useEffect(() => {
    loadOrders()
  }, [page, statusFilter, dateFilter])

  // Debounced search — resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadOrders()
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await api.getOrders(page, 10, statusFilter, dateFilter)
      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch (err) {
      console.error('Failed to load orders:', err)
    }
    setLoading(false)
  }

  // Client-side search filter on the current page's rows
  const filteredOrders = searchQuery.trim() === ''
    ? orders
    : orders.filter(o => {
      const q = searchQuery.toLowerCase()
      return (
        o.id?.toLowerCase().includes(q) ||
        o.first_name?.toLowerCase().includes(q) ||
        o.last_name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.product?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q) ||
        o.created_by?.toLowerCase().includes(q)
      )
    })

  function openCreate() {
    setEditingOrder(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true)
  }

  function openEdit(order) {
    setEditingOrder(order)
    setForm({
      first_name: order.first_name, last_name: order.last_name,
      email: order.email, phone: order.phone, street: order.street,
      city: order.city, state: order.state, postal_code: order.postal_code,
      country: order.country, product: order.product,
      quantity: String(order.quantity), unit_price: String(order.unit_price),
      total_amount: String(order.total_amount), status: order.status,
      created_by: order.created_by,
    })
    setErrors({}); setShowModal(true)
  }

  function closeModal() {
    setShowModal(false); setEditingOrder(null); setErrors({})
  }

  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    if (name === 'quantity' || name === 'unit_price') {
      const qty = parseFloat(name === 'quantity' ? value : updated.quantity) || 0
      const price = parseFloat(name === 'unit_price' ? value : updated.unit_price) || 0
      updated.total_amount = (qty * price).toFixed(2)
    }
    setForm(updated)
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const newErrors = {}
    REQUIRED.forEach(field => {
      if (!form[field] || form[field].toString().trim() === '')
        newErrors[field] = 'Please fill the field'
    })
    return newErrors
  }

  async function handleSubmit() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setSaving(true)
    const payload = {
      ...form,
      quantity: parseInt(form.quantity),
      unit_price: parseFloat(form.unit_price),
      total_amount: parseFloat(form.total_amount),
    }
    try {
      if (editingOrder) await api.updateOrder(editingOrder.id, payload)
      else await api.createOrder(payload)
      closeModal(); loadOrders()
    } catch (err) {
      console.error('Failed to save order:', err)
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    try { await api.deleteOrder(id); loadOrders() }
    catch (err) { console.error('Failed to delete order:', err) }
  }

  return (
    <div className="orders-page">

      {/* ── Page header ── */}
      <div className="orders-header">
        <h2 className="page-heading">Customer Orders</h2>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      {/* ── Filters bar: date filter + status tabs + search ── */}
      <div className="orders-filters-bar">

        {/* Date filter — same as dashboard */}
        <div className="orders-date-filter">
          <label className="orders-filter-label">Date</label>
          <div className="orders-filter-select-wrap">
            <select
              className="orders-filter-select"
              value={dateFilter}
              onChange={e => {
                dispatch(setDateFilter(e.target.value))
                setPage(1)
              }}
            >
              {DATE_FILTERS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="orders-filter-arrow" />
          </div>
        </div>

        {/* Status tabs */}
        <div className="orders-tabs">
          {['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button
              key={s}
              className={`orders-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatus(s); setPage(1) }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="orders-search">
          <Search size={14} className="orders-search-icon" />
          <input
            className="orders-search-input"
            placeholder="Search orders, customer, product…"
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="orders-search-clear" onClick={() => setSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Orders table ── */}
      <div className="orders-table-wrap card">
        {loading ? (
          <div className="orders-empty">Loading…</div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            {searchQuery ? `No orders matching "${searchQuery}"` : 'No orders found.'}
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>
                    <div className="customer-cell">
                      <span>{order.first_name} {order.last_name}</span>
                    </div>
                  </td>
                  <td>{order.product}</td>
                  <td>{order.quantity}</td>
                  <td className="amount-cell">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.created_by}</td>
                  <td>
                    <div className="table-actions">
                      <button className="tbl-btn edit" onClick={() => openEdit(order)} title="Edit"><Pencil size={14} /></button>
                      <button className="tbl-btn delete" onClick={() => handleDelete(order.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <span>{total} orders · Page {page} of {totalPages}</span>
          <div className="pagination-btns">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingOrder ? 'Edit Order' : 'Create Order'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-section-title">Customer Information</div>
              <div className="form-grid">
                <Field label="First Name" name="first_name" form={form} errors={errors} onChange={handleChange} required />
                <Field label="Last Name" name="last_name" form={form} errors={errors} onChange={handleChange} required />
                <Field label="Email" name="email" form={form} errors={errors} onChange={handleChange} required type="email" />
                <Field label="Phone" name="phone" form={form} errors={errors} onChange={handleChange} required />
                <Field label="Street Address" name="street" form={form} errors={errors} onChange={handleChange} required span2 />
                <Field label="City" name="city" form={form} errors={errors} onChange={handleChange} required />
                <Field label="State" name="state" form={form} errors={errors} onChange={handleChange} required />
                <Field label="Postal Code" name="postal_code" form={form} errors={errors} onChange={handleChange} required />
                <SelectField label="Country" name="country" form={form} errors={errors} onChange={handleChange} options={COUNTRIES} placeholder="Select country" required />
              </div>

              <div className="form-section-title">Order Information</div>
              <div className="form-grid">
                <SelectField label="Product" name="product" form={form} errors={errors} onChange={handleChange} options={PRODUCTS} placeholder="Select product" required />
                <Field label="Quantity" name="quantity" form={form} errors={errors} onChange={handleChange} required type="number" />
                <Field label="Unit Price ($)" name="unit_price" form={form} errors={errors} onChange={handleChange} required type="number" />
                <div className="form-field">
                  <label className="form-label">Total Amount ($)</label>
                  <input className="form-input" value={form.total_amount} readOnly style={{ background: '#f9fafb', color: 'var(--text-secondary)' }} />
                </div>
                <SelectField label="Status" name="status" form={form} errors={errors} onChange={handleChange} options={STATUSES} required />
                <SelectField label="Created By" name="created_by" form={form} errors={errors} onChange={handleChange} options={CREATED_BY} placeholder="Select person" required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving…' : editingOrder ? 'Save Changes' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, name, type = 'text', form, errors, onChange, required, span2 }) {
  return (
    <div className={`form-field ${span2 ? 'span-2' : ''}`}>
      <label className="form-label">{label} {required && <span className="required-star">*</span>}</label>
      <input className={`form-input ${errors[name] ? 'has-error' : ''}`} type={type} name={name} value={form[name]} onChange={onChange} placeholder={label} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  )
}

function SelectField({ label, name, form, errors, onChange, options, placeholder, required }) {
  return (
    <div className="form-field">
      <label className="form-label">{label} {required && <span className="required-star">*</span>}</label>
      <select className={`form-input ${errors[name] ? 'has-error' : ''}`} name={name} value={form[name]} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  )
}
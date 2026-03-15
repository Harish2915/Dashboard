// api.js - all calls to the FastAPI backend

const BASE_URL = "http://localhost:8000/api"

async function fetchJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
  return res.json()
}

async function postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
  return res.json()
}

async function putJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
  return res.json()
}

async function deleteReq(path) {
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE" })
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`)
}

export const api = {
  // ── Dashboard chart data ───────────────────────────────────────────────
  getKPIs(dateFilter = "all") {
    return fetchJSON(`/dashboard/kpis?date_filter=${dateFilter}`)
  },

  getSalesData(dateFilter = "all") {
    return fetchJSON(`/dashboard/sales?date_filter=${dateFilter}`)
  },

  getRevenueTrend(dateFilter = "all") {
    return fetchJSON(`/dashboard/trend?date_filter=${dateFilter}`)
  },

  getCategoryData(dateFilter = "all") {
    return fetchJSON(`/dashboard/categories?date_filter=${dateFilter}`)
  },

  getTrafficData(dateFilter = "all") {
    return fetchJSON(`/dashboard/traffic?date_filter=${dateFilter}`)
  },

  getScatterData(dateFilter = "all") {
    return fetchJSON(`/dashboard/scatter?date_filter=${dateFilter}`)
  },

  // ── Dashboard layout ───────────────────────────────────────────────────
  saveLayout(widgets) {
    return postJSON("/dashboard/layout", { name: "default", widgets })
  },

  loadLayout() {
    return fetchJSON("/dashboard/layout?name=default")
  },

  // ── Orders CRUD ────────────────────────────────────────────────────────
  getOrders(page = 1, limit = 10, status = "", dateFilter = "all") {
    return fetchJSON(
      `/orders?page=${page}&limit=${limit}&status=${status}&date_filter=${dateFilter}`
    )
  },

  createOrder(orderData) {
    return postJSON("/orders", orderData)
  },

  updateOrder(orderId, orderData) {
    return putJSON(`/orders/${orderId}`, orderData)
  },

  deleteOrder(orderId) {
    return deleteReq(`/orders/${orderId}`)
  },
}
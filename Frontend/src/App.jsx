import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './components/layout/Sidebar'
import TopNavbar from './components/layout/TopNavbar'
import Dashboard from './pages/Dashboard'
import ConfigurePage from './pages/ConfigurePage'
import CustomerOrders from './pages/CustomerOrders'

export default function App() {
  const { sidebarCollapsed } = useSelector(s => s.dashboard)

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <TopNavbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/configure" element={<ConfigurePage />} />
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
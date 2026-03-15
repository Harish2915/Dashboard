import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, ShoppingCart, Layers, Zap, X, LogOut } from 'lucide-react'
import { toggleSidebar, closeMobileSidebar } from '../../store/dashboardSlice'
import './Sidebar.css'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Layers, label: 'Configure', path: '/configure' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const location = useLocation()
  // sidebarCollapsed = desktop icon-only mode
  // sidebarOpen      = mobile drawer is open
  const { sidebarCollapsed, sidebarOpen } = useSelector(s => s.dashboard)

  // On mobile, always show labels regardless of sidebarCollapsed
  // Only collapse to icons on desktop when sidebarCollapsed is true
  const showLabels = sidebarOpen || !sidebarCollapsed

  return (
    <>
      {/* Mobile: dark overlay behind sidebar */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'mobile-open' : ''}`}>

        {/* Logo row — click on desktop to collapse/expand */}
        <div
          className="sidebar-logo"
          onClick={() => dispatch(toggleSidebar())}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="logo-icon">
            <Zap size={15} />
          </div>

          {/* Show brand text when labels are visible */}
          {showLabels && <span className="logo-brand">Halleyx</span>}

          {/* Mobile: X button to close the drawer */}
          {sidebarOpen && (
            <button
              className="close-btn"
              onClick={e => { e.stopPropagation(); dispatch(closeMobileSidebar()) }}
              title="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {showLabels && <span className="nav-section-label">MAIN MENU</span>}

          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path
            return (
              <NavLink
                key={path}
                to={path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                title={!showLabels ? label : undefined}
                onClick={() => dispatch(closeMobileSidebar())}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                {/* Always show label on mobile open; only show on desktop if not collapsed */}
                {showLabels && <span className="nav-label">{label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* User at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">JD</div>
            {showLabels && (
              <>
                <div className="user-info">
                  <div className="user-name">John Doe</div>
                  <div className="user-role">Admin</div>
                </div>
                <button className="user-logout" title="Logout">
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>

      </aside>
    </>
  )
}
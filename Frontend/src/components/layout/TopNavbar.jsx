import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, ChevronRight } from 'lucide-react'
import { toggleMobileSidebar } from '../../store/dashboardSlice'
import './TopNavbar.css'

const BREADCRUMBS = {
  '/dashboard': [
    { label: 'Home', path: '/dashboard' },
    { label: 'Dashboard', path: '/dashboard' },
  ],
  '/configure': [
    { label: 'Home', path: '/dashboard' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Configure', path: '/configure' },
  ],
  '/orders': [
    { label: 'Home', path: '/dashboard' },
    { label: 'Orders', path: '/orders' },
  ],
}

export default function TopNavbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed } = useSelector(s => s.dashboard)

  const crumbs = BREADCRUMBS[location.pathname] || [{ label: 'Home', path: '/dashboard' }]

  return (
    <header className={`topnav ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topnav-left">
        {/* Hamburger — mobile only.
            On desktop the sidebar logo handles collapse/expand */}
        <button
          className="mobile-menu-btn"
          onClick={() => dispatch(toggleMobileSidebar())}
          title="Open menu"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb navigation */}
        <nav className="topnav-breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <span key={crumb.path + i} className="bc-wrap">
                {i > 0 && <ChevronRight size={12} className="bc-sep" aria-hidden="true" />}
                {isLast ? (
                  <span className="bc-item bc-current" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    className="bc-item bc-link"
                    onClick={() => navigate(crumb.path)}
                  >
                    {crumb.label}
                  </button>
                )}
              </span>
            )
          })}
        </nav>
      </div>

      {/* Right side: user avatar */}
      <div className="topnav-right">
        <div className="topnav-user">
          <div className="topnav-avatar">JD</div>
        </div>
      </div>
    </header>
  )
}
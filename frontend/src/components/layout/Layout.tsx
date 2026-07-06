import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  to: string
  icon: string
  label: string
  id: string
}

const navItems: NavItem[] = [
  { to: '/', icon: '🏠', label: 'Tổng Quan', id: 'nav-home' },
  { to: '/chat', icon: '💬', label: 'Chat Sandbox', id: 'nav-chat' },
  { to: '/documents', icon: '📁', label: 'Tài Liệu', id: 'nav-documents' },
  { to: '/experiments', icon: '🧪', label: 'Thử Nghiệm', id: 'nav-experiments' },
  { to: '/dashboard', icon: '📊', label: 'Dashboard', id: 'nav-dashboard' },
]

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const userName = localStorage.getItem('user_name') || 'Khách'

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_name')
    navigate('/login')
  }

  const currentPage = navItems.find(n => n.to === location.pathname)?.label || 'ChatBot Nhóm 9'

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} 
          ${isMobile ? 'fixed left-0 top-0 h-full z-30' : 'relative'}
          flex-shrink-0 flex flex-col
          bg-surface-card border-r border-surface-border
          transition-all duration-300 ease-in-out overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-surface-border min-h-[64px]">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-500/30">
            N9
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-100 whitespace-nowrap">ChatBot Nhóm 9</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">RAG & Benchmarking</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-sm shadow-brand-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }
              `}
            >
              <span className="text-lg flex-shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
              {sidebarOpen && (
                <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
              )}
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-surface-card border border-surface-border rounded-lg text-xs text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-surface-border">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-hover transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {userName[0]?.toUpperCase() || 'K'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{userName}</p>
                  <p className="text-xs text-slate-600">Thành viên</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded"
                  title="Đăng xuất"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-surface-border bg-surface-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-surface-hover transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">{currentPage}</h2>
              <p className="text-xs text-slate-600 hidden md:block">ChatBot Học Tập — RAG System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">API Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

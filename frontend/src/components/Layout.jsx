import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: '▦' },
  { label: 'Requests', path: '/requests', icon: '＋' },
  { label: 'Risk Reviews', path: '/risk-reviews', icon: '✓' },
  { label: 'Reference Data', path: '/reference-data', icon: '≡' }
]

function Layout() {
  return <div className="app-frame"><aside className="sidebar"><div className="brand-lockup"><span className="brand-mark">P</span><h2>Procurement Control</h2><p>Approval and risk review</p></div><p className="nav-label">Workspace</p><nav className="nav-list" aria-label="Main navigation">{navigation.map((item) => <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={item.path} key={item.path}><span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</NavLink>)}</nav><div className="sidebar-footer">MVP workflow · 2026</div></aside><main className="main-area"><header className="topbar"><span className="topbar-context">Procurement / approval workflow</span></header><Outlet /></main></div>
}

export default Layout

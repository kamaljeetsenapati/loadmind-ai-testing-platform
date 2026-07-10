import React from 'react'
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreateTest from './pages/CreateTest'
import LiveMonitoring from './pages/LiveMonitoring'
import CompareBaseline from './pages/CompareBaseline'
import AIReports from './pages/AIReports'

function Layout({ children }) {
  const location = useLocation()
  const path = location.pathname

  const isLinkActive = (targetPath) => {
    if (targetPath === '/' && path === '/') return true
    if (targetPath !== '/' && path.startsWith(targetPath)) return true
    return false
  }

  const linkClass = (targetPath) => {
    return isLinkActive(targetPath)
      ? "flex items-center gap-3 px-3 py-2.5 bg-primary-container text-on-primary-container rounded-lg translate-x-1 transition-transform group"
      : "flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-150 rounded-lg group"
  }

  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      <div className="fixed inset-0 grid-bg pointer-events-none z-0"></div>
      
      {/* SideNavBar */}
      <nav className="bg-surface-container-low text-primary font-label-md text-label-md left-0 h-full w-64 border-r border-outline-variant flex flex-col p-4 gap-unit hidden md:flex shrink-0 z-10 relative">
        <div className="mb-8 px-2 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
            <span className="font-display text-headline-md font-bold text-primary">LoadMind AI</span>
          </div>
          <span className="text-on-surface-variant text-[11px] uppercase tracking-wider ml-11">V1.2.4-stable</span>
        </div>
        
        <div className="flex-1 flex flex-col gap-1">
          <Link to="/" className={linkClass('/')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/create-test" className={linkClass('/create-test')}>
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create Test</span>
          </Link>
          <Link to="/live-monitoring" className={linkClass('/live-monitoring')}>
            <span className="material-symbols-outlined">timeline</span>
            <span>Live Monitoring</span>
          </Link>
          <Link to="/compare" className={linkClass('/compare')}>
            <span className="material-symbols-outlined">compare_arrows</span>
            <span>Run Comparison</span>
          </Link>
          <Link to="/reports" className={linkClass('/reports')}>
            <span className="material-symbols-outlined">assessment</span>
            <span>AI Reports</span>
          </Link>
        </div>
        
        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/30">
          <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">menu_book</span>
            <span>Documentation</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-150 rounded-lg" href="#">
            <span className="material-symbols-outlined">support_agent</span>
            <span>Support</span>
          </a>
          <button className="mt-4 w-full py-2 px-4 bg-transparent border border-outline-variant text-primary hover:bg-surface-container-high transition-colors duration-200 rounded-lg font-label-md flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span>Upgrade Plan</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-16 z-50 bg-background border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant p-2 -ml-2 hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface hidden md:block">
              {path === '/' && "System Overview"}
              {path === '/create-test' && "Create New Test"}
              {path === '/live-monitoring' && "Real-Time Performance Monitoring"}
              {path === '/compare' && "Baseline Comparison"}
              {path === '/reports' && "AI Performance Report"}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/50 bg-[#111111]">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">Project: Production-v1</span>
            </div>
            <div className="h-6 w-px bg-outline-variant/50 hidden md:block"></div>
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2 rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
              </button>
              <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2 rounded-full transition-colors hidden sm:block">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
              <Link to="/create-test" className="bg-[#0059c5] text-white hover:bg-primary-container px-4 py-1.5 rounded-lg font-label-md text-label-md transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>New Test</span>
              </Link>
              <button className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/50 hover:border-primary transition-colors ml-2 shrink-0">
                <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxgOYminooFq3pG1VwJRt1dYnx3kM8GNCw0OllWubCIRAVNbrJJu1MVbEzv9YnWIGHXizWliRCfQT3z0f0qxJ4d9gT5h0lefGzR5kl5H9JAu65uwSPped1QK0C8Q4fM3TgBPHnN8BoEhlqOsudzxn-50B8uxiPoeddOaCUaNBbGvyBFp5Vx4nPflYQ4DA_XSWZxgj5lefAGBJXroTSkwo9dhdBu4RwR9Vi_3kYOU1kkNRUegW0mmUzG9_wugZ8Ark9Ge-jq5HsKT0a" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/compare" element={<CompareBaseline />} />
          <Route path="/reports" element={<AIReports />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

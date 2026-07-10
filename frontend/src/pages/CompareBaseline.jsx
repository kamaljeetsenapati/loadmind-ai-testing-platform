import React, { useState, useEffect } from 'react'

export default function CompareBaseline() {
  const [baselines, setBaselines] = useState([])
  const [selectedBaseline, setSelectedBaseline] = useState(null)
  const [activeTab, setActiveTab] = useState("Prod") // Prod, Stage, QA
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Comparative data state
  const [comparisonMetrics, setComparisonMetrics] = useState({
    avgRt: 142,
    baseRt: 161,
    maxRps: 4250,
    baseRps: 4100,
    errorRate: 1.2,
    baseErrorRate: 0.8,
    perfScore: 94,
    basePerfScore: 89
  })

  useEffect(() => {
    // Fetch baselines from backend
    fetch('/api/baselines')
      .then(res => res.json())
      .then(data => {
        setBaselines(data)
        // Select Prod baseline as default
        const prodBase = data.find(b => b.environment === "Prod" && b.status === "Current Baseline")
        if (prodBase) {
          setSelectedBaseline(prodBase)
          updateComparativeData(prodBase)
        } else if (data.length > 0) {
          setSelectedBaseline(data[0])
          updateComparativeData(data[0])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch baselines, using fallback mock data", err)
        const mockBaselines = [
          { id: 1, name: "Production-v1 (Oct 12)", environment: "Prod", status: "Current Baseline", avg_response_time: 161, max_rps: 4100, error_rate: 0.8, perf_score: 89 },
          { id: 2, name: "Staging-v2 (Oct 10)", environment: "Stage", status: "Stable Release", avg_response_time: 145, max_rps: 4500, error_rate: 0.2, perf_score: 95 },
          { id: 3, name: "Legacy-v1.4 (Sept 28)", environment: "Prod", status: "Previous Major", avg_response_time: 185, max_rps: 3800, error_rate: 1.5, perf_score: 82 }
        ]
        setBaselines(mockBaselines)
        setSelectedBaseline(mockBaselines[0])
        updateComparativeData(mockBaselines[0])
        setLoading(false)
      })
  }, [])

  const updateComparativeData = (baseline) => {
    setComparisonMetrics({
      avgRt: 142,
      baseRt: baseline.avg_response_time,
      maxRps: 4250,
      baseRps: baseline.max_rps,
      errorRate: 1.2,
      baseErrorRate: baseline.error_rate,
      perfScore: 94,
      basePerfScore: baseline.perf_score
    })
  }

  const handleSelectBaseline = (baseline) => {
    setSelectedBaseline(baseline)
    updateComparativeData(baseline)
    setDropdownOpen(false)
  }

  const getDeltaPercent = (val, base) => {
    if (base === 0) return 0
    return ((val - base) / base * 100).toFixed(1)
  }

  const getDeltaScore = () => {
    if (!selectedBaseline) return "+18%"
    // Simple custom formula for mock delta progress circle
    const diff = comparisonMetrics.baseRt - comparisonMetrics.avgRt
    const pct = (diff / comparisonMetrics.baseRt * 100).toFixed(0)
    return pct > 0 ? `+${pct}%` : `${pct}%`
  }

  const filteredBaselines = baselines.filter(b => {
    const matchesTab = b.environment === activeTab
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  if (loading || !selectedBaseline) {
    return <div className="p-8 text-center text-on-surface-variant font-code-sm">Loading baseline run comparison data...</div>
  }

  return (
    <div className="max-w-container-max mx-auto p-gutter md:p-margin-desktop space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <a className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-sm" href="#/">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Overview
            </a>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Run Comparison</h1>
          <p className="text-on-surface-variant font-body-md text-body-md max-w-2xl">
            Analyzing differential performance metrics between current branch and stable production baseline.
          </p>
        </div>

        {/* Selected Runs Pill View */}
        <div className="flex gap-4">
          <div className="bento-card px-4 py-2 flex flex-col gap-1 border-primary/30">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-code-sm">Current Run</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-md text-primary font-bold">#4092</span>
            </div>
          </div>
          <div className="flex items-center text-outline-variant">
            <span className="material-symbols-outlined">compare_arrows</span>
          </div>

          {/* Interactive Dropdown Button */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bento-card px-4 py-2 flex flex-col gap-1 border-outline-variant border-dashed hover:border-primary transition-colors text-left w-64"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-code-sm">Baseline Reference</span>
                <span className="material-symbols-outlined text-[14px] text-outline-variant">expand_more</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                <span className="font-label-md text-on-surface">{selectedBaseline.name}</span>
              </div>
            </button>

            {/* Dropdown Menu Popup */}
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-surface-container-high border border-outline-variant rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded px-2 py-1.5 mb-3">
                    <span className="material-symbols-outlined text-sm text-outline-variant">search</span>
                    <input 
                      className="bg-transparent border-none outline-none text-xs text-on-surface w-full focus:ring-0 p-0" 
                      placeholder="Search baselines..." 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">Environment</span>
                    <div className="flex bg-surface-container rounded p-0.5">
                      {["Prod", "Stage", "QA"].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
                          className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                            activeTab === tab ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {filteredBaselines.length > 0 ? (
                    filteredBaselines.map(base => (
                      <button 
                        key={base.id}
                        onClick={() => handleSelectBaseline(base)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-surface-container-highest flex flex-col gap-0.5 border-l-2 ${
                          selectedBaseline.id === base.id ? 'border-primary bg-primary/5' : 'border-transparent'
                        }`}
                      >
                        <span className="text-xs font-medium text-on-surface">{base.name}</span>
                        <span className="text-[10px] text-primary">{base.status}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-on-surface-variant">No baselines found in {activeTab}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top KPI Row (Spans full width) */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Response Time */}
          <div className="bento-card p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-on-surface-variant text-sm">Avg Response Time</span>
              <span className="material-symbols-outlined text-outline-variant text-sm">schedule</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-on-surface">{comparisonMetrics.avgRt}<span className="text-lg text-on-surface-variant ml-1">ms</span></span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-on-surface-variant line-through opacity-70">{comparisonMetrics.baseRt}ms</span>
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-code-sm text-[11px] ${
                comparisonMetrics.avgRt <= comparisonMetrics.baseRt ? 'text-secondary bg-secondary/10' : 'text-error bg-error/10'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {comparisonMetrics.avgRt <= comparisonMetrics.baseRt ? 'arrow_downward' : 'arrow_upward'}
                </span>
                {getDeltaPercent(comparisonMetrics.avgRt, comparisonMetrics.baseRt)}%
              </div>
            </div>
          </div>

          {/* Card 2: Max RPS */}
          <div className="bento-card p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-on-surface-variant text-sm">Max RPS</span>
              <span className="material-symbols-outlined text-outline-variant text-sm">speed</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-on-surface">{comparisonMetrics.maxRps.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-on-surface-variant line-through opacity-70">{comparisonMetrics.baseRps.toLocaleString()}</span>
              <div className="flex items-center gap-1 text-secondary bg-secondary/10 px-1.5 py-0.5 rounded font-code-sm text-[11px]">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                +{getDeltaPercent(comparisonMetrics.maxRps, comparisonMetrics.baseRps)}%
              </div>
            </div>
          </div>

          {/* Card 3: Error Rate */}
          <div className="bento-card p-4 flex flex-col justify-between relative overflow-hidden border-error/30 bg-error/5">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-on-surface-variant text-sm">Error Rate</span>
              <span className="material-symbols-outlined text-error text-sm">error</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-error">{comparisonMetrics.errorRate}<span className="text-lg text-error/70 ml-1">%</span></span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-on-surface-variant line-through opacity-70">{comparisonMetrics.baseErrorRate}%</span>
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-code-sm text-[11px] ${
                comparisonMetrics.errorRate <= comparisonMetrics.baseErrorRate ? 'text-secondary bg-secondary/10' : 'text-error bg-error/10'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {comparisonMetrics.errorRate <= comparisonMetrics.baseErrorRate ? 'arrow_downward' : 'arrow_upward'}
                </span>
                {comparisonMetrics.errorRate > comparisonMetrics.baseErrorRate ? '+' : ''}
                {(comparisonMetrics.errorRate - comparisonMetrics.baseErrorRate).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Card 4: AI score */}
          <div className="bento-card p-4 flex flex-col justify-between relative overflow-hidden border-primary-container/30 bg-primary-container/5">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-md text-primary text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">psychology</span>
                AI Perf Score
              </span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display text-3xl text-primary glow-text">{comparisonMetrics.perfScore}<span className="text-lg text-primary/70 ml-1">/100</span></span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm relative z-10">
              <span className="text-on-surface-variant line-through opacity-70">{comparisonMetrics.basePerfScore}</span>
              <div className="flex items-center gap-1 text-secondary bg-secondary/10 px-1.5 py-0.5 rounded font-code-sm text-[11px]">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                +{comparisonMetrics.perfScore - comparisonMetrics.basePerfScore}pts
              </div>
            </div>
          </div>

        </div>

        {/* Main Chart Area (Col 1-8) */}
        <div className="lg:col-span-8 bento-card flex flex-col h-[400px]">
          <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">stacked_line_chart</span>
              Response Time Comparison Over Time
            </h3>
            <div className="flex gap-4 font-label-md text-[12px]">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-3 h-0.5 bg-primary"></div> Run #4092
              </div>
              <div className="flex items-center gap-2 text-outline-variant">
                <div className="w-3 h-0.5 bg-outline-variant border border-dashed"></div> Baseline ({selectedBaseline.name})
              </div>
            </div>
          </div>

          <div className="flex-1 relative p-4 w-full h-full overflow-hidden">
            {/* Grid lines Y */}
            <div className="absolute inset-4 border-l border-b border-outline-variant/30 flex items-end">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px bg-outline-variant/10"></div>
                <div className="w-full h-px bg-outline-variant/10"></div>
                <div className="w-full h-px bg-outline-variant/10"></div>
                <div className="w-full h-px bg-outline-variant/10"></div>
                <div className="w-full h-px bg-outline-variant/30"></div>
              </div>
              
              {/* SVG Chart Graphic */}
              <svg className="w-full h-full absolute inset-0 z-10 p-1" preserveAspectRatio="none" viewBox="0 0 100 50">
                {/* Dynamic Baseline (Dashed, depends on selected baseline avg latency value) */}
                <path 
                  d={`M 0 ${45 - (comparisonMetrics.baseRt/220)*30} Q 20 ${43 - (comparisonMetrics.baseRt/220)*30}, 40 ${40 - (comparisonMetrics.baseRt/220)*30} T 80 ${35 - (comparisonMetrics.baseRt/220)*30} T 100 ${36 - (comparisonMetrics.baseRt/220)*30}`} 
                  fill="none" 
                  stroke="#8b90a0" 
                  strokeDasharray="2,2" 
                  strokeWidth="0.5"
                ></path>
                
                {/* Current Run (Solid Primary) */}
                <path d="M 0 35 Q 10 32, 20 25 T 40 15 T 60 12 T 80 18 T 100 15" fill="none" stroke="#aec6ff" strokeWidth="0.8"></path>
                <path d="M 0 35 Q 10 32, 20 25 T 40 15 T 60 12 T 80 18 T 100 15 L 100 50 L 0 50 Z" fill="url(#gradCompare)" opacity="0.08"></path>
                
                <defs>
                  <linearGradient id="gradCompare" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#aec6ff" stopOpacity="1"></stop>
                    <stop offset="100%" stopColor="#aec6ff" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                
                {/* Point marker */}
                <circle className="animate-pulse" cx="60" cy="12" fill="#aec6ff" r="1.5"></circle>
                <line opacity="0.3" stroke="#aec6ff" strokeDasharray="1,1" strokeWidth="0.2" x1="60" x2="60" y1="0" y2="50"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column (Col 9-12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Delta Score Gauge */}
          <div className="bento-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-48 border-secondary/20 bg-secondary/5">
            <div className="absolute inset-0 bg-secondary/5"></div>
            <h4 className="font-label-md text-on-surface-variant text-sm mb-4 relative z-10 w-full text-left">Overall Performance Delta</h4>
            
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                {/* Fill color depends on positive vs negative delta */}
                <path 
                  className={comparisonMetrics.avgRt <= comparisonMetrics.baseRt ? "text-secondary" : "text-error"} 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray="75, 100" 
                  strokeLinecap="round" 
                  strokeWidth="2.5"
                ></path>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`font-display text-xl font-bold ${
                  comparisonMetrics.avgRt <= comparisonMetrics.baseRt ? "text-secondary" : "text-error"
                }`}>
                  {getDeltaScore()}
                </span>
              </div>
            </div>
          </div>

          {/* Environmental changes log */}
          <div className="bento-card p-4 flex-1 flex flex-col min-h-[150px]">
            <h4 className="font-label-md text-on-surface text-sm mb-3 border-b border-outline-variant/30 pb-2 flex justify-between items-center">
              Detected Environment Changes
              <span className="material-symbols-outlined text-[16px] text-outline-variant">history</span>
            </h4>
            <ul className="flex flex-col gap-3 font-code-sm text-[12px] overflow-y-auto">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim mt-0.5">database</span>
                <span className="text-on-surface-variant">Implemented composite Index on <span className="text-primary-fixed-dim">orders</span> table (migration <span className="text-outline">m20231015</span>)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim mt-0.5">api</span>
                <span className="text-on-surface-variant">Updated Auth Service image tag to <span className="text-primary-fixed-dim">v2.1.0-rc</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim mt-0.5">memory</span>
                <span className="text-on-surface-variant">Node pool memory limit increased from 4Gi to <span className="text-primary-fixed-dim">8Gi</span></span>
              </li>
            </ul>
          </div>
        </div>

        {/* AI Differential Insights (Full Width Bottom) */}
        <div className="col-span-12 bento-card p-5 border-l-4 border-l-primary-container relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary-container/10 to-transparent pointer-events-none"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-surface-container-high p-2 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            </div>
            
            <div className="flex-1">
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">AI Differential Insights</h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-code-sm bg-primary/10 text-primary border border-primary/30 mb-2">
                Comparison target: {selectedBaseline.name}
              </span>
              
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Compared to the selected baseline, response times are <strong className="text-secondary font-medium bg-secondary/10 px-1.5 py-0.5 rounded font-code-sm text-[11px]">{
                  comparisonMetrics.avgRt <= comparisonMetrics.baseRt 
                    ? `${getDeltaPercent(comparisonMetrics.avgRt, comparisonMetrics.baseRt).replace('-', '')}% lower`
                    : `${getDeltaPercent(comparisonMetrics.avgRt, comparisonMetrics.baseRt)}% higher`
                }</strong> across P95 percentiles. The primary delta is attributed to the <code className="font-code-sm bg-surface-container px-1 rounded text-primary-fixed-dim border border-outline-variant/50">orders</code> table index migration which was absent in the baseline run. However, the update to Auth Service v2.1.0 has introduced a small memory leak anomaly under prolonged execution.
              </p>
              
              <div className="mt-4 flex gap-2">
                <button className="text-[12px] font-label-md px-3 py-1.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface rounded transition-colors">
                  View Auth Profiling Traces
                </button>
                <button className="text-[12px] font-label-md px-3 py-1.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface rounded transition-colors">
                  Acknowledge
                </button>
              </div>
            </div>
            
            <button className="absolute top-0 right-0 m-4 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-[11px] font-label-md bg-surface-container-high/50 px-2 py-1 rounded border border-outline-variant/30">
              <span className="material-symbols-outlined text-[14px]">sync</span> 
              Refresh Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'

export default function AIReports() {
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch runs from backend to populate report list
    fetch('/api/runs')
      .then(res => res.json())
      .then(data => {
        setRuns(data)
        if (data.length > 0) {
          setSelectedRun(data[0]) // Select the latest run as default
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch runs, using mock fallback", err)
        const mockRuns = [
          { id: 2, run_number: 4092, name: "Production Checkout Stress Test", profile: "Stress Test", status: "Completed", health_score: 92, perf_score: 94, started_at: "2026-07-09T10:30:00" },
          { id: 1, run_number: 4091, name: "Auth Service Benchmark Run", profile: "Load Test", status: "Completed", health_score: 98, perf_score: 97, started_at: "2026-07-08T15:20:00" },
          { id: 3, run_number: 4090, name: "API Gateway Spiketest", profile: "Spike Test", status: "Stopped", health_score: 74, perf_score: 68, started_at: "2026-07-07T09:45:00" }
        ]
        setRuns(mockRuns)
        setSelectedRun(mockRuns[0])
        setLoading(false)
      })
  }, [])

  const handleSelectRun = (runId) => {
    const run = runs.find(r => r.id === parseInt(runId))
    if (run) setSelectedRun(run)
  }

  // Returns specific executive details based on selected run score
  const getReportContent = () => {
    if (!selectedRun) return {}
    
    if (selectedRun.health_score >= 95) {
      return {
        summary: "The system exhibited outstanding performance during this benchmark execution. Average response latency remained well within the 100ms SLA, and node container resources scaled effectively. No significant anomalies or database locking conflicts were observed.",
        breakingPoint: "22,000 VU",
        failures: [
          { title: "Gateway Resource Allocation", desc: "Sufficient headroom observed for sustained traffic spikes.", level: "Optimal", style: "text-secondary border-secondary/20 bg-secondary/5" }
        ],
        dbStatus: "Stable",
        gwStatus: "Stable",
        dbColor: "bg-emerald-400 animate-pulse",
        gwColor: "bg-emerald-400 animate-pulse"
      }
    } else if (selectedRun.health_score >= 90) {
      return {
        summary: "The system performed exceptionally well under the target load of 10,000 concurrent users. Response times remained stable at an average of 142ms for the 95th percentile, well below the 200ms SLA. However, memory consumption on primary database nodes showed an upward trend during the final 15 minutes of the stress phase.",
        breakingPoint: "14,500 VU",
        failures: [
          { title: "Checkout Service Row-locks", desc: "Database query transaction bottlenecks detected in cart checkout flows.", level: "Critical", style: "text-error border-error/20 bg-error/5" },
          { title: "Auth Validation Handshake Latency", desc: "Minor latency degradation identified on crypt token parsing.", level: "Warning", style: "text-tertiary border-tertiary/20 bg-tertiary/5" },
          { title: "Inventory Cache Misses", desc: "Cache request misses climbed to 8.2% under sustained peak traffic.", level: "Warning", style: "text-tertiary border-tertiary/20 bg-tertiary/5" }
        ],
        dbStatus: "Warning",
        gwStatus: "Stable",
        dbColor: "bg-amber-400",
        gwColor: "bg-emerald-400 animate-pulse"
      }
    } else {
      return {
        summary: "The target environment encountered significant processing constraints. A series of write locks on database transactional units combined with an API Gateway load overflow caused error rates to spike to 4.2%, violating core uptime SLA agreements.",
        breakingPoint: "6,200 VU",
        failures: [
          { title: "Database Shared Pool Exhaustion", desc: "Connection pools saturated, returning connection refused errors.", level: "Critical", style: "text-error border-error/20 bg-error/5" },
          { title: "API Gateway HTTP 504 Timeouts", desc: "Gateway buffer queues overflowed under direct rate limits.", level: "Critical", style: "text-error border-error/20 bg-error/5" }
        ],
        dbStatus: "Failed",
        gwStatus: "Warning",
        dbColor: "bg-red-500 animate-pulse",
        gwColor: "bg-amber-400"
      }
    }
  }

  if (loading || !selectedRun) {
    return <div className="p-8 text-center text-on-surface-variant font-code-sm">Loading AI diagnostic performance report...</div>
  }

  const content = getReportContent()

  return (
    <div className="max-w-container-max mx-auto p-gutter md:p-margin-desktop space-y-6">
      
      {/* Page Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
          <div>
            <h2 className="font-display text-headline-lg font-headline-lg text-on-surface tracking-tight">AI Diagnostics Report</h2>
            <p className="text-on-surface-variant font-body-md mt-1">Machine learning report analyzing cluster failures and code bottlenecks.</p>
          </div>
        </div>
        
        {/* Actions & Selector */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedRun.id}
            onChange={(e) => handleSelectRun(e.target.value)}
            className="input-field px-3 py-1.5 rounded font-code-sm text-code-sm bg-surface-container"
          >
            {runs.map(r => (
              <option key={r.id} value={r.id}>Run #{r.run_number} ({r.profile})</option>
            ))}
          </select>
          
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors text-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors text-sm text-on-surface">
            <span className="material-symbols-outlined text-[18px]">code</span>
            JSON
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Card (Col 1-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[240px] border border-outline-variant/30">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-full text-center mb-4">Overall Health</h3>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform absolute inset-0" viewBox="0 0 100 100">
                <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="6"></circle>
                {/* Score circumference is 282.7. Calculate offset: 282.7 * (1 - score / 100) */}
                <circle 
                  className={`${
                    selectedRun.health_score >= 90 ? 'text-secondary drop-shadow-[0_0_8px_rgba(78,222,163,0.4)]' : 'text-error drop-shadow-[0_0_8px_rgba(255,180,171,0.4)]'
                  }`} 
                  cx="50" 
                  cy="50" 
                  fill="none" 
                  r="45" 
                  stroke="currentColor" 
                  strokeDasharray="282.7" 
                  strokeDashoffset={282.7 * (1 - selectedRun.health_score / 100)} 
                  strokeLinecap="round" 
                  strokeWidth="6"
                ></circle>
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-display font-display font-bold text-on-surface">{selectedRun.health_score}</span>
                <span className="text-xs text-on-surface-variant">/100</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-secondary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+4 pts from last run</span>
            </div>
          </div>
        </div>

        {/* AI Executive Summary (Col 5-12) */}
        <div className="lg:col-span-8">
          <div className="glass-panel rounded-xl p-6 h-full flex flex-col relative border border-outline-variant/30 glow-active">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none blur-2xl"></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">AI Executive Summary</h3>
            </div>
            
            <div className="prose prose-invert max-w-none text-on-surface-variant leading-relaxed text-sm">
              <p className="mb-3">{content.summary}</p>
            </div>
            
            <div className="mt-auto pt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${content.gwColor}`}></div>
                <span className="text-on-surface">API Gateway ({content.gwStatus})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${content.dbColor}`}></div>
                <span className="text-on-surface">DB Cluster ({content.dbStatus})</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Failure Prediction & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Failure Prediction Chart */}
        <div className="glass-panel rounded-xl p-6 flex flex-col border border-outline-variant/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">crisis_alert</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Failure Prediction Model</h3>
            </div>
            <span className="text-[10px] font-code-sm bg-surface-container px-2 py-1 rounded text-on-surface-variant">MODEL: PROPHET-V2</span>
          </div>

          <div className="flex-1 bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-4 relative min-h-[220px] flex flex-col justify-end">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] uppercase tracking-widest text-on-surface-variant opacity-50 font-medium">
              Stability / Latency SLA
            </div>

            {/* Breaking Point Callout */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-error/10 backdrop-blur-md border border-error/30 p-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                  <span className="text-[9px] font-bold text-error uppercase tracking-wider">Predicted Breaking Point</span>
                </div>
                <div className="text-base font-display font-bold text-on-surface leading-none">
                  {content.breakingPoint} <span className="text-xs font-normal text-on-surface-variant">VUs</span>
                </div>
              </div>
            </div>

            {/* Graph Area */}
            <div className="relative flex-1 w-full mt-4 mb-2 px-6">
              <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-10">
                <div className="w-full h-px bg-outline"></div>
                <div className="w-full h-px bg-outline"></div>
                <div className="w-full h-px bg-outline"></div>
                <div className="w-full h-px bg-outline"></div>
              </div>

              {/* Curve representing failure dropping off */}
              <svg className="w-full h-full relative z-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="failureGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path 
                  d={selectedRun.health_score >= 90 
                    ? "M 0 20 Q 40 22, 60 30 T 80 80 T 100 95" 
                    : "M 0 20 Q 20 25, 40 70 T 70 95 T 100 99"
                  } 
                  fill="url(#failureGrad)" 
                  opacity="0.6"
                ></path>
                <path 
                  d={selectedRun.health_score >= 90 
                    ? "M 0 20 Q 40 22, 60 30 T 80 80 T 100 95" 
                    : "M 0 20 Q 20 25, 40 70 T 70 95 T 100 99"
                  } 
                  fill="none" 
                  stroke="#ffb4ab" 
                  strokeWidth="1.5"
                ></path>
              </svg>
            </div>
            
            <div className="flex justify-between text-[10px] text-on-surface-variant font-code-sm">
              <span>0 VU</span>
              <span>10,000 VU</span>
              <span>20,000 VU</span>
            </div>
          </div>
        </div>

        {/* Bottleneck Checklist */}
        <div className="glass-panel rounded-xl p-6 flex flex-col border border-outline-variant/30">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Identified Performance Bottlenecks</h3>
            </div>
            <span className="text-[10px] font-code-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">Checklist</span>
          </div>

          <div className="flex flex-col gap-4">
            {content.failures?.map((fail, idx) => (
              <div key={idx} className={`p-3 rounded-lg border flex justify-between items-start gap-4 ${fail.style}`}>
                <div className="space-y-1">
                  <div className="font-label-md font-bold text-sm text-on-surface">{fail.title}</div>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{fail.desc}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold uppercase border ${
                  fail.level === 'Critical' ? 'border-error/30 text-error bg-error/15' : 
                  fail.level === 'Warning' ? 'border-tertiary/30 text-tertiary bg-tertiary/15' : 
                  'border-secondary/30 text-secondary bg-secondary/15'
                }`}>
                  {fail.level}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

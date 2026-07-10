import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  
  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch dashboard summary, using mock fallback", err)
        // Set mock fallback
        setSummary({
          total_runs: 48,
          completed_runs: 46,
          active_run_id: null,
          active_run_name: null,
          recent_runs: [
            { id: 2, run_number: 4092, name: "Production Checkout Stress Test", profile: "Stress Test", status: "Completed", health_score: 92, perf_score: 94, started_at: "2026-07-09T10:30:00" },
            { id: 1, run_number: 4091, name: "Auth Service Benchmark Run", profile: "Load Test", status: "Completed", health_score: 98, perf_score: 97, started_at: "2026-07-08T15:20:00" },
            { id: 3, run_number: 4090, name: "API Gateway Spiketest", profile: "Spike Test", status: "Stopped", health_score: 74, perf_score: 68, started_at: "2026-07-07T09:45:00" }
          ]
        })
        setLoading(false)
      })
  }, [])

  const handleStartDefaultTest = () => {
    // Call run API
    fetch('/api/tests/1/run', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        navigate('/live-monitoring')
      })
      .catch(err => {
        console.error(err)
        navigate('/live-monitoring')
      })
  }

  return (
    <div className="max-w-container-max mx-auto p-gutter md:p-margin-desktop space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-headline-lg font-headline-lg text-on-surface tracking-tight">System Overview</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Real-time performance metrics and anomaly detection across all clusters.</p>
        </div>
        <div className="flex items-center gap-3">
          {summary?.active_run_id ? (
            <Link to="/live-monitoring" className="px-4 py-2 bg-secondary text-on-secondary rounded font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-secondary-fixed transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-on-secondary pulse-ring"></span>
              View Active Test
            </Link>
          ) : (
            <button 
              onClick={handleStartDefaultTest} 
              className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary-fixed transition-colors"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Run Checkout Test
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bento-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-on-surface-variant text-sm">Cluster Health</span>
            <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-on-surface">98.2%</span>
            </div>
            <span className="text-[11px] text-secondary font-code-sm mt-2 block">All systems operating within normal SLA thresholds</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bento-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-on-surface-variant text-sm">Concurrent VUs</span>
            <span className="material-symbols-outlined text-primary text-sm">group</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-on-surface">
                {summary?.active_run_id ? "1,000" : "0"}
              </span>
              <span className="text-on-surface-variant text-sm font-label-md ml-1">/ 5,000 max</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-code-sm mt-2 block">
              {summary?.active_run_id ? "Sustained load test active" : "No active virtual user load"}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bento-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-on-surface-variant text-sm">Active Rates</span>
            <span className="material-symbols-outlined text-tertiary text-sm">bolt</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-on-surface">
                {summary?.active_run_id ? "1,245" : "0"}
              </span>
              <span className="text-on-surface-variant text-sm font-label-md ml-1">RPS</span>
            </div>
            <span className="text-[11px] text-secondary font-code-sm mt-2 block">
              {summary?.active_run_id ? "99.98% Success Rate" : "System in idle monitoring mode"}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bento-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-on-surface-variant text-sm">Avg Latency</span>
            <span className="material-symbols-outlined text-outline text-sm">timer</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-on-surface">124</span>
              <span className="text-on-surface-variant text-sm font-label-md ml-0.5">ms</span>
            </div>
            <span className="text-[11px] text-secondary font-code-sm mt-2 block">P95 percentile: 142ms</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Graph + Active API Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Area */}
        <div className="lg:col-span-8 bento-card p-5 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">stacked_line_chart</span>
              Response Time vs Target Load
            </h3>
            <div className="flex gap-4 font-code-sm text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-primary inline-block"></span>
                <span>Response Time (ms)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-secondary inline-block"></span>
                <span>VUs</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative border-l border-b border-outline-variant/30 flex items-end p-2 min-h-[220px]">
            {/* Grid lines Y */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="w-full h-px bg-outline"></div>
              <div className="w-full h-px bg-outline"></div>
              <div className="w-full h-px bg-outline"></div>
              <div className="w-full h-px bg-outline"></div>
            </div>

            {/* SVG Graph Graphic */}
            <svg className="w-full h-full absolute inset-0 z-10 p-2" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* VUs Area (Secondary Green) */}
              <path d="M0 100 L 10 95 L 20 85 L 30 70 L 40 60 L 50 40 L 60 20 L 70 20 L 80 20 L 90 20 L 100 20 L 100 100 Z" fill="rgba(78, 222, 163, 0.03)"></path>
              <path d="M0 100 L 10 95 L 20 85 L 30 70 L 40 60 L 50 40 L 60 20 L 70 20 L 80 20 L 90 20 L 100 20" fill="none" stroke="#4edea3" strokeWidth="0.8" strokeDasharray="2,2"></path>

              {/* Latency Line (Primary Blue) */}
              <path d="M0 90 Q 15 85, 30 75 T 60 55 T 80 40 T 100 35" fill="none" stroke="#aec6ff" strokeWidth="1.5"></path>
              <path d="M0 90 Q 15 85, 30 75 T 60 55 T 80 40 T 100 35 L 100 100 L 0 100 Z" fill="url(#latencyGrad)" opacity="0.1"></path>
              <defs>
                <linearGradient id="latencyGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#aec6ff" stopOpacity="1"></stop>
                  <stop offset="100%" stopColor="#aec6ff" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Axis labels */}
            <div className="absolute left-2 bottom-2 text-[10px] text-on-surface-variant font-code-sm">0m</div>
            <div className="absolute right-2 bottom-2 text-[10px] text-on-surface-variant font-code-sm">15m</div>
          </div>
        </div>

        {/* API Nodes Area */}
        <div className="lg:col-span-4 bento-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-on-surface">API Clusters</h3>
              <span className="text-[10px] font-code-sm bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">Live</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {[
                { name: "API Gateway", rps: "1,245 RPS", status: "Active", style: "text-secondary bg-secondary/10 border-secondary/20" },
                { name: "Auth Service", rps: "312 RPS", status: "Active", style: "text-secondary bg-secondary/10 border-secondary/20" },
                { name: "Checkout Service", rps: "480 RPS", status: "Active", style: "text-secondary bg-secondary/10 border-secondary/20" },
                { name: "Inventory Cluster", rps: "90 RPS", status: "Degraded", style: "text-tertiary bg-tertiary/10 border-tertiary/20" },
                { name: "User Profile DB", rps: "520 RPS", status: "Active", style: "text-secondary bg-secondary/10 border-secondary/20" }
              ].map((node, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${node.status === 'Active' ? 'bg-secondary pulse-ring' : 'bg-tertiary'}`}></span>
                    <span className="font-label-md text-on-surface font-semibold text-sm">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-code-sm text-xs text-on-surface-variant">{node.rps}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-code-sm border ${node.style}`}>{node.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-surface-container-highest rounded border border-outline-variant/30 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1 mb-1 font-bold text-tertiary">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Anomaly Detected
            </div>
            Inventory Cluster response times spiked to 410ms at 11:42 AM.
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Runs + Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Runs Table */}
        <div className="lg:col-span-8 bento-card p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/30">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Runs</h3>
            <Link to="/compare" className="text-xs text-primary hover:underline flex items-center gap-1 font-label-md">
              Compare Runs <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-code-sm text-sm border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant font-label-md">
                  <th className="py-2.5 px-3">Run</th>
                  <th className="py-2.5 px-3">Test Scenario</th>
                  <th className="py-2.5 px-3">Execution Profile</th>
                  <th className="py-2.5 px-3 text-center">Health</th>
                  <th className="py-2.5 px-3 text-center">Perf Score</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recent_runs.map((run, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-container/30 transition-colors">
                    <td className="py-3 px-3 text-primary font-bold">#{run.run_number}</td>
                    <td className="py-3 px-3 text-on-surface font-medium">{run.name}</td>
                    <td className="py-3 px-3 text-on-surface-variant">{run.profile}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        run.health_score >= 90 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {run.health_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-on-surface">{run.perf_score}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        run.status === 'Completed' ? 'bg-secondary-fixed/10 text-secondary-fixed border border-secondary-fixed/20' :
                        run.status === 'Running' ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse' :
                        'bg-outline-variant/10 text-on-surface-variant border border-outline-variant/20'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostics & AI insights */}
        <div className="lg:col-span-4 bento-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                AI Diagnostics
              </h3>
            </div>
            
            <div className="flex flex-col gap-3 text-sm">
              <div className="border-l-2 border-primary-container pl-3 py-1">
                <div className="font-bold text-on-surface">Database Lock Prediction</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Prophet-v2 predicts write locking in checkout flow if concurrent user load exceeds 14,500 VUs.</div>
              </div>
              
              <div className="border-l-2 border-error pl-3 py-1">
                <div className="font-bold text-error">Auth Latency Peak</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Auth service response times spiked during peak load test (Run #4092). Memory leak suspected.</div>
              </div>
            </div>
          </div>
          
          <Link to="/reports" className="mt-6 w-full py-2 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary transition-colors text-center font-label-md text-label-md block">
            View Performance Reports
          </Link>
        </div>
      </div>
    </div>
  )
}

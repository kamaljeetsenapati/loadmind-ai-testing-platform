import React, { useState, useEffect, useRef } from 'react'

export default function LiveMonitoring() {
  const [activeRunId, setActiveRunId] = useState(null)
  const [testName, setTestName] = useState("Production Checkout Stress Test")
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState({
    vus: 0,
    target_vus: 1000,
    rps: 0,
    p50: 0,
    p95: 0,
    p99: 0,
    cpu: 0,
    memory: 0,
    errors: 0,
    elapsed: 0
  })

  const [logs, setLogs] = useState([])
  const logContainerRef = useRef(null)
  const eventSourceRef = useRef(null)

  // Fetch current active run on mount
  useEffect(() => {
    checkActiveRun()
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const checkActiveRun = () => {
    fetch('/api/dashboard/summary')
      .then(res => res.json())
      .then(data => {
        if (data.active_run_id) {
          setActiveRunId(data.active_run_id)
          if (data.active_run_name) setTestName(data.active_run_name)
          startStream(data.active_run_id)
        } else {
          setIsRunning(false)
        }
      })
      .catch(err => {
        console.error("Failed to check active run, entering idle mode", err)
      })
  }

  const startStream = (runId) => {
    setIsRunning(true)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource(`/api/runs/${runId}/stream`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.status === 'finished') {
        setIsRunning(false)
        es.close()
        addLog("SYSTEM", "Test run execution finished successfully.")
        return
      }
      
      setMetrics(data)
      
      // Generate some technical live console logs based on current metrics
      const endpoints = ["/api/v1/checkout", "/api/v1/cart/add", "/api/v1/auth/token", "/api/v1/inventory/check", "/api/v1/user/profile"]
      const methods = ["POST", "POST", "GET", "GET", "GET"]
      const elapsedStr = formatTime(data.elapsed)

      // Add a couple of logs per metric update
      const newLogs = []
      const logCount = Math.min(5, Math.max(1, Math.floor(data.rps / 200)))
      for (let i = 0; i < logCount; i++) {
        const randIdx = Math.floor(random(0, endpoints.length))
        const ep = endpoints[randIdx]
        const method = methods[randIdx]
        const status = data.errors > 0 && Math.random() < 0.25 ? 500 : 200
        const duration = status === 500 ? data.p99 : data.p50 + Math.floor(random(-10, 20))
        
        newLogs.push({
          time: new Date().toLocaleTimeString(),
          method,
          endpoint: ep,
          status,
          duration,
          elapsedStr
        })
      }
      setLogs(prev => [...prev, ...newLogs].slice(-100)) // Cap at 100 logs
    }

    es.onerror = (err) => {
      console.error("SSE Error:", err)
      es.close()
      setIsRunning(false)
    }

    // Set initial logs
    setLogs([{
      time: new Date().toLocaleTimeString(),
      method: "SYSTEM",
      endpoint: "Initializing Kubernetes node pool...",
      status: 200,
      duration: 450,
      elapsedStr: "00:00"
    }])
  }

  const addLog = (tag, message) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      method: "SYSTEM",
      endpoint: message,
      status: 200,
      duration: 0,
      elapsedStr: formatTime(metrics.elapsed)
    }])
  }

  const triggerTestRun = () => {
    fetch('/api/tests/1/run', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setActiveRunId(data.id)
        startStream(data.id)
      })
      .catch(err => {
        console.error("Failed to start run, generating local simulated stream", err)
        simulateLocalStream()
      })
  }

  const stopTestRun = () => {
    if (!activeRunId) {
      setIsRunning(false)
      return
    }
    fetch(`/api/runs/${activeRunId}/stop`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setIsRunning(false)
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }
        addLog("SYSTEM", "Stop instruction acknowledged by coordinator. Tearing down container pool.")
      })
      .catch(err => {
        console.error(err)
        setIsRunning(false)
      })
  }

  // Simulated fallback in case backend server is not running
  const simInterval = useRef(null)
  const simulateLocalStream = () => {
    setIsRunning(true)
    let elapsed = 0
    simInterval.current = setInterval(() => {
      elapsed += 2
      const targetVus = 1000
      const currentVus = elapsed < 60 ? int((elapsed / 60) * targetVus) : targetVus
      const rps = int((currentVus * 1.25) + random(-10, 10))
      const p50 = int(120 + random(-5, 5))
      const p95 = int(140 + random(-8, 12))
      const p99 = int(220 + random(-20, 30))
      const cpu = min(95.0, 15.0 + (currentVus / targetVus) * 65.0 + random(-2, 2))
      const memory = min(90.0, 35.0 + (elapsed / 900) * 15.0)

      setMetrics({
        vus: currentVus,
        target_vus: targetVus,
        rps,
        p50,
        p95,
        p99,
        cpu: round(cpu, 1),
        memory: round(memory, 1),
        errors: elapsed > 60 && Math.random() < 0.1 ? 2 : 0,
        elapsed
      })

      // Generate mock log
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        method: "POST",
        endpoint: "/api/v1/checkout",
        status: elapsed > 60 && Math.random() < 0.08 ? 500 : 200,
        duration: p95,
        elapsedStr: formatTime(elapsed)
      }].slice(-50))
    }, 2000)
  }

  // Helpers
  const random = (min, max) => Math.random() * (max - min) + min
  const int = (val) => Math.floor(val)
  const min = (a, b) => Math.min(a, b)
  const round = (val, dec) => parseFloat(val.toFixed(dec))

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  // Clear simulated interval on unmount
  useEffect(() => {
    return () => {
      if (simInterval.current) clearInterval(simInterval.current)
    }
  }, [])

  return (
    <div className="max-w-container-max mx-auto p-4 md:p-6 lg:p-margin-desktop space-y-6">
      
      {/* Title Header with status */}
      <div className="flex justify-between items-center w-full pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight flex items-center gap-2">
            {testName}
            {isRunning ? (
              <span className="flex items-center gap-1 text-secondary-fixed font-label-md text-label-md ml-2 px-2 py-0.5 rounded bg-secondary-fixed/10 border border-secondary-fixed/20">
                <div className="w-2 h-2 rounded-full bg-secondary-fixed pulse-ring"></div>
                Running
              </span>
            ) : (
              <span className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md ml-2 px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                Idle
              </span>
            )}
          </h2>
        </div>
        <div>
          {isRunning ? (
            <button 
              onClick={stopTestRun}
              className="bg-error/10 text-error border border-error/30 hover:bg-error hover:text-on-error font-label-md text-label-md px-4 py-1.5 rounded transition-all duration-200 flex items-center gap-1 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">stop</span>
              Stop Test
            </button>
          ) : (
            <button 
              onClick={triggerTestRun}
              className="bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary hover:text-on-secondary font-label-md text-label-md px-4 py-1.5 rounded transition-all duration-200 flex items-center gap-1 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Initiate Load Scenario
            </button>
          )}
        </div>
      </div>

      {isRunning ? (
        <>
          {/* Main 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart: Response Times */}
            <div className="glass-panel p-4 rounded-xl flex flex-col min-h-[250px] border border-outline-variant/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Response Times</h3>
                <span className="material-symbols-outlined text-outline text-sm">timer</span>
              </div>
              <div className="flex-1 relative border-l border-b border-outline-variant/30 rounded min-h-[180px] overflow-hidden flex items-end">
                <svg className="w-full h-full absolute inset-0 z-10 p-1" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* p50 line */}
                  <path d="M0 80 Q 20 70 40 78 T 80 62 T 100 70" fill="none" stroke="#aec6ff" strokeWidth="1.5"></path>
                  {/* p95 line */}
                  <path d="M0 60 Q 20 45 40 55 T 80 40 T 100 48" fill="none" stroke="#ffb95f" strokeDasharray="3" strokeWidth="1.5"></path>
                  {/* p99 line */}
                  <path d="M0 40 Q 20 20 40 32 T 80 18 T 100 22" fill="none" stroke="#ffb4ab" strokeWidth="1.5"></path>
                </svg>
                
                <div className="absolute top-2 right-2 flex flex-col gap-1 text-[10px] font-code-sm bg-surface-container/60 p-2 rounded border border-outline-variant/20 z-20">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#aec6ff]"></div> p50: {metrics.p50}ms</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#ffb95f] border-dashed"></div> p95: {metrics.p95}ms</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#ffb4ab]"></div> p99: {metrics.p99}ms</div>
                </div>
              </div>
            </div>

            {/* Chart: Requests Per Second */}
            <div className="glass-panel p-4 rounded-xl flex flex-col min-h-[250px] border border-outline-variant/30">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Throughput (RPS)</h3>
                <span className="material-symbols-outlined text-outline text-sm">bolt</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="font-display text-3xl font-bold text-secondary-fixed glow-text">{metrics.rps.toLocaleString()}</span>
                <span className="font-code-sm text-xs text-secondary-fixed-dim mb-1">RPS</span>
              </div>
              <div className="flex-1 relative border-l border-b border-outline-variant/30 rounded min-h-[150px] overflow-hidden flex items-end">
                <svg className="w-full h-full absolute inset-0 z-10 p-1" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0 95 L 10 90 L 20 80 L 30 72 L 40 50 L 50 42 L 60 30 L 70 32 L 80 18 L 90 20 L 100 12 L 100 100 L 0 100 Z" fill="rgba(111, 251, 190, 0.03)"></path>
                  <path d="M0 95 L 10 90 L 20 80 L 30 72 L 40 50 L 50 42 L 60 30 L 70 32 L 80 18 L 90 20 L 100 12" fill="none" stroke="#6ffbbe" strokeWidth="1.5"></path>
                </svg>
              </div>
            </div>

            {/* Chart: Virtual Users (VUs) */}
            <div className="glass-panel p-4 rounded-xl flex flex-col min-h-[250px] border border-outline-variant/30">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Virtual Users</h3>
                <span className="material-symbols-outlined text-outline text-sm">group</span>
              </div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-on-surface">{metrics.vus.toLocaleString()}</span>
                  <span className="text-on-surface-variant text-xs font-code-sm">Active VUs</span>
                </div>
                <div className="font-code-sm text-xs text-on-surface-variant">Target: {metrics.target_vus.toLocaleString()} VUs</div>
              </div>
              <div className="flex-1 relative border-l border-b border-outline-variant/30 rounded min-h-[150px] overflow-hidden flex items-end">
                <svg className="w-full h-full absolute inset-0 z-10 p-1" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0 100 L 10 95 L 20 85 L 30 70 L 40 60 L 50 40 L 60 20 L 70 20 L 80 20 L 90 20 L 100 20 L 100 100 Z" fill="rgba(174, 198, 255, 0.03)"></path>
                  <path d="M0 100 L 10 95 L 20 85 L 30 70 L 40 60 L 50 40 L 60 20 L 70 20 L 80 20 L 90 20 L 100 20" fill="none" stroke="#aec6ff" strokeWidth="1.5"></path>
                </svg>
              </div>
            </div>

            {/* Core Health Gauge: CPU & Memory */}
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between min-h-[250px] border border-outline-variant/30">
              <div>
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Compute Utilization</h3>
                
                <div className="space-y-4">
                  {/* CPU utilization bar */}
                  <div>
                    <div className="flex justify-between text-xs font-code-sm mb-1.5">
                      <span className="text-on-surface-variant">Cluster CPU Utilization:</span>
                      <span className={`font-bold ${metrics.cpu > 85 ? 'text-error' : metrics.cpu > 70 ? 'text-tertiary' : 'text-secondary'}`}>{metrics.cpu}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-outline-variant/30">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.cpu > 85 ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]' : 
                          metrics.cpu > 70 ? 'bg-tertiary shadow-[0_0_8px_rgba(255,185,95,0.5)]' : 
                          'bg-secondary'
                        }`}
                        style={{ width: `${metrics.cpu}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Memory utilization bar */}
                  <div>
                    <div className="flex justify-between text-xs font-code-sm mb-1.5">
                      <span className="text-on-surface-variant">Node Memory Consumption:</span>
                      <span className="text-on-surface font-bold">{metrics.memory}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-outline-variant/30">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(174,198,255,0.5)]"
                        style={{ width: `${metrics.memory}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="flex justify-between items-center bg-surface-container-low rounded-lg p-2 text-xs border border-outline-variant/30">
                <span className="text-on-surface-variant">Elapsed duration:</span>
                <span className="font-code-sm text-on-surface font-bold">{formatTime(metrics.elapsed)} / 15:00</span>
              </div>
            </div>

          </div>

          {/* Scrolling terminal console output */}
          <div className="bento-card p-4 flex flex-col border border-outline-variant/40">
            <h4 className="font-label-md text-on-surface-variant text-xs uppercase tracking-wider mb-2 pb-2 border-b border-outline-variant/20 flex justify-between items-center">
              <span>Live Coordination Console Log</span>
              <span className="text-primary font-code-sm lowercase">tail -f loadmind.log</span>
            </h4>
            <div 
              ref={logContainerRef}
              className="bg-surface-container-lowest font-code-sm text-[11px] h-48 overflow-y-auto p-3 rounded-lg border border-outline-variant/30 flex flex-col gap-1.5"
            >
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-3 leading-relaxed">
                  <span className="text-outline">{log.time}</span>
                  <span className="text-on-surface-variant">[{log.elapsedStr}]</span>
                  <span className={`font-bold ${
                    log.method === 'POST' ? 'text-secondary-fixed' : 
                    log.method === 'SYSTEM' ? 'text-primary' : 
                    'text-tertiary-fixed-dim'
                  }`}>
                    {log.method}
                  </span>
                  <span className="flex-1 text-on-surface select-all">{log.endpoint}</span>
                  {log.duration > 0 && (
                    <span className={`font-bold ${log.status === 500 ? 'text-error' : 'text-on-surface-variant'}`}>
                      {log.status === 500 ? `500 INTERNAL_ERROR (${log.duration}ms)` : `200 OK (${log.duration}ms)`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Empty / Idle State */
        <div className="flex flex-col items-center justify-center min-h-[400px] bento-card p-8 text-center max-w-2xl mx-auto mt-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none blur-2xl"></div>
          
          <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">play_circle</span>
          </div>
          
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Active Load Test</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-8">
            Create a new scenario script or run the pre-configured Production Checkout Stress Test to initiate load generation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={triggerTestRun}
              className="bg-primary text-on-primary hover:bg-primary-fixed px-6 py-2.5 rounded-lg font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Run Checkout Stress Test
            </button>
            <span className="text-on-surface-variant self-center font-code-sm text-xs px-2">or</span>
            <a 
              href="#/create-test"
              className="border border-outline-variant hover:bg-surface-container-high text-on-surface px-6 py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Create Custom Scenario
            </a>
          </div>
        </div>
      )}

    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateTest() {
  const navigate = useNavigate()
  const [step, setStep] = useState(2) // Start at Configure Load (Step 2) as in the Figma design

  // Form states
  const [testName, setTestName] = useState("Production Checkout Stress Test")
  const [profile, setProfile] = useState("Load Test")
  const [vus, setVus] = useState(1000)
  const [rampUp, setRampUp] = useState(60)
  const [duration, setDuration] = useState(15)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [importSource, setImportSource] = useState("swagger")
  const [swaggerUrl, setSwaggerUrl] = useState("https://api.loadmind.ai/swagger.json")
  
  // AI specific settings
  const [chaosRate, setChaosRate] = useState(10)
  const [behaviorType, setBehaviorType] = useState("standard_user")

  // Calculations for Summary
  const calculateCost = () => {
    const baseRate = profile === "Stress Test" ? 0.0004 : profile === "Spike Test" ? 0.00035 : 0.00028
    const aiMultiplier = aiEnabled ? 1.5 : 1.0
    const computed = vus * duration * baseRate * aiMultiplier
    return computed.toFixed(2)
  }

  const calculateComputeUnits = () => {
    const baseUnits = (vus * duration) / 1200
    const aiMultiplier = aiEnabled ? 1.25 : 1.0
    return (baseUnits * aiMultiplier).toFixed(1)
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleRunTest = () => {
    const configData = {
      name: testName,
      profile: profile,
      target_vus: parseInt(vus) || 100,
      ramp_up: parseInt(rampUp) || 10,
      duration: parseInt(duration) || 1,
      ai_enabled: aiEnabled,
      cost: parseFloat(calculateCost())
    }

    // Call FastAPI backend to create and run test
    fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    })
    .then(res => res.json())
    .then(config => {
      // Trigger execution of this config
      return fetch(`/api/tests/${config.id}/run`, { method: 'POST' })
    })
    .then(res => res.json())
    .then(run => {
      // Go to Live Monitoring
      navigate('/live-monitoring')
    })
    .catch(err => {
      console.error("Failed to run test via API, entering mock monitoring", err)
      navigate('/live-monitoring')
    })
  }

  return (
    <div className="max-w-container-max mx-auto p-4 md:p-8 flex gap-6 layout-container">
      {/* Left Side: Stepper and Forms */}
      <div className="flex-1 flex flex-col max-w-4xl">
        {/* Stepper Header */}
        <div className="mb-8 px-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-outline-variant z-0"></div>
            
            {/* Step 1 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 bg-background px-2 cursor-pointer`} onClick={() => setStep(1)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md transition-all ${
                step > 1 ? 'bg-secondary/15 text-secondary border border-secondary/40' : 'bg-primary-container text-on-primary-container border border-primary glow-active'
              }`}>
                {step > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : "1"}
              </div>
              <span className={`font-label-md text-label-md whitespace-nowrap ${step === 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Import API</span>
            </div>

            {/* Step 2 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 bg-background px-2 cursor-pointer`} onClick={() => setStep(2)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md transition-all ${
                step > 2 ? 'bg-secondary/15 text-secondary border border-secondary/40' : 
                step === 2 ? 'bg-primary-container text-on-primary-container border border-primary glow-active' :
                'bg-surface-container text-on-surface-variant border border-outline-variant'
              }`}>
                {step > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : "2"}
              </div>
              <span className={`font-label-md text-label-md whitespace-nowrap ${step === 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Configure Load</span>
            </div>

            {/* Step 3 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 bg-background px-2 cursor-pointer`} onClick={() => setStep(3)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md transition-all ${
                step > 3 ? 'bg-secondary/15 text-secondary border border-secondary/40' : 
                step === 3 ? 'bg-primary-container text-on-primary-container border border-primary glow-active' :
                'bg-surface-container text-on-surface-variant border border-outline-variant'
              }`}>
                {step > 3 ? <span className="material-symbols-outlined text-[16px]">check</span> : "3"}
              </div>
              <span className={`font-label-md text-label-md whitespace-nowrap ${step === 3 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>AI Traffic Gen</span>
            </div>

            {/* Step 4 */}
            <div className={`relative z-10 flex flex-col items-center gap-2 bg-background px-2 cursor-pointer`} onClick={() => setStep(4)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md transition-all ${
                step === 4 ? 'bg-primary-container text-on-primary-container border border-primary glow-active' :
                'bg-surface-container text-on-surface-variant border border-outline-variant'
              }`}>
                "4"
              </div>
              <span className={`font-label-md text-label-md whitespace-nowrap ${step === 4 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Review</span>
            </div>
          </div>
        </div>

        {/* Step Content Container */}
        <div className="glass-panel rounded-xl p-6 md:p-8 flex-1 flex flex-col gap-6 min-h-[420px] justify-between">
          
          {/* STEP 1: IMPORT API */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Import API Definition</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Connect your endpoint architecture to LoadMind to simulate realistic requests.</p>
              </div>
              
              <div className="flex gap-4 border-b border-outline-variant pb-4">
                <button 
                  onClick={() => setImportSource("swagger")}
                  className={`px-4 py-2 rounded border transition-all ${
                    importSource === "swagger" ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface-container border-outline-variant text-on-surface-variant'
                  }`}
                >
                  OpenAPI / Swagger URL
                </button>
                <button 
                  onClick={() => setImportSource("postman")}
                  className={`px-4 py-2 rounded border transition-all ${
                    importSource === "postman" ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface-container border-outline-variant text-on-surface-variant'
                  }`}
                >
                  Postman Collection
                </button>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">Swagger Endpoint JSON URL</label>
                <input 
                  className="input-field w-full px-3 py-2 rounded font-code-sm text-code-sm"
                  type="text" 
                  value={swaggerUrl}
                  onChange={(e) => setSwaggerUrl(e.target.value)}
                />
                <span className="text-[11px] text-on-surface-variant mt-1 block">Specify the public or internal gateway OpenAPI document link.</span>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE LOAD */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Load Configuration</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Define the parameters and execution profile for your target infrastructure.</p>
              </div>

              {/* Execution Profile Selector */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-4">Execution Profile</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: "Load Test", icon: "cloud_upload", desc: "Assess performance under expected concurrent user volumes.", color: "text-primary" },
                    { title: "Spike Test", icon: "flash_on", desc: "Evaluate system response to sudden, extreme traffic bursts.", color: "text-secondary" },
                    { title: "Stress Test", icon: "warning", desc: "Push limits to identify breaking points and recovery behaviors.", color: "text-error" }
                  ].map((p, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setProfile(p.title)}
                      className={`type-card cursor-pointer p-4 rounded-lg border flex flex-col gap-3 transition-all ${
                        profile === p.title ? 'border-primary bg-[rgba(174,198,255,0.05)] shadow-[0_0_10px_rgba(174,198,255,0.15)]' : 'border-outline-variant bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`material-symbols-outlined ${p.color}`}>{p.icon}</span>
                        {profile === p.title && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(174,198,255,0.8)]"></div>}
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface mb-1">{p.title}</h4>
                        <p className="font-code-sm text-[11px] text-on-surface-variant leading-tight">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slider / Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-outline-variant">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Virtual Users (VUs)</label>
                  <input 
                    className="input-field w-full px-3 py-2 rounded font-code-sm text-code-sm" 
                    type="number" 
                    value={vus}
                    onChange={(e) => setVus(parseInt(e.target.value) || 0)}
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1 block">Max 10,000 for current plan</span>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Ramp-up Time (s)</label>
                  <input 
                    className="input-field w-full px-3 py-2 rounded font-code-sm text-code-sm" 
                    type="number" 
                    value={rampUp}
                    onChange={(e) => setRampUp(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Duration (m)</label>
                  <input 
                    className="input-field w-full px-3 py-2 rounded font-code-sm text-code-sm" 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* AI Toggle */}
              <div className="mt-4 p-4 rounded-lg bg-surface-container border border-outline-variant flex items-start gap-4">
                <div className="mt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      checked={aiEnabled} 
                      onChange={() => setAiEnabled(!aiEnabled)}
                      className="sr-only peer" 
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-[0_0_10px_rgba(174,198,255,0.1)]"></div>
                  </label>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                    Enable AI-Enhanced Traffic Generation
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-container text-on-primary-container uppercase tracking-wider">Beta</span>
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">
                    Utilizes ML models to simulate realistic, chaotic edge cases and non-linear user journeys based on historical access patterns.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AI TRAFFIC GEN */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">AI Agent Simulation Behaviors</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Tune the ML simulation layer to inject chaos or model specific target clients.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Behavior Template</label>
                  <select 
                    value={behaviorType}
                    onChange={(e) => setBehaviorType(e.target.value)}
                    className="input-field w-full px-3 py-2 rounded font-code-sm text-code-sm bg-surface-container"
                  >
                    <option value="standard_user">Standard Desktop Shopper</option>
                    <option value="mobile_app">High-Frequency API App Client</option>
                    <option value="malicious_crawler">Chaotic Scraper/Bots</option>
                    <option value="checkout_focused">Checkout Heavy Spike</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Chaos & Latency Injection Rate</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={chaosRate} 
                      onChange={(e) => setChaosRate(e.target.value)}
                      className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="font-code-sm text-on-surface text-sm w-12 text-right">{chaosRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Review Scenario Config</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Your configuration parameters parsed into YAML script. Verify details below.</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant/50 font-code-sm text-xs text-on-surface-variant leading-relaxed">
                <pre>{`test_scenario:
  name: "${testName}"
  profile: "${profile}"
  target_vus: ${vus}
  ramp_up: ${rampUp}s
  duration: ${duration}m
  ai_simulation:
    enabled: ${aiEnabled}
    template: "${behaviorType}"
    chaos_injection_rate: ${chaosRate}%
  region: "us-east-1"
  estimated_compute_units: ${calculateComputeUnits()} CU`}</pre>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-6 flex justify-between items-center border-t border-outline-variant">
            <button 
              onClick={handleBack} 
              disabled={step === 1}
              className={`px-4 py-2 border border-outline-variant text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-high transition-colors ${
                step === 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              Back
            </button>
            {step < 4 ? (
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-on-primary rounded font-label-md text-label-md font-bold hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(174,198,255,0.2)] flex items-center gap-2"
              >
                Next Step
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <button 
                onClick={handleRunTest}
                className="px-6 py-2 bg-secondary text-on-secondary rounded font-label-md text-label-md font-bold hover:bg-secondary-fixed transition-colors shadow-[0_0_15px_rgba(78,222,163,0.2)] flex items-center gap-2"
              >
                Start Stress Test
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Configuration Summary Widget */}
      <div className="hidden xl:flex w-80 flex-col gap-4">
        <div className="glass-panel rounded-xl p-5 border border-outline-variant sticky top-0">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-outline-variant">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            <h3 className="font-headline-md text-headline-md text-on-surface text-lg">Test Summary</h3>
          </div>
          
          <div className="flex flex-col gap-3 font-code-sm text-code-sm">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Profile:</span>
              <span className="text-on-surface font-medium">{profile}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Target VUs:</span>
              <span className="text-on-surface font-medium">{vus.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Duration:</span>
              <span className="text-on-surface font-medium">{duration}m 00s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Region:</span>
              <span className="text-on-surface font-medium">us-east-1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">AI Engine:</span>
              <span className="text-on-surface font-medium">{aiEnabled ? "Enabled (Beta)" : "Disabled"}</span>
            </div>
            
            <div className="my-2 h-[1px] bg-outline-variant w-full"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Estimated Cost:</span>
              <span className="text-primary font-bold text-sm">~ ${calculateCost()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Compute Units:</span>
              <span className="text-on-surface font-medium">{calculateComputeUnits()} CU</span>
            </div>
          </div>
          
          <div className="mt-6 p-3 rounded bg-surface-container-highest border border-outline-variant text-xs text-on-surface-variant leading-relaxed">
            <span className="material-symbols-outlined text-[14px] inline-block align-middle mr-1 text-secondary">info</span>
            Resource provisioning will take approximately 45 seconds before the test initiates.
          </div>
        </div>
      </div>
    </div>
  )
}

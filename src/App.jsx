import React, { useState, useMemo, useCallback } from 'react'
import InputPanel from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import Visualization from './components/Visualization'
import GraphSection from './components/GraphSection'
import ComparisonPanel from './components/ComparisonPanel'
import ExplanationPanel from './components/ExplanationPanel'
import {
  calcPropagationDelay,
  calcTransmissionDelay,
  calcTotalDelay,
  calcBandwidthDelayProduct,
  formatDelay,
  formatBDP,
  toMeters,
  toPacketBits,
  MEDIUMS,
} from './utils/calculations'

const INITIAL_STATE = {
  distance: 100,
  distanceUnit: 'm',
  medium: 'fiber',
  packetSize: 64,
  packetUnit: 'KB',
  bandwidth: 1000,
}

// Section wrapper with numbered label
function Section({ number, label, icon, children }) {
  return (
    <section style={{ marginBottom: '1.5rem' }}>
      {/* Section header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.85rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #456882, #234C6A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#E3E3E3',
          flexShrink: 0,
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 0 12px rgba(69,104,130,0.5)',
        }}>
          {number}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#E3E3E3',
            letterSpacing: '0.02em',
          }}>
            {label}
          </span>
        </div>
      </div>
      {children}
    </section>
  )
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE)
  const [darkMode, setDarkMode] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const onUpdate = useCallback((partial) => {
    setState(prev => ({ ...prev, ...partial }))
    setIsPlaying(false)
  }, [])

  const derived = useMemo(() => {
    const distanceM = toMeters(state.distance, state.distanceUnit)
    const packetBits = toPacketBits(state.packetSize, state.packetUnit)
    const bandwidthBps = state.bandwidth * 1e6
    const speedMs = MEDIUMS[state.medium]?.speed || MEDIUMS.fiber.speed

    const propDelay = calcPropagationDelay(distanceM, speedMs)
    const transDelay = calcTransmissionDelay(packetBits, bandwidthBps)
    const totalDelay = calcTotalDelay(propDelay, transDelay)
    const bdp = calcBandwidthDelayProduct(bandwidthBps, propDelay)

    return {
      results: { propDelay, transDelay, totalDelay, bdp },
      inputs: {
        distanceM,
        distanceDisplay: state.distance,
        distanceUnit: state.distanceUnit,
        packetBits,
        bandwidthBps,
        speedMs,
        medium: state.medium,
        bandwidth: state.bandwidth,
      }
    }
  }, [state])

  const { results, inputs } = derived

  const statBadges = [
    { label: 'Propagation', value: `${formatDelay(results.propDelay).value} ${formatDelay(results.propDelay).unit}`, color: '#7fb3cc' },
    { label: 'Transmission', value: `${formatDelay(results.transDelay).value} ${formatDelay(results.transDelay).unit}`, color: '#7fb3cc' },
    { label: 'Total Delay', value: `${formatDelay(results.totalDelay).value} ${formatDelay(results.totalDelay).unit}`, color: '#a8d8ef' },
    { label: 'BDP', value: formatBDP(results.bdp), color: '#6d8ea0' },
    { label: 'Medium', value: MEDIUMS[state.medium]?.label, color: '#6d8ea0' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
    }}>
      {/* ── HERO HEADER ── */}
      <div className="hero-header">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                {/* Logo icon */}
                <div style={{
                  width: 52, height: 52,
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #456882, #1B3C53)',
                  border: '1px solid #2f607f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 0 24px rgba(69,104,130,0.5)',
                  flexShrink: 0,
                }}>
                  🌐
                </div>
                <div>
                  <h1 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 800,
                    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                    color: '#E3E3E3',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}>
                    Network Delay Simulator
                  </h1>
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: '#456882',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginTop: '0.2rem',
                  }}>
                    Data Communication · Educational Tool
                  </div>
                </div>
              </div>
              <p style={{
                color: 'var(--text-dim)',
                fontSize: '0.9rem',
                margin: 0,
                maxWidth: 560,
                lineHeight: 1.65,
              }}>
                Interactively simulate propagation delay, transmission delay, and bandwidth-delay product across different network media.
              </p>
            </div>

            {/* Dark mode toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {darkMode ? '🌙 Dark' : '☀️ Light'}
              </span>
              <div
                role="button"
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: 46, height: 25,
                  background: darkMode ? '#456882' : 'var(--border)',
                  borderRadius: 13,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.3s',
                  border: '1px solid var(--border-lt)',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 3, left: darkMode ? 23 : 3,
                  width: 17, height: 17,
                  background: '#E3E3E3',
                  borderRadius: '50%',
                  transition: 'left 0.3s',
                }} />
              </div>
            </div>
          </div>

          {/* Live stat badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
            {statBadges.map((b, i) => (
              <div key={i} style={{
                background: 'rgba(35,76,106,0.6)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                padding: '0.3rem 1rem',
                display: 'flex', gap: '0.4rem', alignItems: 'center',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                  {b.label}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: b.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {b.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT — single column, max-width centered ── */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem' }}>

        {/* 1 ─ CONFIGURATION */}
        <Section number="01" label="Configuration" icon="⚙️">
          <InputPanel state={state} onUpdate={onUpdate} />
        </Section>

        {/* 2 ─ DATA ANALYSIS */}
        <Section number="02" label="Data Analysis" icon="📊">
          <ResultsPanel results={results} inputs={inputs} />
        </Section>

        {/* 3 ─ STEP-BY-STEP CALCULATIONS */}
        <Section number="03" label="Step-by-Step Calculations" icon="🔢">
          <StepCalcStandalone results={results} inputs={inputs} />
        </Section>

        {/* 4 ─ LIVE SIMULATION */}
        <Section number="04" label="Live Simulation" icon="🎬">
          <Visualization
            results={results}
            inputs={inputs}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </Section>

        {/* 5 ─ MEDIUM COMPARISON */}
        <Section number="05" label="Medium Comparison" icon="⚡">
          <ComparisonPanel inputs={inputs} />
        </Section>

        {/* 6 ─ PERFORMANCE GRAPHS */}
        <Section number="06" label="Performance Graphs" icon="📈">
          <GraphSection inputs={inputs} results={results} />
        </Section>

        {/* 7 ─ CONCEPTS & EXPLANATIONS */}
        <Section number="07" label="Concepts & Explanations" icon="📚">
          <ExplanationPanel inputs={inputs} results={results} />
        </Section>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            color: '#456882',
            marginBottom: '0.25rem',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Network Delay Simulator & Analyzer
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            All calculations performed in-browser · No backend · No data stored · Built for Data Communication education
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Standalone Step-by-Step Calc Card ──────────────────────────────────────
function StepCalcStandalone({ results, inputs }) {
  const { propDelay, transDelay, totalDelay, bdp } = results
  const { distanceM, distanceDisplay, distanceUnit, speedMs, packetBits, bandwidthBps, medium } = inputs

  const steps = [
    {
      title: 'Propagation Delay',
      color: '#7fb3cc',
      lines: [
        `Distance  = ${distanceDisplay} ${distanceUnit} = ${distanceM.toLocaleString()} m`,
        `Speed     = ${(speedMs / 1e8).toFixed(1)} × 10⁸ m/s  (${MEDIUMS[medium]?.label})`,
        ``,
        `Prop Delay  =  Distance ÷ Speed`,
        `           =  ${distanceM.toLocaleString()} ÷ ${speedMs.toExponential(1)}`,
        `           =  ${formatDelay(propDelay).value} ${formatDelay(propDelay).unit}`,
      ],
    },
    {
      title: 'Transmission Delay',
      color: '#5a9bb8',
      lines: [
        `Packet    = ${(packetBits / 8 / 1024).toFixed(2)} KB = ${packetBits.toLocaleString()} bits`,
        `Bandwidth = ${(bandwidthBps / 1e6).toFixed(0)} Mbps = ${bandwidthBps.toLocaleString()} bps`,
        ``,
        `Trans Delay  =  Packet Size ÷ Bandwidth`,
        `            =  ${packetBits.toLocaleString()} ÷ ${bandwidthBps.toLocaleString()}`,
        `            =  ${formatDelay(transDelay).value} ${formatDelay(transDelay).unit}`,
      ],
    },
    {
      title: 'Total Delay & BDP',
      color: '#a8d8ef',
      lines: [
        `Total  =  Prop Delay + Trans Delay`,
        `       =  ${formatDelay(propDelay).value} ${formatDelay(propDelay).unit} + ${formatDelay(transDelay).value} ${formatDelay(transDelay).unit}`,
        `       =  ${formatDelay(totalDelay).value} ${formatDelay(totalDelay).unit}`,
        ``,
        `BDP    =  Bandwidth × Prop Delay`,
        `       =  ${(bandwidthBps / 1e6).toFixed(0)} Mbps × ${formatDelay(propDelay).value} ${formatDelay(propDelay).unit}`,
        `       =  ${formatBDP(bdp)}`,
      ],
    },
  ]

  return (
    <div className="card fade-in" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            background: 'var(--bg2)',
            border: `1px solid ${step.color}30`,
            borderLeft: `4px solid ${step.color}`,
            borderRadius: '0.875rem',
            padding: '1.25rem 1.5rem',
            overflow: 'hidden',
          }}>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              color: step.color,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.85rem',
            }}>
              {step.title}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.82rem',
              color: 'var(--text-dim)',
              lineHeight: 1.8,
              whiteSpace: 'pre',
            }}>
              {step.lines.map((line, li) =>
                line === '' ? <div key={li} style={{ height: '0.4rem' }} /> :
                  li === step.lines.length - 1 || (line.includes('=') && li > step.lines.findIndex(l => l === '')) ? (
                    <div key={li} style={{ color: step.color, fontWeight: 600 }}>{line}</div>
                  ) : (
                    <div key={li}>{line}</div>
                  )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

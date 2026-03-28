import React, { useEffect, useRef, useState, useCallback } from 'react'
import { formatDelay, MEDIUMS } from '../utils/calculations'

// ─────────────────────────────────────────────
//  SVG dimensions & key positions
// ─────────────────────────────────────────────
const VW = 800, VH = 220
const SX = 90,  RX = 710, LY = 110   // sender X, receiver X, link Y
const LINK_START = SX + 48, LINK_END = RX - 48
const LINK_LEN   = LINK_END - LINK_START

// Medium → glow color
const MEDIUM_GLOW = {
  fiber:    '#7fb3cc',
  copper:   '#e8a87c',
  wireless: '#a8d8ef',
}

// ─────────────────────────────────────────────
//  SVG Glow Filter Defs
// ─────────────────────────────────────────────
function Defs({ medium }) {
  const col = MEDIUM_GLOW[medium] || '#7fb3cc'
  return (
    <defs>
      <filter id="glow-sm" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-lg" x="-50%" y="-100%" width="200%" height="300%">
        <feGaussianBlur stdDeviation="10" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-burst" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="16" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      {/* Packet gradient */}
      <radialGradient id="packet-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="1"/>
        <stop offset="40%" stopColor={col} stopOpacity="1"/>
        <stop offset="100%" stopColor={col} stopOpacity="0.1"/>
      </radialGradient>
      {/* Cable gradient */}
      <linearGradient id="cable-fill" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={col} stopOpacity="0.9"/>
        <stop offset="100%" stopColor={col} stopOpacity="0.3"/>
      </linearGradient>
      {/* Trail gradient */}
      <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={col} stopOpacity="0"/>
        <stop offset="100%" stopColor={col} stopOpacity="0.6"/>
      </linearGradient>
      {/* Node glow */}
      <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={col} stopOpacity="0.35"/>
        <stop offset="100%" stopColor={col} stopOpacity="0"/>
      </radialGradient>
    </defs>
  )
}

// ─────────────────────────────────────────────
//  Network Node (Sender or Receiver)
// ─────────────────────────────────────────────
function NetworkNode({ x, label, active, done, col, pulse }) {
  return (
    <g>
      {/* Outer glow ring when active */}
      {(active || done) && (
        <circle cx={x} cy={LY} r={44} fill="url(#node-glow)" filter="url(#glow-burst)"
          style={{
            animation: done ? 'none' : 'none',
            opacity: active ? 0.7 : 0.4,
          }}
        />
      )}
      {/* Pulse rings */}
      {pulse && [0,1,2].map(i => (
        <circle key={i} cx={x} cy={LY} r={36 + i * 14} fill="none"
          stroke={col} strokeWidth={1.5 - i * 0.4} opacity={0.4 - i * 0.12}
          style={{
            animation: `pulse-ring-svg ${1.2 + i * 0.4}s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
      {/* Node body */}
      <circle cx={x} cy={LY} r={32}
        fill={active || done ? col + '30' : '#1B3C53'}
        stroke={active || done ? col : '#2f607f'}
        strokeWidth={active || done ? 2.5 : 1.5}
        filter={active || done ? 'url(#glow-sm)' : undefined}
        style={{ transition: 'all 0.4s ease' }}
      />
      {/* Icon */}
      <text x={x} y={LY + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={20} style={{ userSelect: 'none' }}>
        {label === 'Sender' ? '💻' : '🖥️'}
      </text>
      {/* Label */}
      <text x={x} y={LY + 50} textAnchor="middle" dominantBaseline="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize={11} fontWeight={600} fill={active || done ? col : '#6d8ea0'}
        letterSpacing="0.08em" style={{ textTransform: 'uppercase' }}>
        {label}
      </text>
    </g>
  )
}

// ─────────────────────────────────────────────
//  Main Visualization
// ─────────────────────────────────────────────
export default function Visualization({ results, inputs, isPlaying, setIsPlaying }) {
  const { propDelay, transDelay, totalDelay } = results
  const { medium } = inputs

  const [phase, setPhase]           = useState('idle')
  const [txProg, setTxProg]         = useState(0)   // 0→1 transmission progress
  const [propProg, setPropProg]     = useState(0)   // 0→1 propagation progress
  const [elapsed, setElapsed]       = useState(0)
  const [burstActive, setBurst]     = useState(false)

  const animRef     = useRef(null)
  const startRef    = useRef(null)
  const pausedRef   = useRef(0)   // time already elapsed before pause

  const ANIM_TOTAL  = Math.max(totalDelay, 1e-12)
  const TX_FRAC     = transDelay / ANIM_TOTAL
  const ANIM_DUR    = 5.0         // seconds for full animation

  const col = MEDIUM_GLOW[medium] || '#7fb3cc'

  const reset = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setPhase('idle'); setTxProg(0); setPropProg(0); setElapsed(0); setBurst(false)
    pausedRef.current = 0
    setIsPlaying(false)
  }, [setIsPlaying])

  // Reset when inputs change
  useEffect(() => { reset() }, [results])

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }

    const resumeFrom = pausedRef.current
    startRef.current = performance.now() - resumeFrom * 1000

    function tick(now) {
      const elS = (now - startRef.current) / 1000
      setElapsed(elS)

      if (elS < TX_FRAC * ANIM_DUR) {
        // Transmission phase
        setPhase('transmitting')
        setTxProg(Math.min(elS / (TX_FRAC * ANIM_DUR || 0.001), 1))
        setPropProg(0)
      } else if (elS < ANIM_DUR) {
        // Propagation phase
        setPhase('propagating')
        setTxProg(1)
        const propElS = elS - TX_FRAC * ANIM_DUR
        const propDur = (1 - TX_FRAC) * ANIM_DUR
        setPropProg(Math.min(propElS / (propDur || 0.001), 1))
      } else {
        // Done
        setPhase('done')
        setTxProg(1); setPropProg(1)
        setBurst(true)
        pausedRef.current = 0
        setIsPlaying(false)
        return
      }

      pausedRef.current = elS
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [isPlaying, TX_FRAC])

  // Simulated real-time delay value for the timer
  const simTime = Math.min(elapsed / ANIM_DUR, 1) * totalDelay
  const simFmt  = formatDelay(simTime)

  // Packet X position on SVG link
  const packetX = LINK_START + propProg * LINK_LEN
  // Cable fill width (transmission)
  const cableFillW = txProg * LINK_LEN
  // Trail start
  const trailStart = Math.max(LINK_START, packetX - 120)

  // Data "bits" boxes at sender during TX
  const BIT_COUNT = 8
  const bits = Array.from({ length: BIT_COUNT }, (_, i) => {
    const threshold = (i + 1) / BIT_COUNT
    const active = txProg >= threshold
    return { active, idx: i }
  })

  function phaseLabel() {
    if (phase === 'idle')         return { text: 'Press ▶ Play to start simulation', color: '#6d8ea0' }
    if (phase === 'transmitting') return { text: '📤  Transmission Phase — loading bits onto the link…', color: col }
    if (phase === 'propagating')  return { text: '🚀  Propagation Phase — signal traveling through medium…', color: col }
    if (phase === 'done')         return { text: '✅  Packet received! Simulation complete.', color: '#a8efb0' }
    return { text: '', color: '' }
  }

  const lbl = phaseLabel()

  return (
    <div className="card fade-in" style={{ padding: '1.75rem' }}>

      {/* Style injected for SVG keyframe animations */}
      <style>{`
        @keyframes pulse-ring-svg {
          0%   { r: 36px; opacity: 0.5; }
          100% { r: 70px; opacity: 0; }
        }
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 1; }
          100% { opacity: 0.4; }
        }
        @keyframes flow-dots {
          0%   { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Phase label */}
      <div style={{
        textAlign: 'center', marginBottom: '1rem',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600, fontSize: '0.88rem',
        color: lbl.color,
        minHeight: '1.4em',
        transition: 'color 0.4s',
        letterSpacing: '0.01em',
      }}>
        {lbl.text}
      </div>

      {/* ── SVG Canvas ── */}
      <div style={{
        background: '#0d2035',
        borderRadius: '1rem',
        border: '1px solid #2f607f',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.5), 0 0 0 1px ${col}15`,
      }}>

        {/* Subtle dot-grid background via ::before simulation */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: 'auto', display: 'block', minHeight: 160 }}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs medium={medium} />

          {/* Background dot grid */}
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 20 }, (_, col2) => (
              <circle key={`${row}-${col2}`}
                cx={col2 * 44 + 10} cy={row * 22 + 10}
                r={1} fill="#1d4060" opacity={0.5}
              />
            ))
          )}

          {/* ── Cable base line ── */}
          <line x1={LINK_START} y1={LY} x2={LINK_END} y2={LY}
            stroke="#1f4a65" strokeWidth={6} strokeLinecap="round"
          />

          {/* Flow dots on cable (idle state) */}
          {phase === 'idle' && (
            <line x1={LINK_START} y1={LY} x2={LINK_END} y2={LY}
              stroke="#2f607f" strokeWidth={2}
              strokeDasharray="6 14"
              style={{ animation: 'flow-dots 1s linear infinite' }}
            />
          )}

          {/* Transmission fill — cable lights up left-to-right */}
          {(phase === 'transmitting' || phase === 'propagating' || phase === 'done') && (
            <>
              <line
                x1={LINK_START} y1={LY}
                x2={LINK_START + cableFillW} y2={LY}
                stroke={col} strokeWidth={6} strokeLinecap="round"
                opacity={phase === 'propagating' || phase === 'done' ? 0.35 : 0.9}
                filter="url(#glow-sm)"
                style={{ transition: 'opacity 0.6s' }}
              />
              {/* Shimmer effect on filled part */}
              {phase === 'transmitting' && (
                <line
                  x1={LINK_START} y1={LY}
                  x2={LINK_START + cableFillW} y2={LY}
                  stroke="white" strokeWidth={1.5} strokeLinecap="round"
                  opacity={0.5}
                  style={{ animation: 'shimmer 0.8s ease-in-out infinite' }}
                />
              )}
            </>
          )}

          {/* ── Propagation packet travel ── */}
          {(phase === 'propagating') && (
            <>
              {/* Trail */}
              <line
                x1={trailStart} y1={LY}
                x2={packetX} y2={LY}
                stroke="url(#trail-grad)" strokeWidth={8} strokeLinecap="round"
                filter="url(#glow-sm)"
              />
              {/* Outer glow */}
              <circle cx={packetX} cy={LY} r={18} fill={col} opacity={0.15}
                filter="url(#glow-lg)"
              />
              {/* Mid glow */}
              <circle cx={packetX} cy={LY} r={10} fill={col} opacity={0.4}
                filter="url(#glow-sm)"
              />
              {/* Packet core */}
              <circle cx={packetX} cy={LY} r={7}
                fill="url(#packet-grad)"
                filter="url(#glow-sm)"
              />
              {/* Bright center */}
              <circle cx={packetX} cy={LY} r={3} fill="white" opacity={0.9} />

              {/* Speed lines behind packet */}
              {[6, 14, 22].map(offset => (
                <line key={offset}
                  x1={Math.max(LINK_START, packetX - offset - 25)} y1={LY - (offset === 14 ? 0 : offset === 6 ? 4 : -4)}
                  x2={Math.max(LINK_START, packetX - offset)} y2={LY - (offset === 14 ? 0 : offset === 6 ? 4 : -4)}
                  stroke={col} strokeWidth={1.5} opacity={0.3 - offset * 0.008}
                />
              ))}
            </>
          )}

          {/* Reception burst */}
          {phase === 'done' && (
            <>
              {[18, 30, 42].map((r, i) => (
                <circle key={r} cx={RX} cy={LY} r={r}
                  fill="none" stroke={col}
                  strokeWidth={2 - i * 0.5}
                  opacity={0.7 - i * 0.2}
                  filter="url(#glow-sm)"
                />
              ))}
            </>
          )}

          {/* Bit boxes above sender during TX */}
          {(phase === 'transmitting' || phase === 'propagating' || phase === 'done') && (
            <g>
              <text x={SX} y={LY - 52} textAnchor="middle"
                fontFamily="'Space Grotesk', sans-serif"
                fontSize={9} fill="#6d8ea0" letterSpacing="0.06em">
                BUFFER
              </text>
              {bits.map(({ active, idx }) => (
                <rect key={idx}
                  x={SX - 38 + idx * 10} y={LY - 46}
                  width={8} height={8}
                  rx={2}
                  fill={active ? col : '#1B3C53'}
                  stroke={active ? col : '#2f607f'}
                  strokeWidth={1}
                  opacity={active ? 1 : 0.4}
                  filter={active ? 'url(#glow-sm)' : undefined}
                  style={{ transition: 'fill 0.2s, opacity 0.2s' }}
                />
              ))}
            </g>
          )}

          {/* Medium label on cable */}
          <text x={(LINK_START + LINK_END) / 2} y={LY - 18}
            textAnchor="middle"
            fontFamily="'Space Grotesk', sans-serif"
            fontSize={10} fill="#456882" letterSpacing="0.08em"
            fontWeight={600}>
            {MEDIUMS[medium]?.label?.toUpperCase()} · {(MEDIUMS[medium]?.speed / 1e8).toFixed(1)}×10⁸ m/s
          </text>

          {/* Sender Node */}
          <NetworkNode
            x={SX} label="Sender"
            active={phase === 'transmitting'}
            done={phase === 'propagating' || phase === 'done'}
            col={col}
            pulse={phase === 'transmitting'}
          />

          {/* Receiver Node */}
          <NetworkNode
            x={RX} label="Receiver"
            active={phase === 'done'}
            done={phase === 'done'}
            col={col}
            pulse={phase === 'done'}
          />
        </svg>

        {/* Timer overlay */}
        <div style={{
          position: 'absolute', bottom: 10, right: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem', color: phase === 'idle' ? '#2f607f' : col,
          fontWeight: 600,
          transition: 'color 0.3s',
        }}>
          {phase === 'idle' ? '⏱ 0.000 —' : `⏱ ${simFmt.value} ${simFmt.unit}`}
          <span style={{ fontSize: '0.62rem', color: '#2f607f', marginLeft: '0.4rem' }}>sim time</span>
        </div>
      </div>

      {/* ── Phase Progress Bars ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
        {[
          { label: 'Transmission', prog: txProg, col: col, delay: transDelay, phase: 'transmitting', cur: phase },
          { label: 'Propagation',  prog: propProg, col: col, delay: propDelay,  phase: 'propagating', cur: phase },
        ].map(bar => (
          <div key={bar.label} style={{
            background: 'var(--bg2)',
            border: `1px solid ${bar.cur === bar.phase ? bar.col + '60' : 'var(--border)'}`,
            borderRadius: '0.75rem',
            padding: '0.85rem 1rem',
            transition: 'border-color 0.3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: bar.cur === bar.phase ? bar.col : '#6d8ea0', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {bar.label}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: bar.col }}>
                {formatDelay(bar.delay).value} {formatDelay(bar.delay).unit}
              </span>
            </div>
            {/* Progress track */}
            <div style={{ height: 6, background: '#0d2035', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${bar.prog * 100}%`,
                background: `linear-gradient(90deg, ${bar.col}90, ${bar.col})`,
                borderRadius: 3,
                transition: 'none',
                boxShadow: bar.cur === bar.phase ? `0 0 8px ${bar.col}` : 'none',
              }} />
            </div>
            <div style={{ marginTop: '0.3rem', fontSize: '0.65rem', color: '#456882', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>
              {(bar.prog * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="btn-primary" style={{ minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={phase === 'done'}
        >
          {isPlaying ? '⏸ Pause' : phase === 'idle' ? '▶ Play' : phase === 'done' ? '✅ Done' : '▶ Resume'}
        </button>
        <button className="btn-outline" onClick={reset}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ↺ Reset
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {[
          { col, label: 'Transmission fill (TX phase)' },
          { col: 'white', label: 'Packet + glow (propagation)' },
          { col: '#a8efb0', label: 'Arrival at receiver' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#6d8ea0', fontFamily: "'Space Grotesk', sans-serif" }}>
            <div style={{ width: i === 2 ? 10 : 12, height: i === 2 ? 10 : 6, borderRadius: i === 1 ? '50%' : 3, background: item.col, opacity: i === 1 ? 0.9 : 1 }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

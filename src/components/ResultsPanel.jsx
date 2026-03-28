import React from 'react'
import { formatDelay, formatBDP, toMs, toUs } from '../utils/calculations'

function ResultCard({ icon, title, seconds, color, tip, wide }) {
  const ms  = toMs(seconds)
  const us  = toUs(seconds)
  const main = formatDelay(seconds)

  return (
    <div className="tooltip" data-tip={tip} style={{
      background: 'var(--bg2)',
      border: `1px solid ${color}35`,
      borderTop: `3px solid ${color}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      gridColumn: wide ? 'span 2' : 'span 1',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: '0.625rem',
          background: `${color}18`,
          border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {title}
        </span>
      </div>

      {/* Main value */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: '2rem',
        color,
        lineHeight: 1,
        marginBottom: '0.6rem',
      }}>
        {main.value}
        <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.3rem', opacity: 0.8 }}>
          {main.unit}
        </span>
      </div>

      {/* Sub-units */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: '0.1rem' }}>MILLISECONDS</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--text-dim)' }}>{ms.toFixed(6)} ms</div>
        </div>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.06em', marginBottom: '0.1rem' }}>MICROSECONDS</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--text-dim)' }}>{us.toFixed(3)} µs</div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPanel({ results, inputs }) {
  const { propDelay, transDelay, totalDelay, bdp } = results
  const { bandwidthBps } = inputs

  return (
    <div className="card fade-in" style={{ padding: '1.75rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
      }}>
        <ResultCard
          icon="🚀" title="Propagation Delay"
          seconds={propDelay} color="#7fb3cc"
          tip="Time for signal to travel through medium — depends on distance & medium speed"
        />
        <ResultCard
          icon="📤" title="Transmission Delay"
          seconds={transDelay} color="#5a9bb8"
          tip="Time to push all bits onto the wire — depends on packet size & bandwidth"
        />
        <ResultCard
          icon="⏱️" title="Total End-to-End Delay"
          seconds={totalDelay} color="#a8d8ef"
          tip="Sum of propagation + transmission delay"
        />

        {/* BDP card */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid #2f607f40',
          borderTop: '3px solid #456882',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '0.625rem',
              background: 'rgba(69,104,130,0.2)',
              border: '1px solid rgba(69,104,130,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>📡</div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Bandwidth-Delay Product
            </span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, fontSize: '1.6rem',
            color: '#6d8ea0', lineHeight: 1, marginBottom: '0.5rem',
          }}>
            {formatBDP(bdp)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            {(bandwidthBps / 1e6).toFixed(0)} Mbps × Prop Delay
            <br />Data "in flight" at any moment
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import {
  calcPropagationDelay,
  calcTransmissionDelay,
  calcTotalDelay,
  calcBandwidthDelayProduct,
  formatDelay,
  formatBDP,
  MEDIUMS,
} from '../utils/calculations'

export default function ComparisonPanel({ inputs }) {
  const { distanceM, packetBits, bandwidth, medium: activeMedium } = inputs
  const bandwidthBps = bandwidth * 1e6

  const rows = Object.entries(MEDIUMS).map(([key, m]) => {
    const prop = calcPropagationDelay(distanceM, m.speed)
    const trans = calcTransmissionDelay(packetBits, bandwidthBps)
    const total = calcTotalDelay(prop, trans)
    const bdp = calcBandwidthDelayProduct(bandwidthBps, prop)
    return { key, m, prop, trans, total, bdp }
  })

  return (
    <div className="card fade-in">
      <div className="section-title">
        <span>⚡</span> Medium Comparison
        <span className="badge">Same inputs, all mediums</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              {['Medium', 'Speed', 'Prop Delay', 'Trans Delay', 'Total', 'BDP'].map(h => (
                <th key={h} style={{
                  textAlign: h === 'Medium' ? 'left' : 'right',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1.5px solid var(--border)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, m, prop, trans, total, bdp }) => {
              const isActive = key === activeMedium
              return (
                <tr key={key} style={{
                  background: isActive ? 'rgba(192,133,82,0.1)' : 'var(--surface)',
                  borderRadius: '0.75rem',
                  outline: isActive ? '2px solid var(--primary)' : 'none',
                }}>
                  <td style={{ padding: '0.75rem', borderRadius: '0.75rem 0 0 0.75rem', fontWeight: 600 }}>
                    <span style={{ marginRight: '0.4rem' }}>{m.emoji}</span>
                    {m.label}
                    {isActive && <span className="badge" style={{ marginLeft: '0.4rem' }}>active</span>}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--muted)', fontFamily: 'monospace' }}>
                    {(m.speed / 1e8).toFixed(1)}×10⁸
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                    {formatDelay(prop).value} {formatDelay(prop).unit}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', color: 'var(--secondary)', fontWeight: 600 }}>
                    {formatDelay(trans).value} {formatDelay(trans).unit}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--dark)' }}>
                    {formatDelay(total).value} {formatDelay(total).unit}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', borderRadius: '0 0.75rem 0.75rem 0', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '0.75rem' }}>
                    {formatBDP(bdp)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Speed summary bar */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="label">Relative Propagation Speed</div>
        {Object.entries(MEDIUMS).map(([key, m]) => {
          const maxSpeed = 3e8
          const pct = (m.speed / maxSpeed) * 100
          return (
            <div key={key} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                <span>{m.emoji} {m.label}</span>
                <span>{pct.toFixed(0)}% of c</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: m.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

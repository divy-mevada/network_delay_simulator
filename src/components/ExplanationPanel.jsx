import React, { useState } from 'react'
import { formatDelay } from '../utils/calculations'

const sections = [
  {
    id: 'prop',
    title: '🚀 What is Propagation Delay?',
    content: `Propagation delay is the time it takes for a single bit (or signal) to travel from the sender to the receiver through the physical medium. It depends entirely on the distance and the speed of the signal in that medium — not on how much data you're sending.

Formula:  Propagation Delay = Distance / Speed of Signal

Key insight: A fiber optic cable between two continents will have a much higher propagation delay than a LAN cable across a room, regardless of bandwidth.`,
    examples: [
      { label: 'LAN (100m, Fiber)', value: '0.5 µs' },
      { label: 'Cross-country fiber (5000 km)', value: '25 ms' },
      { label: 'Satellite link (35,786 km)', value: '~119 ms' },
    ]
  },
  {
    id: 'trans',
    title: '📤 What is Transmission Delay?',
    content: `Transmission delay is the time needed to push all the bits of a packet onto the network link. It depends on the packet size and the bandwidth (capacity) of the link.

Formula:  Transmission Delay = Packet Size (in bits) / Bandwidth (in bps)

Key insight: A 10 Gbps link will transmit a 1 MB file 100× faster than a 100 Mbps link. The distance between sender and receiver doesn't matter here at all.`,
    examples: [
      { label: '1 MB over 1 Gbps', value: '8 µs' },
      { label: '1 MB over 10 Mbps', value: '0.8 ms' },
      { label: '1 MB over 56 Kbps (dial-up!)', value: '~143 s' },
    ]
  },
  {
    id: 'diff',
    title: '⚖️ Key Differences',
    content: null,
    table: [
      ['Aspect', 'Propagation Delay', 'Transmission Delay'],
      ['Depends on', 'Distance + Medium type', 'Packet size + Bandwidth'],
      ['Affected by BW?', '❌ No', '✅ Yes'],
      ['Affected by distance?', '✅ Yes', '❌ No'],
      ['Example analogy', 'Car driving to destination', 'Loading passengers into bus'],
      ['Dominant in', 'Long-distance WAN/satellite', 'Low-bandwidth or large packets'],
    ]
  },
  {
    id: 'bdp',
    title: '📡 Bandwidth-Delay Product (BDP)',
    content: `BDP = Bandwidth × Propagation Delay

This tells you how many bits are "in flight" on the network at any given time — the amount of data that can be in transit simultaneously. Networks with large BDPs are called "long fat networks" (LFNs).

High BDP networks (e.g., satellite + high bandwidth) require large buffer sizes and special TCP tuning to utilize capacity effectively.`,
    examples: [
      { label: 'LAN: 1 Gbps × 0.5µs', value: '500 bits' },
      { label: 'WAN: 100 Mbps × 25ms', value: '2.5 Mbits' },
      { label: 'Satellite: 50 Mbps × 119ms', value: '5.95 Mbits' },
    ]
  },
  {
    id: 'realworld',
    title: '🌐 Real-World Examples',
    content: null,
    cards: [
      {
        icon: '🔆',
        title: 'Fiber Optic Cables',
        desc: 'Light travels at ~2/3 the speed of light in vacuum (≈2×10⁸ m/s). Fiber is the backbone of the internet — used in transcontinental cables. Despite high bandwidth, a Sydney→London path (≈17,000 km) still has ~57ms propagation delay minimum.'
      },
      {
        icon: '🛸',
        title: 'Geostationary Satellite',
        desc: 'Satellites orbit at ~35,786 km altitude. Signal must travel up then down — minimum one-way delay ≈119ms. Full round-trip (ping) is ~240ms. This makes interactive applications (gaming, VoIP) challenging over satellite.'
      },
      {
        icon: '📡',
        title: 'LEO Satellites (Starlink)',
        desc: 'Low Earth Orbit satellites at ~550km altitude give ≈1.8ms propagation delay. Much better for interactivity! But you need a constellation of thousands of satellites to maintain coverage.'
      },
      {
        icon: '🏠',
        title: 'Local Area Network',
        desc: 'Within a building (100m), propagation delay over fiber is just 0.5 µs. Transmission delay at 1Gbps for a 1KB packet is 8µs. In LANs, transmission delay often dominates!'
      }
    ]
  }
]

function AccordionItem({ section, inputs, results }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <span>{section.title}</span>
        <span style={{ color: 'var(--primary)', fontSize: '1.2rem', transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
      {open && (
        <div className="accordion-body fade-in">
          {section.content && (
            <div style={{ whiteSpace: 'pre-line', marginBottom: section.examples ? '1rem' : 0 }}>
              {section.content}
            </div>
          )}

          {section.examples && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {section.examples.map((ex, i) => (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.78rem',
                }}>
                  <span style={{ color: 'var(--muted)' }}>{ex.label}:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', marginLeft: '0.4rem' }}>{ex.value}</span>
                </div>
              ))}
            </div>
          )}

          {section.table && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    {section.table[0].map((h, i) => (
                      <th key={i} style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: 'left',
                        background: 'rgba(192,133,82,0.1)',
                        fontWeight: 700,
                        color: 'var(--dark)',
                        borderBottom: '1.5px solid var(--border)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.slice(1).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{
                          padding: '0.5rem 0.75rem',
                          fontWeight: j === 0 ? 600 : 400,
                          color: j === 0 ? 'var(--dark)' : 'var(--muted)',
                        }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.cards && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {section.cards.map((card, i) => (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>{card.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExplanationPanel({ inputs, results }) {
  return (
    <div className="card fade-in">
      <div className="section-title">
        <span>📚</span> Concepts & Explanations
        <span className="badge">Viva Ready</span>
      </div>
      <div>
        {sections.map(section => (
          <AccordionItem
            key={section.id}
            section={section}
            inputs={inputs}
            results={results}
          />
        ))}
      </div>
    </div>
  )
}

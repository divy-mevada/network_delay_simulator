import React, { useState } from 'react'
import { MEDIUMS, PRESETS } from '../utils/calculations'

// Tooltip wrapper
function Tip({ children, tip }) {
  return (
    <span className="tooltip" data-tip={tip}>
      {children}
    </span>
  )
}

// Slider + number input combined
function SliderInput({ label, tip, value, min, max, step, unit, unitOptions, onUnitChange, onChange }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <Tip tip={tip}>
          <span className="label" style={{ margin: 0, cursor: 'help' }}>
            {label} <span style={{ color: 'var(--primary)', opacity: 0.7 }}>ⓘ</span>
          </span>
        </Tip>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            style={{ width: '80px', textAlign: 'right' }}
          />
          {unitOptions && (
            <div style={{ display: 'flex', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
              {unitOptions.map(u => (
                <button
                  key={u}
                  onClick={() => onUnitChange(u)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: unit === u ? 'var(--primary)' : 'transparent',
                    color: unit === u ? 'white' : 'var(--muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function InputPanel({ state, onUpdate }) {
  const { distance, distanceUnit, medium, packetSize, packetUnit, bandwidth } = state

  function applyPreset(preset) {
    onUpdate({
      distance: preset.distance,
      distanceUnit: preset.distanceUnit,
      medium: preset.medium,
      packetSize: preset.packetSize,
      packetUnit: preset.packetUnit,
      bandwidth: preset.bandwidth,
    })
  }

  return (
    <div className="card fade-in">
      <div className="section-title">
        <span>⚙️</span> Configuration
      </div>

      {/* Presets */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="label">Quick Presets</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              className="btn-outline"
              onClick={() => applyPreset(preset)}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
              title={preset.description}
            >
              {preset.emoji} {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <SliderInput
        label="Distance"
        tip="The physical distance between sender and receiver"
        value={distance}
        min={1}
        max={distanceUnit === 'km' ? 50000 : 10000}
        step={distanceUnit === 'km' ? 10 : 100}
        unit={` ${distanceUnit}`}
        unitOptions={['m', 'km']}
        onUnitChange={u => onUpdate({ distanceUnit: u })}
        onChange={v => onUpdate({ distance: v })}
      />

      {/* Medium */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Tip tip="The physical medium through which the signal propagates">
          <span className="label" style={{ cursor: 'help' }}>
            Medium <span style={{ color: 'var(--primary)', opacity: 0.7 }}>ⓘ</span>
          </span>
        </Tip>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {Object.entries(MEDIUMS).map(([key, m]) => (
            <div
              key={key}
              className={`medium-card ${medium === key ? 'selected' : ''}`}
              onClick={() => onUpdate({ medium: key })}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{m.emoji}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>{m.label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                {(m.speed / 1e8).toFixed(1)}×10⁸ m/s
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Packet Size */}
      <SliderInput
        label="Packet Size"
        tip="The size of the data packet being transmitted"
        value={packetSize}
        min={1}
        max={packetUnit === 'MB' ? 100 : 10240}
        step={packetUnit === 'MB' ? 1 : 64}
        unit={` ${packetUnit}`}
        unitOptions={['KB', 'MB']}
        onUnitChange={u => onUpdate({ packetUnit: u })}
        onChange={v => onUpdate({ packetSize: v })}
      />

      {/* Bandwidth */}
      <SliderInput
        label="Bandwidth"
        tip="The capacity of the network link in megabits per second"
        value={bandwidth}
        min={1}
        max={10000}
        step={1}
        unit=" Mbps"
        onChange={v => onUpdate({ bandwidth: v })}
      />
    </div>
  )
}

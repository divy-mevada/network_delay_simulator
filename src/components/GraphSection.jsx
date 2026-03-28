import React, { useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  genDistanceVsPropData,
  genPacketVsTransData,
  genBwVsDelayData,
  genMediumComparisonData,
  MEDIUMS,
} from '../utils/calculations'

const COLORS = {
  primary: '#C08552',
  secondary: '#8C5A3C',
  accent: '#D4965E',
  fiber: '#C08552',
  copper: '#8C5A3C',
  wireless: '#D4965E',
}

function ChartCard({ title, children, tip }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        📈 {title}
        {tip && (
          <span className="badge" style={{ marginLeft: 'auto' }}>interactive</span>
        )}
      </div>
      {children}
    </div>
  )
}

const chartStyle = {
  fontSize: '10px',
  fontFamily: 'Inter, sans-serif',
}

const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  fontSize: '0.75rem',
  color: 'var(--text)',
}

export default function GraphSection({ inputs, results }) {
  const { speedMs, bandwidthBps, packetBits, medium } = inputs

  const distVsProp = useMemo(() => genDistanceVsPropData(speedMs), [speedMs])
  const packetVsTrans = useMemo(() => genPacketVsTransData(bandwidthBps), [bandwidthBps])
  const bwVsDelay = useMemo(() => genBwVsDelayData(packetBits), [packetBits])
  const mediumComp = useMemo(() => genMediumComparisonData(), [])

  return (
    <div>
      <div className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
        <span>📉</span> Dynamic Performance Graphs
        <span className="badge">Updates with inputs</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>

        {/* Graph 1: Distance vs Propagation Delay */}
        <ChartCard title="Distance vs Propagation Delay" tip>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={distVsProp} style={chartStyle}>
              <defs>
                <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dist" tick={chartStyle} label={{ value: 'Distance (km)', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={chartStyle} label={{ value: 'Delay (ms)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ms`, 'Prop Delay']} />
              <Area type="monotone" dataKey="delay" stroke={COLORS[medium] || COLORS.primary} fill="url(#propGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '0.25rem' }}>
            Medium: {MEDIUMS[medium]?.label}
          </div>
        </ChartCard>

        {/* Graph 2: Packet Size vs Transmission Delay */}
        <ChartCard title="Packet Size vs Transmission Delay" tip>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={packetVsTrans} style={chartStyle}>
              <defs>
                <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="size" tick={chartStyle} label={{ value: 'Packet Size (KB)', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={chartStyle} label={{ value: 'Delay (ms)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ms`, 'Trans Delay']} />
              <Area type="monotone" dataKey="delay" stroke={COLORS.secondary} fill="url(#transGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '0.25rem' }}>
            Bandwidth: {(bandwidthBps / 1e6).toFixed(0)} Mbps
          </div>
        </ChartCard>

        {/* Graph 3: Bandwidth vs Transmission Delay */}
        <ChartCard title="Bandwidth vs Transmission Delay" tip>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bwVsDelay} style={chartStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="bw" tick={chartStyle} label={{ value: 'Bandwidth (Mbps)', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={chartStyle} label={{ value: 'Delay (ms)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ms`, 'Trans Delay']} />
              <Line type="monotone" dataKey="delay" stroke={COLORS.accent} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '0.25rem' }}>
            Packet Size: {(packetBits / 8 / 1024).toFixed(1)} KB
          </div>
        </ChartCard>

        {/* Graph 4: Medium Comparison */}
        <ChartCard title="Medium Comparison — All Mediums" tip>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mediumComp} style={chartStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dist" tick={chartStyle} label={{ value: 'Distance (km)', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={chartStyle} label={{ value: 'Prop Delay (ms)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ms`]} />
              <Legend wrapperStyle={{ fontSize: '0.7rem', color: 'var(--muted)' }} />
              <Line type="monotone" dataKey="fiber" stroke={COLORS.fiber} strokeWidth={2} dot={false} name="Fiber" />
              <Line type="monotone" dataKey="copper" stroke={COLORS.copper} strokeWidth={2} dot={false} name="Copper" />
              <Line type="monotone" dataKey="wireless" stroke={COLORS.wireless} strokeWidth={2} dot={false} strokeDasharray="5 5" name="Wireless" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '0.25rem' }}>
            Propagation delay for all three mediums vs distance
          </div>
        </ChartCard>

      </div>
    </div>
  )
}

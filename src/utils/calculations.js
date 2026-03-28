// ============================================================
// Network Delay Calculations — Pure Utility Functions
// ============================================================

// Medium propagation speeds (m/s)
export const MEDIUMS = {
  fiber:    { label: 'Fiber Optic',  speed: 2e8, color: '#C08552' },
  copper:   { label: 'Copper Cable', speed: 1.5e8, color: '#8C5A3C' },
  wireless: { label: 'Wireless',     speed: 3e8, color: '#D4965E' },
};

// --- Core Calculations ---

/**
 * Propagation Delay = Distance / Speed of Light in Medium
 * @param {number} distanceM - Distance in meters
 * @param {number} speedMs   - Speed in m/s
 * @returns {number} Delay in seconds
 */
export function calcPropagationDelay(distanceM, speedMs) {
  if (!speedMs || !distanceM) return 0;
  return distanceM / speedMs;
}

/**
 * Transmission Delay = Packet Size (bits) / Bandwidth (bps)
 * @param {number} packetBits    - Packet size in bits
 * @param {number} bandwidthBps  - Bandwidth in bits per second
 * @returns {number} Delay in seconds
 */
export function calcTransmissionDelay(packetBits, bandwidthBps) {
  if (!bandwidthBps || !packetBits) return 0;
  return packetBits / bandwidthBps;
}

/**
 * Total End-to-End Delay
 */
export function calcTotalDelay(propDelay, transDelay) {
  return propDelay + transDelay;
}

/**
 * Bandwidth-Delay Product = Bandwidth × Propagation Delay
 * Represents the amount of data "in flight" at any time (in bits)
 * @param {number} bandwidthBps
 * @param {number} propDelaySec
 * @returns {number} BDP in bits
 */
export function calcBandwidthDelayProduct(bandwidthBps, propDelaySec) {
  return bandwidthBps * propDelaySec;
}

// --- Unit Conversion Helpers ---

export function toMs(seconds) { return seconds * 1000; }
export function toUs(seconds) { return seconds * 1_000_000; }

/**
 * Auto-format a delay in seconds to the most readable unit
 */
export function formatDelay(seconds) {
  if (seconds === 0) return { value: '0', unit: 's', raw: 0 };
  if (seconds >= 1)         return { value: seconds.toFixed(4),        unit: 's',  raw: seconds };
  if (seconds >= 0.001)     return { value: toMs(seconds).toFixed(4),  unit: 'ms', raw: toMs(seconds) };
  return                           { value: toUs(seconds).toFixed(4),  unit: 'µs', raw: toUs(seconds) };
}

/**
 * Format BDP in bits → human-readable
 */
export function formatBDP(bits) {
  if (bits === 0) return '0 bits';
  if (bits >= 1e9) return (bits / 1e9).toFixed(3) + ' Gbits';
  if (bits >= 1e6) return (bits / 1e6).toFixed(3) + ' Mbits';
  if (bits >= 1e3) return (bits / 1e3).toFixed(3) + ' Kbits';
  return bits.toFixed(1) + ' bits';
}

// --- Input Converters ---

/**
 * Convert distance to meters based on unit
 */
export function toMeters(value, unit) {
  return unit === 'km' ? value * 1000 : value;
}

/**
 * Convert packet size to bits
 */
export function toPacketBits(value, unit) {
  const bytes = unit === 'MB' ? value * 1024 * 1024 : value * 1024;
  return bytes * 8;
}

/**
 * Convert bandwidth Mbps → bps
 */
export function toBps(mbps) {
  return mbps * 1e6;
}

// --- Graph Data Generators ---

/**
 * Distance vs Propagation Delay data for a given medium
 * X-axis: distance from 0 to maxDist km
 */
export function genDistanceVsPropData(speedMs, maxDistKm = 50000) {
  const points = 30;
  return Array.from({ length: points }, (_, i) => {
    const distM = ((i + 1) / points) * maxDistKm * 1000;
    const delay = calcPropagationDelay(distM, speedMs);
    return {
      dist: +(distM / 1000).toFixed(0),
      delay: +toMs(delay).toFixed(4),
    };
  });
}

/**
 * Packet Size vs Transmission Delay
 * X-axis: packet size from 1KB to 100MB
 */
export function genPacketVsTransData(bandwidthBps, maxKB = 10240) {
  const points = 30;
  return Array.from({ length: points }, (_, i) => {
    const kb = ((i + 1) / points) * maxKB;
    const bits = kb * 1024 * 8;
    const delay = calcTransmissionDelay(bits, bandwidthBps);
    return {
      size: +kb.toFixed(0),
      delay: +toMs(delay).toFixed(4),
    };
  });
}

/**
 * Bandwidth vs Transmission Delay
 * X-axis: bandwidth from 1Mbps to 10Gbps
 */
export function genBwVsDelayData(packetBits) {
  const points = 30;
  const maxMbps = 10000;
  return Array.from({ length: points }, (_, i) => {
    const mbps = ((i + 1) / points) * maxMbps;
    const bps = mbps * 1e6;
    const delay = calcTransmissionDelay(packetBits, bps);
    return {
      bw: +mbps.toFixed(0),
      delay: +toMs(delay).toFixed(6),
    };
  });
}

/**
 * Medium comparison: Fiber vs Copper vs Wireless (prop delay vs distance)
 */
export function genMediumComparisonData(maxDistKm = 50000) {
  const points = 20;
  return Array.from({ length: points }, (_, i) => {
    const distM = ((i + 1) / points) * maxDistKm * 1000;
    const distKm = +(distM / 1000).toFixed(0);
    return {
      dist: distKm,
      fiber:    +toMs(calcPropagationDelay(distM, MEDIUMS.fiber.speed)).toFixed(4),
      copper:   +toMs(calcPropagationDelay(distM, MEDIUMS.copper.speed)).toFixed(4),
      wireless: +toMs(calcPropagationDelay(distM, MEDIUMS.wireless.speed)).toFixed(4),
    };
  });
}

// --- Presets ---

export const PRESETS = [
  {
    id: 'lan',
    label: 'LAN',
    description: 'Short distance, high bandwidth',
    distance: 100,
    distanceUnit: 'm',
    medium: 'fiber',
    packetSize: 64,
    packetUnit: 'KB',
    bandwidth: 1000,
  },
  {
    id: 'wan',
    label: 'WAN',
    description: 'Long distance, moderate bandwidth',
    distance: 5000,
    distanceUnit: 'km',
    medium: 'fiber',
    packetSize: 512,
    packetUnit: 'KB',
    bandwidth: 100,
  },
  {
    id: 'satellite',
    label: 'Satellite',
    description: 'Very long distance, wireless',
    distance: 35786,
    distanceUnit: 'km',
    medium: 'wireless',
    packetSize: 1,
    packetUnit: 'MB',
    bandwidth: 50,
  },
];

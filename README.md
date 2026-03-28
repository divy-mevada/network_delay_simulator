# Network Delay Simulator

An interactive React app for learning and analyzing network delay behavior in data communication systems.

The simulator lets you change distance, packet size, medium type, and bandwidth, then instantly visualizes:
- Propagation delay
- Transmission delay
- Total delay
- Bandwidth-delay product (BDP)

It is designed as an educational tool for students and anyone learning networking fundamentals.

## Features

- Real-time delay calculation updates from input changes
- Side-by-side network medium comparison (fiber, copper, wireless)
- Step-by-step formula breakdown for each metric
- Graph-based analysis of delay trends
- Live simulation panel and explanatory content
- In-browser only execution (no backend, no stored data)

## Core Formulas

- Propagation Delay = Distance / Propagation Speed in Medium
- Transmission Delay = Packet Size (bits) / Bandwidth (bps)
- Total Delay = Propagation Delay + Transmission Delay
- Bandwidth-Delay Product = Bandwidth x Propagation Delay

## Tech Stack

- React 19
- Vite 8
- Recharts (graph visualizations)
- Framer Motion (animations)
- ESLint for linting

## Project Structure

- `src/App.jsx`: Main app shell and section layout
- `src/components/`: UI panels and visual modules
- `src/utils/calculations.js`: Delay formulas, conversions, and graph data generators

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Use Cases

- Data Communication and Computer Networks coursework
- Demonstrating latency concepts in classroom/lab settings
- Comparing impact of medium, packet size, and bandwidth on performance

## License

This project is for educational use.

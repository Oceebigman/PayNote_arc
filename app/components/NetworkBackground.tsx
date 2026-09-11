'use client'

import { useEffect, useState } from 'react'

// Animated node network for the hero background — payment tokens travel
// along the lines between nodes, standing in for USDC/EURC/cirBTC moving
// across the network. Pure SVG/CSS, no dependencies. Labeled explicitly
// (not just abstract dots) so the "this is a payments network" reading
// doesn't depend on noticing the motion.

const NODES = [
  { x: 90,  y: 70,  r: 3.5, delay: 0    },
  { x: 260, y: 40,  r: 2.5, delay: 0.6  },
  { x: 430, y: 95,  r: 4,   delay: 1.2, label: 'USDC'   },
  { x: 620, y: 55,  r: 3,   delay: 0.3  },
  { x: 760, y: 120, r: 2.5, delay: 1.6  },
  { x: 130, y: 230, r: 3,   delay: 0.9  },
  { x: 360, y: 260, r: 4.5, delay: 0.2, label: 'EURC'   },
  { x: 560, y: 210, r: 3,   delay: 1.4  },
  { x: 720, y: 290, r: 2.5, delay: 0.7  },
  { x: 40,  y: 340, r: 2.5, delay: 1.1  },
  { x: 280, y: 380, r: 3,   delay: 0.4  },
  { x: 480, y: 350, r: 3.5, delay: 1.8, label: 'cirBTC' },
]

const LINES = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,6],[3,7],[4,8],
  [5,6],[6,7],[7,8],[5,9],[6,10],[7,11],[9,10],[10,11],
]

// Payments traveling along specific lines, each carrying a token symbol.
const PULSE_PATHS = [
  { from: 0, to: 6, duration: 4,   delay: 0,   token: '$' },
  { from: 3, to: 7, duration: 5,   delay: 1.5, token: '€' },
  { from: 6, to: 10, duration: 4.5, delay: 3,  token: '$' },
]

export default function NetworkBackground() {
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 'var(--network-opacity, 0.6)' }}
      aria-hidden="true"
    >
      {LINES.map(([a, b], i) => (
        <line key={i}
          x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
          stroke="#1A44C4" strokeOpacity="0.16" strokeWidth="1"
        />
      ))}

      {animate && PULSE_PATHS.map((p, i) => (
        <g key={i}>
          <circle r="7" fill="#1A44C4" fillOpacity="0.9">
            <animateMotion
              dur={`${p.duration}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
              path={`M${NODES[p.from].x},${NODES[p.from].y} L${NODES[p.to].x},${NODES[p.to].y}`}
              calcMode="linear"
            />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${p.duration}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
          </circle>
          <text fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle" dominantBaseline="central">
            <animateMotion
              dur={`${p.duration}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
              path={`M${NODES[p.from].x},${NODES[p.from].y} L${NODES[p.to].x},${NODES[p.to].y}`}
              calcMode="linear"
            />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${p.duration}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
            {p.token}
          </text>
        </g>
      ))}

      {NODES.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="#1A44C4" fillOpacity="0.35">
            {animate && (
              <>
                <animate attributeName="r" values={`${n.r};${n.r * 1.8};${n.r}`} dur="3.5s" begin={`${n.delay}s`} repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.35;0.08;0.35" dur="3.5s" begin={`${n.delay}s`} repeatCount="indefinite" />
              </>
            )}
          </circle>
          {n.label && (
            <text x={n.x} y={n.y - n.r - 8} fontSize="10" fontWeight="700" fill="#1A44C4" fillOpacity="0.55" textAnchor="middle" style={{fontFamily:'var(--font-mono)'}}>
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// src/components/custom/Snowfall.tsx
import { useMemo } from 'react'

const Snowfall = ({ count = 40 }: { count?: number }) => {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 16,
        duration: 9 + Math.random() * 10,
        delay: -Math.random() * 18,
        drift: (Math.random() - 0.5) * 90,
        opacity: 0.35 + Math.random() * 0.5,
      })),
    [count]
  )

  return (
    <div className="snowfall" aria-hidden>
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            ['--drift' as any]: `${f.drift}px`,
          }}
        >
          ❄
        </span>
      ))}
    </div>
  )
}

export default Snowfall
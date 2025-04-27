// components/DiddyMeter.tsx
import React from 'react'

type Props = {
  level: number
}

export default function DiddyMeter({ level }: Props) {
  const max = 5
  const clampedLevel = Math.min(Math.max(level, 0), max)
  const percent = (clampedLevel / max) * 100
  const color = clampedLevel < 2 ? 'bg-green-500' : clampedLevel < 4 ? 'bg-yellow-400' : 'bg-red-600'

  return (
    <div className="w-[90%] max-w-xl text-left mt-4">
      <div className="text-sm text-white font-semibold mb-1">
        Diddy Proximity 🏃 Keep running!
      </div>
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      {clampedLevel >= max && (
        <p className="text-red-400 font-bold text-sm mt-1 animate-pulse">
          Diddy's HERE. Time's up!
        </p>
      )}
    </div>
  )
}

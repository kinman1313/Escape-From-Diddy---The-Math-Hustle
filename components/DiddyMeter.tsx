// components/DiddyMeter.tsx
type Props = {
  level: number
}

export default function DiddyMeter({ level }: Props) {
  const max = 5
  return (
    <div className="w-[90%] max-w-xl">
      <div className="text-left mb-2 text-sm">Diddy Proximity</div>
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-diddyDanger transition-all duration-300"
          style={{ width: `${(level / max) * 100}%` }}
        ></div>
      </div>
      {level >= max && (
        <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">
          Diddy's here... better hustle!
        </p>
      )}
    </div>
  )
}

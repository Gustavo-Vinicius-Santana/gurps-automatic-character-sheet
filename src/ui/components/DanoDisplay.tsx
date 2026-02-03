interface DanoDisplayProps {
  st: number
  thrust: string
  swing: string
}

export default function DanoDisplay({ st, thrust, swing }: DanoDisplayProps) {
  return (
    <div className="border border-gray-700 rounded p-3">
      <h2 className="text-sm font-medium mb-2 border-b border-gray-800 pb-1">
        Dano por Força (ST: {st})
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Golpe de Perfuração</div>
          <div className="text-xl font-mono">{thrust}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Golpe de Balanço</div>
          <div className="text-xl font-mono">{swing}</div>
        </div>
      </div>
    </div>
  )
}
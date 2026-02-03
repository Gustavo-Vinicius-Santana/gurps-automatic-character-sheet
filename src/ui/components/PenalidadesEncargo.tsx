interface PenalidadesEncargoProps {
  encargo: {
    nivel: number
    dxPenalty: number
    esquiva: number
    moveMult: number
  }
}

export default function PenalidadesEncargo({ encargo }: PenalidadesEncargoProps) {
  return (
    <div className="border border-yellow-700 rounded p-3 bg-yellow-900/10">
      <h2 className="text-sm font-medium mb-2 border-b border-yellow-800 pb-1">
        Penalidades Ativas de Encargo
      </h2>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-gray-500">Destreza</div>
          <div className="text-lg text-red-400">{encargo.dxPenalty}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Esquiva</div>
          <div className="text-lg text-red-400">{encargo.esquiva}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Movimento</div>
          <div className="text-lg font-mono">×{encargo.moveMult}</div>
        </div>
      </div>
    </div>
  )
}
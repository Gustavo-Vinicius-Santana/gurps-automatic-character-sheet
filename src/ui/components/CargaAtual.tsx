interface CargaAtualProps {
  peso: string
  onPesoChange: (value: string) => void
  valoresCombate: {
    pesoNumero: number
    cargaRatio: number
    enc: {
      label: string
      nivel: number
      dxPenalty: number
      esquiva: number
      moveMult: number
    }
  }
}

export default function CargaAtual({ peso, onPesoChange, valoresCombate }: CargaAtualProps) {
  return (
    <div className="border border-gray-700 rounded p-3">
      <h2 className="text-sm font-medium mb-2 border-b border-gray-800 pb-1">
        Carga Atual
      </h2>
      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">Peso Carregado (kg)</div>
          <input
            type="text"
            inputMode="decimal"
            value={peso}
            onChange={(e) => onPesoChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="flex justify-between text-xs">
          <span>Peso: {valoresCombate.pesoNumero} kg</span>
          <span className={valoresCombate.cargaRatio > 1 ? 'text-yellow-500' : 'text-gray-500'}>
            {valoresCombate.cargaRatio.toFixed(1)}× CB
          </span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${valoresCombate.cargaRatio > 10 ? 'bg-red-600' : valoresCombate.cargaRatio > 6 ? 'bg-orange-600' : valoresCombate.cargaRatio > 3 ? 'bg-yellow-600' : valoresCombate.cargaRatio > 2 ? 'bg-green-600' : 'bg-gray-600'}`}
            style={{ width: `${Math.min(valoresCombate.cargaRatio * 10, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">
          {valoresCombate.enc.label} {valoresCombate.enc.nivel > 0 && `(DX${valoresCombate.enc.dxPenalty}, Esq${valoresCombate.enc.esquiva}, Mov×${valoresCombate.enc.moveMult})`}
        </div>
      </div>
    </div>
  )
}
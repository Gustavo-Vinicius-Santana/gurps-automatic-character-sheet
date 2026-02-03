interface TabelaCargasProps {
  st: number
  cb: number
  cargaRatio: number
  pesoAtual: number
  nivelEncargo: number
}

export default function TabelaCargas({ st, cb, cargaRatio, pesoAtual, nivelEncargo }: TabelaCargasProps) {
  const faixas = [
    { nivel: 0, label: "Sem Carga", limite: 1, dxPenalty: 0, esquiva: 0, moveMult: 1.0 },
    { nivel: 1, label: "Leve", limite: 2, dxPenalty: -1, esquiva: -1, moveMult: 0.8 },
    { nivel: 2, label: "Média", limite: 3, dxPenalty: -2, esquiva: -2, moveMult: 0.6 },
    { nivel: 3, label: "Pesada", limite: 6, dxPenalty: -3, esquiva: -3, moveMult: 0.4 },
    { nivel: 4, label: "Muito Pesada", limite: 10, dxPenalty: -4, esquiva: -4, moveMult: 0.2 }
  ]

  const tabelaCargas = faixas.map(faixa => ({
    ...faixa,
    pesoMaximo: cb * faixa.limite
  }))

  return (
    <div className="border border-gray-700 rounded p-3">
      <h2 className="text-sm font-medium mb-2 border-b border-gray-800 pb-1">
        Faixas de Carga (ST: {st}, CB: {cb.toFixed(1)} kg)
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-1 px-1">Faixa</th>
              <th className="text-right py-1 px-1">Peso Máx (kg)</th>
              <th className="text-right py-1 px-1">DX</th>
              <th className="text-right py-1 px-1">Esquiva</th>
              <th className="text-right py-1 px-1">Movimento</th>
            </tr>
          </thead>
          <tbody>
            {tabelaCargas.map((faixa, index) => {
              const isAtual = faixa.nivel === nivelEncargo
              return (
                <tr 
                  key={faixa.nivel} 
                  className={`border-b border-gray-800 ${isAtual ? 'bg-yellow-900/20' : ''} ${index % 2 === 0 ? 'bg-gray-900/10' : ''}`}
                >
                  <td className="py-1 px-1">
                    <div className="flex items-center">
                      {faixa.label}
                      {isAtual && (
                        <span className="ml-1 text-xs text-yellow-500">●</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-1 px-1 font-mono">
                    {faixa.pesoMaximo.toFixed(1)}
                  </td>
                  <td className={`text-right py-1 px-1 ${faixa.dxPenalty < 0 ? 'text-red-400' : ''}`}>
                    {faixa.dxPenalty}
                  </td>
                  <td className={`text-right py-1 px-1 ${faixa.esquiva < 0 ? 'text-red-400' : ''}`}>
                    {faixa.esquiva}
                  </td>
                  <td className="text-right py-1 px-1 font-mono">
                    ×{faixa.moveMult.toFixed(1)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 p-2 border border-gray-800 rounded bg-gray-900/30">
        <div className="text-xs text-gray-500">Equivalências para ST {st}</div>
        <div className="grid grid-cols-5 gap-1 mt-1 text-center text-xs">
          <div>
            <div className="text-gray-400">1×</div>
            <div className="font-mono">{cb.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">2×</div>
            <div className="font-mono">{(cb * 2).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">3×</div>
            <div className="font-mono">{(cb * 3).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">6×</div>
            <div className="font-mono">{(cb * 6).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-gray-400">10×</div>
            <div className="font-mono">{(cb * 10).toFixed(1)}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <div>Carga atual: {pesoAtual} kg ({cargaRatio.toFixed(1)}× CB)</div>
      </div>
    </div>
  )
}
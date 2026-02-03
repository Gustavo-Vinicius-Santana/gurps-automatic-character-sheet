interface AtributoSecundarioProps {
  id: string
  nome: string
  valor: number
  base: number
  custo: number
  pontosDisponiveis: number
  onAjustar: (key: string, incremento: number) => void
  modificador?: number
}

export default function AtributoSecundario({ 
  id, nome, valor, base, custo, pontosDisponiveis, onAjustar, modificador = 0
}: AtributoSecundarioProps) {
  const diferenca = valor - base
  const pontos = diferenca * custo
  
  return (
    <div className="grid grid-cols-12 gap-2 py-2 border-b border-gray-800 items-center">
      <div className="col-span-5 text-sm">
        {nome}
        {id === "DB" && modificador !== 0 && (
          <div className="text-xs">
            <span className={modificador > 0 ? 'text-green-400' : 'text-red-400'}>
              Movimento: {modificador > 0 ? `+${modificador}` : modificador}%
            </span>
          </div>
        )}
      </div>
      <div className="col-span-3 flex items-center justify-center gap-1">
        <button
          onClick={() => onAjustar(id, -1)}
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-700 hover:bg-gray-800"
          disabled={valor <= (id === "VB" ? 0.25 : 1)}
        >
          -
        </button>
        <div className="w-12 text-center font-medium">
          {id === "VB" ? valor.toFixed(2) : valor}
        </div>
        <button
          onClick={() => onAjustar(id, 1)}
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-30"
          disabled={pontosDisponiveis < custo}
        >
          +
        </button>
      </div>
      <div className="col-span-4 text-right text-xs">
        <div className={pontos !== 0 ? (pontos > 0 ? 'text-green-400' : 'text-red-400') : ''}>
          {pontos > 0 ? `+${pontos}` : pontos} pts
        </div>
        <div className="text-gray-500">
          {id === "PV" && `ST: ${base}`}
          {id === "PF" && `HT: ${base}`}
          {id === "Vont" && `IQ: ${base}`}
          {id === "Per" && `IQ: ${base}`}
          {id === "VB" && `(DX+HT)/4: ${base.toFixed(2)}`}
          {id === "DB" && `⌊VB⌋: ${base}`}
          {diferenca !== 0 && (
            <span className={diferenca > 0 ? 'text-green-400' : 'text-red-400'}>
              {diferenca > 0 ? ` +${id === "VB" ? diferenca.toFixed(2) : diferenca}` : ` ${id === "VB" ? diferenca.toFixed(2) : diferenca}`}
            </span>
          )}
          {id === "DB" && modificador !== 0 && (
            <div className={modificador > 0 ? 'text-green-400' : 'text-red-400'}>
              {modificador > 0 ? `+${modificador}%` : `${modificador}%`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
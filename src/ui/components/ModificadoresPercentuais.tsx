"use client"

import { useState } from "react"

interface Modificador {
  id: string
  nome: string
  valor: number
  aplicavel: boolean
}

interface ModificadoresPercentuaisProps {
  modificadores: Modificador[]
  onModificadorChange: (id: string, valor: number) => void
  onToggleModificador: (id: string) => void
}

export default function ModificadoresPercentuais({ 
  modificadores, 
  onModificadorChange,
  onToggleModificador 
}: ModificadoresPercentuaisProps) {
  const [mostrarInfo, setMostrarInfo] = useState(false)

  const handleValorChange = (id: string, value: string) => {
    let numValue = parseInt(value) || 0
    
    // Limitar entre -80% e +300% (valores típicos do GURPS)
    if (numValue < -80) numValue = -80
    if (numValue > 300) numValue = 300
    
    onModificadorChange(id, numValue)
  }

  const getColorClass = (valor: number) => {
    if (valor > 0) return 'text-green-400'
    if (valor < 0) return 'text-red-400'
    return 'text-gray-500'
  }

  const getEfeitoDescricao = (valor: number) => {
    if (valor > 0) return `Encarece em ${valor}%`
    if (valor < 0) return `Desconto de ${Math.abs(valor)}%`
    return 'Sem modificação'
  }

  return (
    <div className="border border-gray-700 rounded p-3">
      <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-1">
        <h2 className="text-sm font-medium">Modificadores Percentuais</h2>
        <button
          onClick={() => setMostrarInfo(!mostrarInfo)}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          {mostrarInfo ? '▲' : '▼'} Info
        </button>
      </div>

      {mostrarInfo && (
        <div className="mb-3 p-2 border border-gray-800 rounded bg-gray-900/30 text-xs text-gray-500">
          <p className="mb-1">Modificadores alteram o custo em pontos dos atributos:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><span className="text-green-400">Valor positivo</span>: aumenta o custo (encarece)</li>
            <li><span className="text-red-400">Valor negativo</span>: diminui o custo (desconto)</li>
            <li>Limites típicos: -80% a +300%</li>
            <li>Use para representar vantagens/desvantagens raciais</li>
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {modificadores.map((mod) => (
          <div key={mod.id} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-800 items-center">
            <div className="col-span-5 flex items-center gap-2">
              <button
                onClick={() => onToggleModificador(mod.id)}
                className={`w-4 h-4 flex items-center justify-center rounded border ${mod.aplicavel ? 'bg-green-900/30 border-green-700' : 'bg-gray-800 border-gray-700'}`}
                title={mod.aplicavel ? "Desativar modificador" : "Ativar modificador"}
              >
                {mod.aplicavel && <span className="text-green-400 text-xs">✓</span>}
              </button>
              <div className="text-xs">{mod.nome}</div>
            </div>
            <div className="col-span-3">
              <input
                type="text"
                inputMode="numeric"
                value={mod.valor === 0 ? "" : mod.valor}
                onChange={(e) => handleValorChange(mod.id, e.target.value)}
                placeholder="0"
                disabled={!mod.aplicavel}
                className={`w-full bg-transparent border ${mod.aplicavel ? 'border-gray-700' : 'border-gray-800'} rounded px-2 py-1 text-center focus:outline-none focus:border-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!mod.aplicavel ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="col-span-4 text-right">
              <div className={`text-xs ${getColorClass(mod.valor)}`}>
                {mod.valor > 0 ? `+${mod.valor}` : mod.valor}%
              </div>
              <div className="text-xs text-gray-500">
                {mod.aplicavel ? getEfeitoDescricao(mod.valor) : 'Desativado'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-1 border border-gray-800 rounded bg-gray-900/30">
            <div className="text-gray-400">ST -80%</div>
            <div className="text-xs">Custo: 2 pts/nível</div>
          </div>
          <div className="p-1 border border-gray-800 rounded bg-gray-900/30">
            <div className="text-gray-400">ST +100%</div>
            <div className="text-xs">Custo: 20 pts/nível</div>
          </div>
        </div>
      </div>
    </div>
  )
}
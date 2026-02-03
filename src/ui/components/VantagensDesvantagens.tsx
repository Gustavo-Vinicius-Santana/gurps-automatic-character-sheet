import React, { useState } from 'react'

interface VantagemDesvantagemType {
  id: string
  nome: string
  tipo: 'vantagem' | 'desvantagem' | 'perk' | 'quirk'
  nivel?: number
  custo: number
  descricao?: string
  categoria?: string
}

interface VantagensDesvantagensProps {
  vantagensDesvantagens: VantagemDesvantagemType[]
  pontosDisponiveis: number
  onAdicionar: (novaVD: VantagemDesvantagemType) => void
  onRemover: (id: string) => void
  onChange: (id: string, campo: keyof VantagemDesvantagemType, valor: any) => void
}

export default function VantagensDesvantagens({
  vantagensDesvantagens,
  pontosDisponiveis,
  onAdicionar,
  onRemover,
  onChange
}: VantagensDesvantagensProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novaVD, setNovaVD] = useState({
    nome: '',
    tipo: 'vantagem' as 'vantagem' | 'desvantagem' | 'perk' | 'quirk',
    nivel: '',
    custo: '',
    descricao: ''
  })

  const tipos = [
    { id: 'vantagem', nome: 'Vantagem', cor: 'bg-green-900', texto: 'text-green-300' },
    { id: 'desvantagem', nome: 'Desvantagem', cor: 'bg-red-900', texto: 'text-red-300' },
    { id: 'perk', nome: 'Perk', cor: 'bg-blue-900', texto: 'text-blue-300' },
    { id: 'quirk', nome: 'Quirk', cor: 'bg-yellow-900', texto: 'text-yellow-300' }
  ]

  const getTipoConfig = (tipo: string) => {
    return tipos.find(t => t.id === tipo) || tipos[0]
  }

  const calcularTotal = () => {
    return vantagensDesvantagens.reduce((total, vd) => total + vd.custo, 0)
  }

  const handleSalvarNova = () => {
    if (!novaVD.nome.trim()) {
      alert("Por favor, digite um nome para a vantagem/desvantagem.")
      return
    }
    
    // Converter custo para número (valor vazio = 0)
    const custoNumero = novaVD.custo === '' ? 0 : parseInt(novaVD.custo) || 0
    
    // Ajustar custo baseado no tipo
    let custoAjustado = custoNumero
    if (novaVD.tipo === 'desvantagem') {
      custoAjustado = -Math.abs(custoNumero) // Sempre negativo para desvantagens
    }
    
    // Nível (opcional)
    const nivelNumero = novaVD.nivel === '' ? undefined : parseInt(novaVD.nivel) || 1
    if (nivelNumero !== undefined && nivelNumero < 1) {
      alert("Nível deve ser pelo menos 1.")
      return
    }
    
    const novaVantagemDesvantagem: VantagemDesvantagemType = {
      id: Date.now().toString(),
      nome: novaVD.nome,
      tipo: novaVD.tipo,
      nivel: nivelNumero,
      custo: custoAjustado,
      descricao: novaVD.descricao.trim() || undefined
    }
    
    // Verificar se tem pontos suficientes (apenas para custos positivos)
    if (custoAjustado > 0 && custoAjustado > pontosDisponiveis) {
      alert("Pontos insuficientes!")
      return
    }
    
    onAdicionar(novaVantagemDesvantagem)
    
    // Resetar formulário
    setNovaVD({
      nome: '',
      tipo: 'vantagem',
      nivel: '',
      custo: '',
      descricao: ''
    })
    setMostrarForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNovaVD(prev => ({ ...prev, [name]: value }))
  }

  const handleNivelChange = (id: string, valor: string) => {
    const numero = valor === '' ? undefined : parseInt(valor) || 1
    onChange(id, 'nivel', numero)
  }

  const handleCustoChange = (id: string, valor: string) => {
    const item = vantagensDesvantagens.find(vd => vd.id === id)
    if (!item) return
    
    const numero = valor === '' ? 0 : parseInt(valor) || 0
    let custoAjustado = numero
    
    // Ajustar sinal baseado no tipo atual
    if (item.tipo === 'desvantagem') {
      custoAjustado = -Math.abs(numero)
    }
    
    // Verificar pontos disponíveis apenas para custos positivos
    if (custoAjustado > 0 && custoAjustado > (item.custo + pontosDisponiveis)) {
      alert("Pontos insuficientes!")
      return
    }
    
    onChange(id, 'custo', custoAjustado)
  }

  return (
    <div className="border border-gray-700 rounded p-3">
      <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
        <h2 className="text-sm font-medium">Vantagens e Desvantagens</h2>
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-400">
            Total: <span className={calcularTotal() >= 0 ? "text-green-400" : "text-red-400"}>
              {calcularTotal() >= 0 ? `+${calcularTotal()}` : calcularTotal()} pontos
            </span>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* Lista de Vantagens/Desvantagens */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {vantagensDesvantagens.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-xs">
            Nenhuma vantagem ou desvantagem adicionada
          </div>
        ) : (
          vantagensDesvantagens.map((vd) => {
            const tipoConfig = getTipoConfig(vd.tipo)
            const estaEditando = editandoId === vd.id
            
            return (
              <div key={vd.id} className="p-2 border border-gray-800 rounded">
                {!estaEditando ? (
                  // Visualização normal
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className={`text-xs px-2 py-0.5 rounded ${tipoConfig.cor} ${tipoConfig.texto} flex-shrink-0`}>
                        {tipoConfig.nome}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium">
                          {vd.nome}
                          {vd.nivel && vd.nivel > 1 && (
                            <span className="text-gray-500 ml-1">(Nível {vd.nivel})</span>
                          )}
                        </div>
                        {vd.descricao && (
                          <div className="text-xs text-gray-500 mt-1">{vd.descricao}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`text-xs font-bold ${vd.custo >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {vd.custo >= 0 ? `+${vd.custo}` : vd.custo} pts
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditandoId(vd.id)}
                          className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => onRemover(vd.id)}
                          className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 hover:text-red-400"
                          title="Remover"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Modo edição
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${tipoConfig.cor} ${tipoConfig.texto}`}>
                          {tipoConfig.nome}
                        </span>
                        <input
                          type="text"
                          value={vd.nome}
                          onChange={(e) => onChange(vd.id, 'nome', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent"
                          placeholder="Nome"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={vd.tipo === 'desvantagem' ? Math.abs(vd.custo) : vd.custo}
                            onChange={(e) => handleCustoChange(vd.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-16 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Custo"
                          />
                          <span className="text-xs text-gray-500">pts</span>
                        </div>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <select
                          value={vd.tipo}
                          onChange={(e) => onChange(vd.id, 'tipo', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-700 rounded bg-gray-900 text-white"
                        >
                          {tipos.map(tipo => (
                            <option key={tipo.id} value={tipo.id} className="bg-gray-900">
                              {tipo.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={vd.nivel || ''}
                          onChange={(e) => handleNivelChange(vd.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-700 rounded bg-transparent text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="Nível (opcional)"
                        />
                        <span className="text-xs text-gray-500">nível</span>
                      </div>
                    </div>
                    
                    <textarea
                      value={vd.descricao || ''}
                      onChange={(e) => onChange(vd.id, 'descricao', e.target.value)}
                      className="text-xs w-full px-2 py-1 border border-gray-700 rounded bg-transparent"
                      placeholder="Descrição (opcional)"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Formulário para adicionar novo */}
      {mostrarForm && (
        <div className="mt-4 p-3 border border-gray-800 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-medium">Nova Vantagem/Desvantagem</h3>
            <button
              onClick={() => setMostrarForm(false)}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={novaVD.nome}
                  onChange={handleInputChange}
                  className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                  placeholder="Ex: Sortudo, Pacifismo..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                <select
                  name="tipo"
                  value={novaVD.tipo}
                  onChange={handleInputChange}
                  className="text-xs px-2 py-1 border border-gray-700 rounded bg-gray-900 text-white w-full"
                >
                  {tipos.map(tipo => (
                    <option key={tipo.id} value={tipo.id} className="bg-gray-900">
                      {tipo.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nível (opcional)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    name="nivel"
                    value={novaVD.nivel}
                    onChange={handleInputChange}
                    className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Deixe vazio para nenhum"
                  />
                  <span className="text-xs text-gray-500">nível</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Custo *</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    name="custo"
                    value={novaVD.custo}
                    onChange={handleInputChange}
                    className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-500">pts</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Descrição (opcional)</label>
              <textarea
                name="descricao"
                value={novaVD.descricao}
                onChange={handleInputChange}
                className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                placeholder="Descreva a vantagem/desvantagem..."
                rows={2}
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-500">
                {novaVD.tipo === 'desvantagem' ? 'Custo será negativo' : 'Custo será positivo'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarForm(false)}
                  className="text-xs px-3 py-1 border border-gray-700 rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarNova}
                  className="text-xs px-3 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo por tipo */}
      {vantagensDesvantagens.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {tipos.map(tipo => {
              const itemsTipo = vantagensDesvantagens.filter(vd => vd.tipo === tipo.id)
              const totalTipo = itemsTipo.reduce((sum, vd) => sum + vd.custo, 0)
              
              if (itemsTipo.length === 0) return null
              
              return (
                <div key={tipo.id} className="text-center">
                  <div className={`${tipo.texto} font-medium`}>{tipo.nome}</div>
                  <div className="text-gray-400">{itemsTipo.length} itens</div>
                  <div className={`${totalTipo >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
                    {totalTipo >= 0 ? `+${totalTipo}` : totalTipo} pts
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
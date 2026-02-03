import React, { useState } from 'react'

interface EquipamentoBaseType {
  id: string
  nome: string
  tipo: 'arma-corpo' | 'arma-distancia' | 'armadura' | 'outro'
  custo: number
  peso: number
}

interface ArmaCorpoType extends EquipamentoBaseType {
  tipo: 'arma-corpo'
  dano: string
  alcance: string
  aparar: string
  stMinima: number
}

interface ArmaDistanciaType extends EquipamentoBaseType {
  tipo: 'arma-distancia'
  dano: string
  precisao: number
  alcance: string
  cdt: string
  tiros: string
  stMinima: number
  magnet: string
}

interface ArmaduraType extends EquipamentoBaseType {
  tipo: 'armadura'
  local: string
  rd: number
}

interface OutroItemType extends EquipamentoBaseType {
  tipo: 'outro'
  descricao?: string
}

type EquipamentoType = ArmaCorpoType | ArmaDistanciaType | ArmaduraType | OutroItemType

interface EquipamentosProps {
  equipamentos: EquipamentoType[]
  onAdicionar: (tipo: 'arma-corpo' | 'arma-distancia' | 'armadura' | 'outro') => void
  onRemover: (id: string) => void
  onChange: (id: string, campo: string, valor: any) => void // Corrigido: string em vez de keyof EquipamentoType
}

export default function Equipamentos({
  equipamentos,
  onAdicionar,
  onRemover,
  onChange
}: EquipamentosProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState<'arma-corpo' | 'arma-distancia' | 'armadura' | 'outro'>('arma-corpo')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  
  const [novoEquipamento, setNovoEquipamento] = useState({
    nome: '',
    custo: '',
    peso: '',
    // Armas corpo-a-corpo
    dano: '',
    alcance: '',
    aparar: '',
    stMinima: '',
    // Armas à distância
    precisao: '',
    cdt: '',
    tiros: '',
    magnet: '',
    // Armaduras
    local: '',
    rd: '',
    // Outros
    descricao: ''
  })

  // Filtrar equipamentos por tipo
  const armasCorpo = equipamentos.filter((e): e is ArmaCorpoType => e.tipo === 'arma-corpo')
  const armasDistancia = equipamentos.filter((e): e is ArmaDistanciaType => e.tipo === 'arma-distancia')
  const armaduras = equipamentos.filter((e): e is ArmaduraType => e.tipo === 'armadura')
  const outros = equipamentos.filter((e): e is OutroItemType => e.tipo === 'outro')

  // Calcular totais
  const calcularTotalPeso = () => {
    return equipamentos.reduce((total, e) => total + e.peso, 0).toFixed(1)
  }

  const calcularTotalCusto = () => {
    return equipamentos.reduce((total, e) => total + e.custo, 0)
  }

  const handleSalvarNovo = () => {
    if (!novoEquipamento.nome.trim()) {
      alert("Por favor, digite um nome para o equipamento.")
      return
    }

    const custoNumero = novoEquipamento.custo === '' ? 0 : parseFloat(novoEquipamento.custo) || 0
    const pesoNumero = novoEquipamento.peso === '' ? 0 : parseFloat(novoEquipamento.peso) || 0

    let novoEquip: EquipamentoType

    switch (tipoSelecionado) {
      case 'arma-corpo':
        novoEquip = {
          id: Date.now().toString(),
          nome: novoEquipamento.nome,
          tipo: 'arma-corpo',
          dano: novoEquipamento.dano || '-',
          alcance: novoEquipamento.alcance || '-',
          aparar: novoEquipamento.aparar || '-',
          stMinima: parseInt(novoEquipamento.stMinima) || 0,
          custo: custoNumero,
          peso: pesoNumero
        }
        break

      case 'arma-distancia':
        novoEquip = {
          id: Date.now().toString(),
          nome: novoEquipamento.nome,
          tipo: 'arma-distancia',
          dano: novoEquipamento.dano || '-',
          precisao: parseInt(novoEquipamento.precisao) || 0,
          alcance: novoEquipamento.alcance || '-',
          cdt: novoEquipamento.cdt || '-',
          tiros: novoEquipamento.tiros || '-',
          stMinima: parseInt(novoEquipamento.stMinima) || 0,
          magnet: novoEquipamento.magnet || '-',
          custo: custoNumero,
          peso: pesoNumero
        }
        break

      case 'armadura':
        novoEquip = {
          id: Date.now().toString(),
          nome: novoEquipamento.nome,
          tipo: 'armadura',
          local: novoEquipamento.local || '-',
          rd: parseInt(novoEquipamento.rd) || 0,
          custo: custoNumero,
          peso: pesoNumero
        }
        break

      case 'outro':
        novoEquip = {
          id: Date.now().toString(),
          nome: novoEquipamento.nome,
          tipo: 'outro',
          custo: custoNumero,
          peso: pesoNumero,
          descricao: novoEquipamento.descricao || undefined
        }
        break
    }

    // Chamar o handler para adicionar
    onAdicionar(tipoSelecionado)
    
    // Resetar formulário
    setNovoEquipamento({
      nome: '',
      custo: '',
      peso: '',
      dano: '',
      alcance: '',
      aparar: '',
      stMinima: '',
      precisao: '',
      cdt: '',
      tiros: '',
      magnet: '',
      local: '',
      rd: '',
      descricao: ''
    })
    setMostrarForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNovoEquipamento(prev => ({ ...prev, [name]: value }))
  }

  const renderizarArmaCorpo = (arma: ArmaCorpoType, estaEditando: boolean) => {
    if (estaEditando) {
      return (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={arma.dano}
              onChange={(e) => onChange(arma.id, 'dano', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Dano"
            />
            <input
              type="text"
              value={arma.alcance}
              onChange={(e) => onChange(arma.id, 'alcance', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Alcance"
            />
            <input
              type="text"
              value={arma.aparar}
              onChange={(e) => onChange(arma.id, 'aparar', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Aparar"
            />
            <input
              type="text"
              value={arma.stMinima.toString()}
              onChange={(e) => onChange(arma.id, 'stMinima', parseInt(e.target.value) || 0)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="ST"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="text-xs text-gray-500 space-y-1">
        <div>Dano: {arma.dano}</div>
        <div>Alcance: {arma.alcance} • Aparar: {arma.aparar}</div>
        <div>ST: {arma.stMinima}</div>
      </div>
    )
  }

  const renderizarArmaDistancia = (arma: ArmaDistanciaType, estaEditando: boolean) => {
    if (estaEditando) {
      return (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={arma.dano}
              onChange={(e) => onChange(arma.id, 'dano', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Dano"
            />
            <input
              type="text"
              value={arma.alcance}
              onChange={(e) => onChange(arma.id, 'alcance', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Alcance"
            />
            <input
              type="text"
              value={arma.precisao.toString()}
              onChange={(e) => onChange(arma.id, 'precisao', parseInt(e.target.value) || 0)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Precisão"
            />
            <input
              type="text"
              value={arma.stMinima.toString()}
              onChange={(e) => onChange(arma.id, 'stMinima', parseInt(e.target.value) || 0)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="ST"
            />
            <input
              type="text"
              value={arma.cdt}
              onChange={(e) => onChange(arma.id, 'cdt', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="CDT"
            />
            <input
              type="text"
              value={arma.tiros}
              onChange={(e) => onChange(arma.id, 'tiros', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Tiros"
            />
            <input
              type="text"
              value={arma.magnet}
              onChange={(e) => onChange(arma.id, 'magnet', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Magnet"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="text-xs text-gray-500 space-y-1">
        <div>Dano: {arma.dano}</div>
        <div>Alcance: {arma.alcance} • Precisão: +{arma.precisao}</div>
        <div>CDT: {arma.cdt} • Tiros: {arma.tiros} • ST: {arma.stMinima}</div>
        <div>Magnet: {arma.magnet}</div>
      </div>
    )
  }

  const renderizarArmadura = (armadura: ArmaduraType, estaEditando: boolean) => {
    if (estaEditando) {
      return (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={armadura.local}
              onChange={(e) => onChange(armadura.id, 'local', e.target.value)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="Local"
            />
            <input
              type="text"
              value={armadura.rd.toString()}
              onChange={(e) => onChange(armadura.id, 'rd', parseInt(e.target.value) || 0)}
              className="px-2 py-1 border border-gray-700 rounded bg-transparent"
              placeholder="RD"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="text-xs text-gray-500 space-y-1">
        <div>Local: {armadura.local}</div>
        <div>RD: {armadura.rd}</div>
      </div>
    )
  }

  const renderizarOutro = (item: OutroItemType, estaEditando: boolean) => {
    if (estaEditando) {
      return (
        <div className="space-y-2 text-xs">
          <textarea
            value={item.descricao || ''}
            onChange={(e) => onChange(item.id, 'descricao', e.target.value)}
            className="w-full px-2 py-1 border border-gray-700 rounded bg-transparent"
            placeholder="Descrição (opcional)"
            rows={2}
          />
        </div>
      )
    }

    if (item.descricao) {
      return (
        <div className="text-xs text-gray-500">
          {item.descricao}
        </div>
      )
    }
    return null
  }

  const renderizarItem = (equipamento: EquipamentoType) => {
    const estaEditando = editandoId === equipamento.id

    return (
      <div key={equipamento.id} className="p-2 border border-gray-800 rounded">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">
              {estaEditando ? (
                <input
                  type="text"
                  value={equipamento.nome}
                  onChange={(e) => onChange(equipamento.id, 'nome', e.target.value)}
                  className="px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                  placeholder="Nome"
                />
              ) : (
                equipamento.nome
              )}
            </div>
            
            {/* Renderizar conteúdo específico do tipo */}
            {equipamento.tipo === 'arma-corpo' && renderizarArmaCorpo(equipamento as ArmaCorpoType, estaEditando)}
            {equipamento.tipo === 'arma-distancia' && renderizarArmaDistancia(equipamento as ArmaDistanciaType, estaEditando)}
            {equipamento.tipo === 'armadura' && renderizarArmadura(equipamento as ArmaduraType, estaEditando)}
            {equipamento.tipo === 'outro' && renderizarOutro(equipamento as OutroItemType, estaEditando)}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <div className="text-right">
              <div className="text-xs font-medium">{equipamento.peso.toFixed(1)} kg</div>
              <div className="text-xs text-gray-500">{equipamento.custo} moedas</div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditandoId(estaEditando ? null : equipamento.id)}
                className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
                title={estaEditando ? "Salvar" : "Editar"}
              >
                {estaEditando ? "✓" : "✎"}
              </button>
              <button
                onClick={() => onRemover(equipamento.id)}
                className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 hover:text-red-400"
                title="Remover"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        
        {/* Controles de edição comuns */}
        {estaEditando && (
          <div className="mt-2 pt-2 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={equipamento.peso}
                onChange={(e) => onChange(equipamento.id, 'peso', parseFloat(e.target.value) || 0)}
                className="px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                placeholder="Peso"
              />
              <span className="text-gray-500">kg</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={equipamento.custo}
                onChange={(e) => onChange(equipamento.id, 'custo', parseFloat(e.target.value) || 0)}
                className="px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                placeholder="Custo"
              />
              <span className="text-gray-500">moedas</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border border-gray-700 rounded p-3">
      <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
        <h2 className="text-sm font-medium">Equipamentos</h2>
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-400">
            Peso Total: <span className="font-medium">{calcularTotalPeso()} kg</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTipoSelecionado('arma-corpo')
                setMostrarForm(true)
              }}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 text-red-300"
            >
              + Arma
            </button>
            <button
              onClick={() => {
                setTipoSelecionado('armadura')
                setMostrarForm(true)
              }}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 text-blue-300"
            >
              + Armadura
            </button>
            <button
              onClick={() => {
                setTipoSelecionado('outro')
                setMostrarForm(true)
              }}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 text-green-300"
            >
              + Item
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Armas Corpo-a-Corpo */}
        <div className="border border-gray-800 rounded p-3">
          <h3 className="text-xs font-medium mb-2 text-red-400 border-b border-gray-800 pb-1">
            Armas Corpo-a-Corpo
          </h3>
          <div className="space-y-2">
            {armasCorpo.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                Nenhuma arma adicionada
              </div>
            ) : (
              armasCorpo.map(renderizarItem)
            )}
          </div>
        </div>

        {/* Armaduras */}
        <div className="border border-gray-800 rounded p-3">
          <h3 className="text-xs font-medium mb-2 text-blue-400 border-b border-gray-800 pb-1">
            Armaduras
          </h3>
          <div className="space-y-2">
            {armaduras.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                Nenhuma armadura adicionada
              </div>
            ) : (
              armaduras.map(renderizarItem)
            )}
          </div>
        </div>

        {/* Outros */}
        <div className="border border-gray-800 rounded p-3">
          <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-1">
            <h3 className="text-xs font-medium text-green-400">Outros</h3>
            <button
              onClick={() => {
                setTipoSelecionado('arma-distancia')
                setMostrarForm(true)
              }}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800 text-yellow-300"
            >
              + Arma à Distância
            </button>
          </div>
          
          {/* Armas à Distância */}
          {armasDistancia.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-yellow-400 mb-2">Armas à Distância</h4>
              <div className="space-y-2">
                {armasDistancia.map(renderizarItem)}
              </div>
            </div>
          )}

          {/* Outros Itens */}
          <div className="space-y-2">
            {outros.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                Nenhum item adicionado
              </div>
            ) : (
              outros.map(renderizarItem)
            )}
          </div>
        </div>
      </div>

      {/* Resumo de peso */}
      {equipamentos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-500">Peso Total</div>
              <div className="font-medium">{calcularTotalPeso()} kg</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Armas</div>
              <div className="font-medium">
                {(armasCorpo.reduce((sum, a) => sum + a.peso, 0) + 
                  armasDistancia.reduce((sum, a) => sum + a.peso, 0)).toFixed(1)} kg
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Armaduras</div>
              <div className="font-medium">
                {armaduras.reduce((sum, a) => sum + a.peso, 0).toFixed(1)} kg
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Custo Total</div>
              <div className="font-medium">{calcularTotalCusto()} moedas</div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário para adicionar novo */}
      {mostrarForm && (
        <div className="mt-4 p-3 border border-gray-800 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-medium">
              Novo {tipoSelecionado === 'arma-corpo' ? 'Arma Corpo-a-Corpo' :
                   tipoSelecionado === 'arma-distancia' ? 'Arma à Distância' :
                   tipoSelecionado === 'armadura' ? 'Armadura' : 'Item'}
            </h3>
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
                  value={novoEquipamento.nome}
                  onChange={handleInputChange}
                  className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                  placeholder="Nome do equipamento"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                <select
                  value={tipoSelecionado}
                  onChange={(e) => setTipoSelecionado(e.target.value as any)}
                  className="text-xs px-2 py-1 border border-gray-700 rounded bg-gray-900 text-white w-full"
                >
                  <option value="arma-corpo">Arma Corpo-a-Corpo</option>
                  <option value="arma-distancia">Arma à Distância</option>
                  <option value="armadura">Armadura</option>
                  <option value="outro">Outro Item</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Custo (moedas)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    name="custo"
                    value={novoEquipamento.custo}
                    onChange={handleInputChange}
                    className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-500">moedas</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    name="peso"
                    value={novoEquipamento.peso}
                    onChange={handleInputChange}
                    className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-500">kg</span>
                </div>
              </div>
            </div>

            {/* Campos específicos por tipo */}
            {tipoSelecionado === 'arma-corpo' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-red-400">Detalhes da Arma</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Dano</label>
                    <input
                      type="text"
                      name="dano"
                      value={novoEquipamento.dano}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 2d corte"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Alcance</label>
                    <input
                      type="text"
                      name="alcance"
                      value={novoEquipamento.alcance}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Aparar</label>
                    <input
                      type="text"
                      name="aparar"
                      value={novoEquipamento.aparar}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">ST Mínima</label>
                    <input
                      type="text"
                      name="stMinima"
                      value={novoEquipamento.stMinima}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 10"
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoSelecionado === 'arma-distancia' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-yellow-400">Detalhes da Arma à Distância</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Dano</label>
                    <input
                      type="text"
                      name="dano"
                      value={novoEquipamento.dano}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 1d+2 perf"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Alcance</label>
                    <input
                      type="text"
                      name="alcance"
                      value={novoEquipamento.alcance}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 100/150"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Precisão</label>
                    <input
                      type="text"
                      name="precisao"
                      value={novoEquipamento.precisao}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 4"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">ST Mínima</label>
                    <input
                      type="text"
                      name="stMinima"
                      value={novoEquipamento.stMinima}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 7"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">CDT</label>
                    <input
                      type="text"
                      name="cdt"
                      value={novoEquipamento.cdt}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tiros</label>
                    <input
                      type="text"
                      name="tiros"
                      value={novoEquipamento.tiros}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 1(3)"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Magnet</label>
                    <input
                      type="text"
                      name="magnet"
                      value={novoEquipamento.magnet}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoSelecionado === 'armadura' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-blue-400">Detalhes da Armadura</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Local</label>
                    <input
                      type="text"
                      name="local"
                      value={novoEquipamento.local}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: Torso"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">RD</label>
                    <input
                      type="text"
                      name="rd"
                      value={novoEquipamento.rd}
                      onChange={handleInputChange}
                      className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoSelecionado === 'outro' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Descrição (opcional)</label>
                <textarea
                  name="descricao"
                  value={novoEquipamento.descricao}
                  onChange={handleInputChange}
                  className="text-xs px-2 py-1 border border-gray-700 rounded bg-transparent w-full"
                  placeholder="Descreva o item..."
                  rows={2}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMostrarForm(false)}
                className="text-xs px-3 py-1 border border-gray-700 rounded hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarNovo}
                className="text-xs px-3 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
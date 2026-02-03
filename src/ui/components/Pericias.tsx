"use client"

import { useState, useEffect } from "react" // Adicione useEffect

interface AtributoBasicoType {
  nome: string
  valor: number
  custo: number
}

interface PericiaType {
  id: string
  nome: string
  atributo: 'ST' | 'DX' | 'IQ' | 'HT'
  dificuldade: 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  pontos: number
  predefinido: string
  nhFinal: number
}

interface PericiasProps {
  pericias: PericiaType[]
  atributos: Record<string, AtributoBasicoType>
  pontosDisponiveis: number
  onAdicionarPericia: (periciaInicial?: Partial<PericiaType>) => void // Modifique esta linha
  onRemoverPericia: (id: string) => void
  onPericiaChange: (id: string, campo: keyof PericiaType, valor: any) => void
  onAjustarPontosPericia: (id: string, incremento: number) => void
}

// Tabela de custos de perícias
const TABELA_CUSTOS_PERICIAS = [
  { nhDiferenca: -3, facil: 0, medio: 0, dificil: 0, muitoDificil: 1 },
  { nhDiferenca: -2, facil: 0, medio: 0, dificil: 1, muitoDificil: 2 },
  { nhDiferenca: -1, facil: 0, medio: 1, dificil: 2, muitoDificil: 4 },
  { nhDiferenca: 0, facil: 1, medio: 2, dificil: 4, muitoDificil: 8 },
  { nhDiferenca: 1, facil: 2, medio: 4, dificil: 8, muitoDificil: 12 },
  { nhDiferenca: 2, facil: 4, medio: 8, dificil: 12, muitoDificil: 16 },
  { nhDiferenca: 3, facil: 8, medio: 12, dificil: 16, muitoDificil: 20 },
  { nhDiferenca: 4, facil: 12, medio: 16, dificil: 20, muitoDificil: 24 },
  { nhDiferenca: 5, facil: 16, medio: 20, dificil: 24, muitoDificil: 28 },
]

const CUSTO_ADICIONAL = 4

// Função para calcular NH com base nos pontos e dificuldade
const calcularNHComPontos = (pontos: number, dificuldade: string, atributoValor: number): number => {
  if (pontos === 0) return atributoValor
  
  // Tabela completa com níveis negativos
  const tabelaPontosParaNivel: Record<string, {pontos: number, nivel: number}[]> = {
    'facil': [
      { pontos: 1, nivel: 0 },   // atributo + 0
      { pontos: 2, nivel: 1 },   // atributo + 1
      { pontos: 4, nivel: 2 },   // atributo + 2
      { pontos: 8, nivel: 3 },   // atributo + 3
      { pontos: 12, nivel: 4 },  // atributo + 4
      { pontos: 16, nivel: 5 },  // atributo + 5
    ],
    'medio': [
      { pontos: 1, nivel: -1 },  // atributo - 1
      { pontos: 2, nivel: 0 },   // atributo + 0
      { pontos: 4, nivel: 1 },   // atributo + 1
      { pontos: 8, nivel: 2 },   // atributo + 2
      { pontos: 12, nivel: 3 },  // atributo + 3
      { pontos: 16, nivel: 4 },  // atributo + 4
      { pontos: 20, nivel: 5 },  // atributo + 5
    ],
    'dificil': [
      { pontos: 1, nivel: -2 },  // atributo - 2
      { pontos: 2, nivel: -1 },  // atributo - 1
      { pontos: 4, nivel: 0 },   // atributo + 0
      { pontos: 8, nivel: 1 },   // atributo + 1
      { pontos: 12, nivel: 2 },  // atributo + 2
      { pontos: 16, nivel: 3 },  // atributo + 3
      { pontos: 20, nivel: 4 },  // atributo + 4
      { pontos: 24, nivel: 5 },  // atributo + 5
    ],
    'muito-dificil': [
      { pontos: 1, nivel: -3 },  // atributo - 3
      { pontos: 2, nivel: -2 },  // atributo - 2
      { pontos: 4, nivel: -1 },  // atributo - 1
      { pontos: 8, nivel: 0 },   // atributo + 0
      { pontos: 12, nivel: 1 },  // atributo + 1
      { pontos: 16, nivel: 2 },  // atributo + 2
      { pontos: 20, nivel: 3 },  // atributo + 3
      { pontos: 24, nivel: 4 },  // atributo + 4
      { pontos: 28, nivel: 5 },  // atributo + 5
    ]
  }
  
  const mapa = tabelaPontosParaNivel[dificuldade] || tabelaPontosParaNivel.facil
  const mapaOrdenado = [...mapa].sort((a, b) => b.pontos - a.pontos)
  
  for (const item of mapaOrdenado) {
    if (pontos >= item.pontos) {
      let nivel = item.nivel
      
      if (pontos > item.pontos && item.nivel >= 0) {
        const pontosExtras = pontos - item.pontos
        const niveisExtras = Math.floor(pontosExtras / 4)
        nivel += niveisExtras
      }
      
      return atributoValor + nivel
    }
  }
  
  return atributoValor
}

// Função para obter descrição do nível
const calcularDescricaoNivel = (pontos: number, dificuldade: string): string => {
  if (pontos === 0) return "Sem pontos"
  
  const tabelaDescricao: Record<string, {pontos: number, desc: string}[]> = {
    'facil': [
      { pontos: 1, desc: "Atributo +0" },
      { pontos: 2, desc: "Atributo +1" },
      { pontos: 4, desc: "Atributo +2" },
      { pontos: 8, desc: "Atributo +3" },
      { pontos: 12, desc: "Atributo +4" },
      { pontos: 16, desc: "Atributo +5" },
    ],
    'medio': [
      { pontos: 1, desc: "Atributo -1" },
      { pontos: 2, desc: "Atributo +0" },
      { pontos: 4, desc: "Atributo +1" },
      { pontos: 8, desc: "Atributo +2" },
      { pontos: 12, desc: "Atributo +3" },
      { pontos: 16, desc: "Atributo +4" },
      { pontos: 20, desc: "Atributo +5" },
    ],
    'dificil': [
      { pontos: 1, desc: "Atributo -2" },
      { pontos: 2, desc: "Atributo -1" },
      { pontos: 4, desc: "Atributo +0" },
      { pontos: 8, desc: "Atributo +1" },
      { pontos: 12, desc: "Atributo +2" },
      { pontos: 16, desc: "Atributo +3" },
      { pontos: 20, desc: "Atributo +4" },
      { pontos: 24, desc: "Atributo +5" },
    ],
    'muito-dificil': [
      { pontos: 1, desc: "Atributo -3" },
      { pontos: 2, desc: "Atributo -2" },
      { pontos: 4, desc: "Atributo -1" },
      { pontos: 8, desc: "Atributo +0" },
      { pontos: 12, desc: "Atributo +1" },
      { pontos: 16, desc: "Atributo +2" },
      { pontos: 20, desc: "Atributo +3" },
      { pontos: 24, desc: "Atributo +4" },
      { pontos: 28, desc: "Atributo +5" },
    ]
  }
  
  const mapa = tabelaDescricao[dificuldade] || tabelaDescricao.facil
  const mapaOrdenado = [...mapa].sort((a, b) => b.pontos - a.pontos)
  
  for (const item of mapaOrdenado) {
    if (pontos >= item.pontos) {
      let desc = item.desc
      
      if (pontos > item.pontos && item.desc.includes("+5")) {
        const pontosExtras = pontos - item.pontos
        const niveisExtras = Math.floor(pontosExtras / 4)
        if (niveisExtras > 0) {
          desc = `Atributo +${5 + niveisExtras}`
        }
      }
      
      return desc
    }
  }
  
  return "Sem pontos"
}

export default function Pericias({
  pericias = [],
  atributos,
  pontosDisponiveis = 0,
  onAdicionarPericia,
  onRemoverPericia,
  onPericiaChange,
  onAjustarPontosPericia
}: PericiasProps) {
  const [mostrarTabela, setMostrarTabela] = useState(false)

  // Obter cor baseada na dificuldade
  const getDificuldadeCor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'text-green-400'
      case 'medio': return 'text-yellow-400'
      case 'dificil': return 'text-orange-400'
      case 'muito-dificil': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Obter label da dificuldade
  const getDificuldadeLabel = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'Fácil'
      case 'medio': return 'Média'
      case 'dificil': return 'Difícil'
      case 'muito-dificil': return 'Muito Difícil'
      default: return 'Média'
    }
  }

  // Exemplos de perícias pré-definidas
  const exemplosPericias = [
    { nome: "Espada curta", atributo: "DX", dificuldade: "medio", predefinido: "DX - 4" },
    { nome: "Espada larga", atributo: "DX", dificuldade: "medio", predefinido: "DX - 4" },
    { nome: "Arco", atributo: "DX", dificuldade: "medio", predefinido: "DX - 4" },
    { nome: "Escudo", atributo: "DX", dificuldade: "facil", predefinido: "DX - 4" },
    { nome: "Diplomacia", atributo: "IQ", dificuldade: "dificil", predefinido: "" },
    { nome: "Besta", atributo: "DX", dificuldade: "facil", predefinido: "DX - 4" },
  ]

  const adicionarExemplo = (exemplo: typeof exemplosPericias[0]) => {
    // Cria um objeto de perícia inicial com os dados do exemplo
    const periciaInicial: Partial<PericiaType> = {
      nome: exemplo.nome,
      atributo: exemplo.atributo as 'ST' | 'DX' | 'IQ' | 'HT',
      dificuldade: exemplo.dificuldade as 'facil' | 'medio' | 'dificil' | 'muito-dificil',
      predefinido: exemplo.predefinido,
      pontos: 0,
      nhFinal: -9999
    }
    
    // Chama a função do pai passando os dados iniciais
    onAdicionarPericia(periciaInicial)
  }

  // Se não houver perícias, mostrar mensagem
  if (!pericias || pericias.length === 0) {
    return (
      <div className="border border-gray-700 rounded p-3">
        <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
          <h2 className="text-sm font-medium">Perícias</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarTabela(!mostrarTabela)}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              {mostrarTabela ? '▲' : '▼'} Tabela
            </button>
            <button
              onClick={() => onAdicionarPericia()}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              + Perícia
            </button>
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          Nenhuma perícia adicionada. Clique em "+ Perícia" para começar.
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-700 rounded p-3">
      <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
        <h2 className="text-sm font-medium">Perícias</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarTabela(!mostrarTabela)}
            className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
          >
            {mostrarTabela ? '▲' : '▼'} Tabela
          </button>
          <button
            onClick={() => onAdicionarPericia()}
            className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
          >
            + Perícia
          </button>
        </div>
      </div>

      {/* Tabela de custos */}
      {mostrarTabela && (
        <div className="mb-4 p-3 border border-gray-800 rounded bg-gray-900/30">
          <h3 className="text-xs font-medium mb-2 text-center">Tabela de Custos de Perícias</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-1 px-1">NH vs Atributo</th>
                  <th className="text-center py-1 px-1 text-green-400">Fácil</th>
                  <th className="text-center py-1 px-1 text-yellow-400">Média</th>
                  <th className="text-center py-1 px-1 text-orange-400">Difícil</th>
                  <th className="text-center py-1 px-1 text-red-400">Muito Difícil</th>
                </tr>
              </thead>
              <tbody>
                {TABELA_CUSTOS_PERICIAS.map((linha, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-1 px-1 text-center">
                      {linha.nhDiferenca === 0 ? 'Igual' : linha.nhDiferenca > 0 ? `+${linha.nhDiferenca}` : linha.nhDiferenca}
                    </td>
                    <td className="py-1 px-1 text-center">{linha.facil}</td>
                    <td className="py-1 px-1 text-center">{linha.medio}</td>
                    <td className="py-1 px-1 text-center">{linha.dificil}</td>
                    <td className="py-1 px-1 text-center">{linha.muitoDificil}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1 px-1 text-center text-gray-500">+1 adicional</td>
                  <td className="py-1 px-1 text-center text-gray-500">+4</td>
                  <td className="py-1 px-1 text-center text-gray-500">+4</td>
                  <td className="py-1 px-1 text-center text-gray-500">+4</td>
                  <td className="py-1 px-1 text-center text-gray-500">+4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exemplos rápidos */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Exemplos rápidos:</div>
        <div className="flex flex-wrap gap-1">
          {exemplosPericias.map((exemplo, index) => (
            <button
              key={index}
              onClick={() => adicionarExemplo(exemplo)}
              className="text-xs px-2 py-1 border border-gray-700 rounded hover:bg-gray-800"
            >
              {exemplo.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de perícias */}
      <div className="space-y-3">
        {pericias.map((pericia) => {
          if (!pericia) return null
          
          const atributoValor = atributos[pericia.atributo]?.valor || 0
          const pontosGastos = pericia.pontos || 0
          const temPredefinido = pericia.predefinido && pericia.predefinido.trim() !== ""
          const isNHAutomatico = pericia.nhFinal !== -9999 && pericia.nhFinal >= 0
          
          // Calcular NH relativo (apenas se não for pré-definido)
          const nhRelativo = isNHAutomatico ? pericia.nhFinal - atributoValor : null
          
          // Obter descrição do NH
          let nhDescricao = "—"
          let nhTipo = ""
          
          if (pontosGastos > 0 && isNHAutomatico) {
            // Tem pontos: mostra NH calculado
            nhDescricao = pericia.nhFinal.toString()
            nhTipo = calcularDescricaoNivel(pontosGastos, pericia.dificuldade)
          } else if (temPredefinido) {
            // Não tem pontos, mas tem pré-definido
            nhDescricao = pericia.predefinido
            nhTipo = "Pré-definido"
          } else if (pontosGastos === 0) {
            // Não tem pontos nem pré-definido
            nhDescricao = "N/A"
            nhTipo = "Sem valor"
          }
          
          return (
            <div key={pericia.id} className="border border-gray-800 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <input
                  type="text"
                  value={pericia.nome || ""}
                  onChange={(e) => onPericiaChange(pericia.id, 'nome', e.target.value)}
                  className="text-sm font-medium bg-transparent border-b border-gray-700 focus:outline-none focus:border-gray-500 w-48"
                  placeholder="Nome da perícia"
                />
                <button
                  onClick={() => onRemoverPericia(pericia.id)}
                  className="text-xs text-gray-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Atributo */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Atributo</div>
                  <select
                    value={pericia.atributo || "DX"}
                    onChange={(e) => onPericiaChange(pericia.id, 'atributo', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-500"
                  >
                    <option value="ST">ST - Força ({atributos.ST?.valor || 10})</option>
                    <option value="DX">DX - Destreza ({atributos.DX?.valor || 10})</option>
                    <option value="IQ">IQ - Inteligência ({atributos.IQ?.valor || 10})</option>
                    <option value="HT">HT - Vitalidade ({atributos.HT?.valor || 10})</option>
                  </select>
                </div>
                
                {/* Dificuldade */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Dificuldade</div>
                  <select
                    value={pericia.dificuldade || "medio"}
                    onChange={(e) => onPericiaChange(pericia.id, 'dificuldade', e.target.value)}
                    className={`w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-500 ${getDificuldadeCor(pericia.dificuldade || "medio")}`}
                  >
                    <option value="facil" className="text-green-400">Fácil</option>
                    <option value="medio" className="text-yellow-400">Média</option>
                    <option value="dificil" className="text-orange-400">Difícil</option>
                    <option value="muito-dificil" className="text-red-400">Muito Difícil</option>
                  </select>
                </div>
                
                {/* Pré-definido (string) */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Pré-definido</div>
                  <input
                    type="text"
                    value={pericia.predefinido || ""}
                    onChange={(e) => onPericiaChange(pericia.id, 'predefinido', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-500"
                    placeholder="ex: medicina-5, cirurgia-2"
                  />
                </div>
                
                {/* Pontos investidos */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Pontos Investidos</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAjustarPontosPericia(pericia.id, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-30"
                      disabled={pontosGastos <= 0}
                    >
                      -
                    </button>
                    <div className="w-12 text-center font-medium">
                      {pontosGastos}
                    </div>
                    <button
                      onClick={() => onAjustarPontosPericia(pericia.id, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-700 hover:bg-gray-800 disabled:opacity-30"
                      disabled={pontosDisponiveis < 1}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Informações finais */}
              <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                <div className="text-center p-2 border border-gray-800 rounded bg-gray-900/30">
                  <div className="text-gray-500">NH Final</div>
                  <div className={`text-lg font-bold ${temPredefinido && pontosGastos === 0 ? 'text-blue-400' : ''}`}>
                    {nhDescricao}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {pontosGastos > 0 && isNHAutomatico ? 
                      `= ${atributoValor} ${nhRelativo !== null ? (nhRelativo > 0 ? `+ ${nhRelativo}` : nhRelativo < 0 ? `- ${Math.abs(nhRelativo)}` : '') : ''}` :
                      pontosGastos === 0 && !temPredefinido ? "Sem valor definido" :
                      "Valor pré-definido"}
                  </div>
                </div>
                
                <div className="text-center p-2 border border-gray-800 rounded bg-gray-900/30">
                  <div className="text-gray-500">Tipo</div>
                  <div className={`text-lg font-bold ${temPredefinido && pontosGastos === 0 ? 'text-blue-400' : pontosGastos > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {nhTipo}
                  </div>
                  <div className={`text-xs ${getDificuldadeCor(pericia.dificuldade || "medio")}`}>
                    {getDificuldadeLabel(pericia.dificuldade || "medio")}
                  </div>
                </div>
                
                <div className="text-center p-2 border border-gray-800 rounded bg-gray-900/30">
                  <div className="text-gray-500">Custo</div>
                  <div className="text-lg font-bold">{pontosGastos}</div>
                  <div className="text-gray-500 text-xs">
                    {pontosGastos === 0 ? "Sem investimento" : "Pontos gastos"}
                  </div>
                </div>
              </div>
              
              {/* Status da perícia (apenas para perícias com NH calculado) */}
              {pontosGastos > 0 && isNHAutomatico && pericia.nhFinal > 0 && (
                <div className="mt-2 text-center text-xs">
                  <div className={`inline-block px-2 py-1 rounded ${pericia.nhFinal >= 20 ? 'bg-green-900/30 text-green-400' : pericia.nhFinal >= 16 ? 'bg-yellow-900/30 text-yellow-400' : pericia.nhFinal >= 12 ? 'bg-orange-900/30 text-orange-400' : 'bg-red-900/30 text-red-400'}`}>
                    {pericia.nhFinal >= 20 ? 'Excelente' : 
                     pericia.nhFinal >= 16 ? 'Bom' : 
                     pericia.nhFinal >= 12 ? 'Regular' : 'Ruim'} • 
                    {pericia.nhFinal >= 16 ? ' Automático' : ' Rolagem necessária'}
                  </div>
                </div>
              )}
              
              {/* Aviso sobre pré-definido */}
              {pontosGastos === 0 && temPredefinido && (
                <div className="mt-2 text-xs text-blue-400 text-center">
                  Usando valor pré-definido. Adicione pontos para usar o cálculo automático.
                </div>
              )}
              
              {/* Aviso sobre N/A */}
              {pontosGastos === 0 && !temPredefinido && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Nenhum valor definido. Adicione pontos ou digite um valor pré-definido.
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Resumo */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="text-gray-500">Total Perícias</div>
            <div className="font-medium">{pericias.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Pontos Gastos</div>
            <div className="font-medium">
              {pericias.reduce((total, p) => total + (p?.pontos || 0), 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Pré-definidas</div>
            <div className="font-medium">
              {pericias.filter(p => p.pontos === 0 && p.predefinido && p.predefinido.trim() !== "").length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Com pontos</div>
            <div className="font-medium">
              {pericias.filter(p => (p?.pontos || 0) > 0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
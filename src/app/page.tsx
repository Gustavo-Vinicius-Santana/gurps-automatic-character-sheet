"use client"

import { useState, useEffect } from "react"
import AtributoBasico from "@/src/ui/components/AtributoBasico"
import AtributoSecundario from "@/src/ui/components/AtributoSecundario"
import ResultadoDisplay from "@/src/ui/components/ResultadoDisplay"
import ControlePontos from "@/src/ui/components/ControlePontos"
import CargaAtual from "@/src/ui/components/CargaAtual"
import TabelaCargas from "@/src/ui/components/TabelaCargas"
import PenalidadesEncargo from "@/src/ui/components/PenalidadesEncargo"
import DanoDisplay from "@/src/ui/components/DanoDisplay"
import ModificadoresPercentuais from "@/src/ui/components/ModificadoresPercentuais"
import Pericias from "@/src/ui/components/Pericias"
import VantagensDesvantagens from "../ui/components/VantagensDesvantagens"
import Equipamentos from "../ui/components/Equipamentos"

// Tipos
interface AtributoBasicoType {
  nome: string
  valor: number
  custo: number
}

interface AtributoSecundarioType {
  nome: string
  valor: number
  custo: number
  base: number
}

interface EncargoType {
  nivel: number
  label: string
  dxPenalty: number
  esquiva: number
  moveMult: number
}

interface ValoresCombateType {
  CB: number
  esquivaBase: number
  esquivaFinal: number
  DBfinal: number
  DXcomPenalidade: number
  cargaRatio: number
  enc: EncargoType
  VB: number
  DB: number
  pesoNumero: number
}

interface ModificadorType {
  id: string
  nome: string
  valor: number // percentual (-80% a +300%)
  aplicavel: boolean
}

interface PericiaType {
  id: string
  nome: string
  atributo: 'ST' | 'DX' | 'IQ' | 'HT'
  dificuldade: 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  pontos: number // Pontos investidos na perícia
  predefinido: string // String para valores como "medicina-5", "cirurgia-2", etc.
  nhFinal: number // NH final calculado
}

interface VantagemDesvantagemType {
  id: string
  nome: string
  tipo: 'vantagem' | 'desvantagem' | 'perk' | 'quirk'
  nivel?: number // Nível da vantagem (opcional)
  custo: number // Custo positivo ou negativo
  descricao?: string // Descrição opcional
  categoria?: string // Categoria para organização
}

interface EquipamentoBaseType {
  id: string
  nome: string
  tipo: 'arma-corpo' | 'arma-distancia' | 'armadura' | 'outro'
  custo: number // Em moedas, não em pontos
  peso: number // Em kg
}

interface ArmaCorpoType extends EquipamentoBaseType {
  tipo: 'arma-corpo'
  dano: string // Ex: "2d corte"
  alcance: string // Ex: "1"
  aparar: string // Ex: "0"
  stMinima: number // Força mínima
}

interface ArmaDistanciaType extends EquipamentoBaseType {
  tipo: 'arma-distancia'
  dano: string // Ex: "1d+2 perf"
  precisao: number // Ex: 4
  alcance: string // Ex: "100/150"
  cdt: string // Ex: "1"
  tiros: string // Ex: "1(3)"
  stMinima: number // Força mínima
  magnet: string // Ex: "2"
}

interface ArmaduraType extends EquipamentoBaseType {
  tipo: 'armadura'
  local: string // Ex: "Torso"
  rd: number // Resistência a dano
}

interface OutroItemType extends EquipamentoBaseType {
  tipo: 'outro'
  descricao?: string
}

type EquipamentoType = ArmaCorpoType | ArmaDistanciaType | ArmaduraType | OutroItemType

// Tabela de dano
const DAMAGE_TABLE: Record<number, { thrust: string; swing: string }> = {
  7: { thrust: "1d-3", swing: "1d-2" },
  8: { thrust: "1d-3", swing: "1d-1" },
  9: { thrust: "1d-2", swing: "1d" },
  10: { thrust: "1d-2", swing: "1d" },
  11: { thrust: "1d-1", swing: "1d+1" },
  12: { thrust: "1d-1", swing: "1d+2" },
  13: { thrust: "1d", swing: "2d-1" },
  14: { thrust: "1d", swing: "2d" },
  15: { thrust: "1d+1", swing: "2d+1" },
  16: { thrust: "1d+1", swing: "2d+2" },
  17: { thrust: "1d+2", swing: "3d-1" },
  18: { thrust: "1d+2", swing: "3d" },
  19: { thrust: "2d-1", swing: "3d+1" },
  20: { thrust: "2d-1", swing: "3d+2" },
}

// Tabela de custos de perícias (NH vs Atributo -> custo em pontos)
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

// Custo por NH adicional após +5
const CUSTO_ADICIONAL = 4

// Função para calcular o NH baseado nos pontos investidos
  const calcularNHComPontos = (pontos: number, dificuldade: string, atributoValor: number): number => {
    if (pontos === 0) return atributoValor
    
    // Tabela completa: pontos -> nível relativo para cada dificuldade
    // Incluindo níveis negativos
    const tabelaPontosParaNivel: Record<string, {pontos: number, nivel: number}[]> = {
      'facil': [
        { pontos: 0, nivel: 0 },
        { pontos: 1, nivel: 0 },   // atributo + 0
        { pontos: 2, nivel: 1 },   // atributo + 1
        { pontos: 4, nivel: 2 },   // atributo + 2
        { pontos: 8, nivel: 3 },   // atributo + 3
        { pontos: 12, nivel: 4 },  // atributo + 4
        { pontos: 16, nivel: 5 },  // atributo + 5
        // Níveis negativos não disponíveis para Fácil
      ],
      'medio': [
        { pontos: 0, nivel: 0 },
        { pontos: 1, nivel: -1 },  // atributo - 1 (custa 1 ponto)
        { pontos: 2, nivel: 0 },   // atributo + 0
        { pontos: 4, nivel: 1 },   // atributo + 1
        { pontos: 8, nivel: 2 },   // atributo + 2
        { pontos: 12, nivel: 3 },  // atributo + 3
        { pontos: 16, nivel: 4 },  // atributo + 4
        { pontos: 20, nivel: 5 },  // atributo + 5
      ],
      'dificil': [
        { pontos: 0, nivel: 0 },
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
        { pontos: 0, nivel: 0 },
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
    
    // Ordenar por pontos (maior primeiro)
    const mapaOrdenado = [...mapa].sort((a, b) => b.pontos - a.pontos)
    
    // Encontrar o nível baseado nos pontos
    for (const item of mapaOrdenado) {
      if (pontos >= item.pontos) {
        let nivel = item.nivel
        
        // Para pontos acima do máximo da tabela, calcular níveis extras
        if (pontos > item.pontos && item.nivel >= 0) {
          const pontosExtras = pontos - item.pontos
          const niveisExtras = Math.floor(pontosExtras / 4) // Cada +4 pontos = +1 nível
          nivel += niveisExtras
        }
        
        return atributoValor + nivel
      }
    }
    
    // Se não encontrou, retorna o mínimo possível
    return atributoValor - 3 // Mínimo permitido
  }

// Função para calcular custo baseado no NH desejado (para validação)
const calcularPontosParaNH = (nhDesejado: number, atributoValor: number, dificuldade: string): number => {
  const nhDiferenca = nhDesejado - atributoValor
  
  // Para diferenças menores que -3, não é permitido
  if (nhDiferenca < -3) {
    return 1000 // Valor alto para indicar impossibilidade
  }
  
  // Para diferenças maiores que +5, usar a fórmula adicional
  if (nhDiferenca > 5) {
    const baseNivel = 5
    const custoBase = TABELA_CUSTOS_PERICIAS.find(t => t.nhDiferenca === baseNivel)
    if (!custoBase) return 0
    
    const custoDificuldade = custoBase[dificuldade as keyof typeof custoBase] as number
    const niveisExtras = nhDiferenca - 5
    
    return custoDificuldade + (niveisExtras * CUSTO_ADICIONAL)
  }
  
  // Encontrar na tabela
  const custoTabela = TABELA_CUSTOS_PERICIAS.find(t => t.nhDiferenca === nhDiferenca)
  if (!custoTabela) return 0
  
  return custoTabela[dificuldade as keyof typeof custoTabela] as number
}

const obterProximoNivelValido = (pontosAtuais: number, dificuldade: string, incremento: number): number => {
  // Tabela de custos por dificuldade
  const tabelaCustos: Record<string, number[]> = {
    'facil': [1, 2, 4, 8, 12, 16], // +0, +1, +2, +3, +4, +5
    'medio': [1, 2, 4, 8, 12, 16, 20], // -1, +0, +1, +2, +3, +4, +5
    'dificil': [1, 2, 4, 8, 12, 16, 20, 24], // -2, -1, +0, +1, +2, +3, +4, +5
    'muito-dificil': [1, 2, 4, 8, 12, 16, 20, 24, 28] // -3, -2, -1, +0, +1, +2, +3, +4, +5
  }
  
  const custos = tabelaCustos[dificuldade] || tabelaCustos.facil
  
  // Encontrar o custo atual mais próximo
  let custoAtual = 0
  for (const custo of custos) {
    if (pontosAtuais >= custo) {
      custoAtual = custo
    }
  }
  
  // Encontrar índice do custo atual
  const indiceAtual = custos.indexOf(custoAtual)
  
  if (incremento > 0) {
    // Subir de nível
    if (indiceAtual < custos.length - 1) {
      // Ainda tem níveis na tabela
      return custos[indiceAtual + 1]
    } else {
      // Já está no máximo da tabela, adiciona +4 pontos
      const ultimoCusto = custos[custos.length - 1]
      const pontosExtras = pontosAtuais - ultimoCusto
      const niveisCompletos = Math.floor(pontosExtras / 4)
      return ultimoCusto + ((niveisCompletos + 1) * 4)
    }
  } else {
    // Descer de nível
    if (indiceAtual > 0) {
      // Voltar para nível anterior
      return custos[indiceAtual - 1]
    } else {
      // Já está no mínimo
      return 0
    }
  }
}

export default function Home() {
  // ===== ESTADO =====
  const [pontosTotais, setPontosTotais] = useState<string>("")
  const [pontosGastos, setPontosGastos] = useState(0)
  
  // Atributos básicos
  const [atributos, setAtributos] = useState<Record<string, AtributoBasicoType>>({
    ST: { nome: "Força", valor: 10, custo: 10 },
    DX: { nome: "Destreza", valor: 10, custo: 20 },
    IQ: { nome: "Inteligência", valor: 10, custo: 20 },
    HT: { nome: "Vitalidade", valor: 10, custo: 10 }
  })

  // Atributos secundários
  const [valoresSecundarios, setValoresSecundarios] = useState<Record<string, AtributoSecundarioType>>({
    PV: { nome: "Pontos de Vida", valor: 10, custo: 2, base: 10 },
    PF: { nome: "Pontos de Fadiga", valor: 10, custo: 3, base: 10 },
    Vont: { nome: "Vontade", valor: 10, custo: 5, base: 10 },
    Per: { nome: "Percepção", valor: 10, custo: 5, base: 10 },
    VB: { nome: "Velocidade Básica", valor: 5.0, custo: 20, base: 5.0 },
    DB: { nome: "Deslocamento", valor: 5, custo: 5, base: 5 }
  })

  const [carga, setCarga] = useState({
    peso: ""
  })

  // Modificadores percentuais
  const [modificadores, setModificadores] = useState<ModificadorType[]>([])

  // Perícias
  const [pericias, setPericias] = useState<PericiaType[]>([])

    const [vantagensDesvantagens, setVantagensDesvantagens] = useState<VantagemDesvantagemType[]>([])

  const [equipamentos, setEquipamentos] = useState<EquipamentoType[]>([])

  // ===== CÁLCULOS =====
  // Calcular pontos totais como número
  const pontosTotaisNumero = pontosTotais === "" ? 0 : parseInt(pontosTotais) || 0

  // Atualizar bases dos atributos secundários quando atributos básicos mudam
  useEffect(() => {
    const novaBasePV = atributos.ST.valor
    const novaBasePF = atributos.HT.valor
    const novaBaseVontPer = atributos.IQ.valor
    const novaBaseVB = (atributos.DX.valor + atributos.HT.valor) / 4
    const novaBaseDB = Math.floor(novaBaseVB)
    
    setValoresSecundarios(prev => ({
      PV: { 
        ...prev.PV, 
        base: novaBasePV,
        valor: novaBasePV + (prev.PV.valor - prev.PV.base)
      },
      PF: { 
        ...prev.PF, 
        base: novaBasePF,
        valor: novaBasePF + (prev.PF.valor - prev.PF.base)
      },
      Vont: { 
        ...prev.Vont, 
        base: novaBaseVontPer,
        valor: novaBaseVontPer + (prev.Vont.valor - prev.Vont.base)
      },
      Per: { 
        ...prev.Per, 
        base: novaBaseVontPer,
        valor: novaBaseVontPer + (prev.Per.valor - prev.Per.base)
      },
      VB: { 
        ...prev.VB, 
        base: novaBaseVB,
        valor: novaBaseVB + (prev.VB.valor - prev.VB.base)
      },
      DB: { 
        ...prev.DB, 
        base: novaBaseDB,
        valor: novaBaseDB + (prev.DB.valor - prev.DB.base)
      }
    }))
  }, [atributos])

  // Calcular custo com modificadores percentuais
  const calcularCustoComModificador = (custoBase: number, atributoId: string): number => {
    const modificador = modificadores.find(m => m.id === atributoId)
    if (!modificador || !modificador.aplicavel) return custoBase
    
    const percentual = modificador.valor / 100
    const custoModificado = custoBase * (1 + percentual)
    
    // Arredondar para cima (regra do GURPS)
    return Math.ceil(custoModificado)
  }

  // Calcular valores de combate
  const calcularValoresCombate = (): ValoresCombateType => {
    const CB = (atributos.ST.valor * atributos.ST.valor) / 5
    
    const VB = valoresSecundarios.VB.valor
    const DB = valoresSecundarios.DB.valor
    const esquivaBase = Math.floor(VB + 3)
    
    // Converter peso para número
    const pesoNumero = carga.peso === "" ? 0 : parseFloat(carga.peso) || 0
    const cargaRatio = pesoNumero / CB

    // Calcular encargo
    let enc: EncargoType = { nivel: 0, label: "Nenhuma", dxPenalty: 0, esquiva: 0, moveMult: 1 }
    if (cargaRatio > 10) enc = { nivel: 4, label: "Muito Pesada", dxPenalty: -4, esquiva: -4, moveMult: 0.2 }
    else if (cargaRatio > 6) enc = { nivel: 3, label: "Pesada", dxPenalty: -3, esquiva: -3, moveMult: 0.4 }
    else if (cargaRatio > 3) enc = { nivel: 2, label: "Média", dxPenalty: -2, esquiva: -2, moveMult: 0.6 }
    else if (cargaRatio > 2) enc = { nivel: 1, label: "Leve", dxPenalty: -1, esquiva: -1, moveMult: 0.8 }

    const esquivaFinal = esquivaBase + enc.esquiva
    const DBfinal = Math.floor(DB * enc.moveMult)
    const DXcomPenalidade = atributos.DX.valor + enc.dxPenalty

    return {
      CB,
      esquivaBase, esquivaFinal,
      DBfinal, DXcomPenalidade,
      cargaRatio, enc,
      VB, DB,
      pesoNumero
    }
  }

  const valoresCombate = calcularValoresCombate()

  // Calcular NH final de uma perícia
  const calcularNHPericia = (pericia: PericiaType): number => {
    const atributoValor = atributos[pericia.atributo].valor
    
    // Se tem pontos investidos, usa a lógica dos pontos
    if (pericia.pontos > 0) {
      return calcularNHComPontos(pericia.pontos, pericia.dificuldade, atributoValor)
    }
    
    // Se não tem pontos, retorna um valor especial que indica "use o pré-definido"
    // Usamos -9999 como marcador para "N/A" ou "pré-definido"
    return -9999
  }

  // Calcular custo de uma perícia (já que os pontos são o custo)
  const calcularCustoPericia = (pericia: PericiaType): number => {
    return pericia.pontos
  }

  // Calcular pontos gastos incluindo modificadores e perícias
  useEffect(() => {
    let total = 0
    
    // Custo dos atributos básicos (com modificadores)
    Object.entries(atributos).forEach(([key, atributo]) => {
      const diferenca = atributo.valor - 10
      if (diferenca !== 0) {
        const custoPorNivel = calcularCustoComModificador(atributo.custo, key)
        total += diferenca * custoPorNivel
      }
    })
    
    // Custo dos atributos secundários
    Object.entries(valoresSecundarios).forEach(([key, sec]) => {
      const diferenca = sec.valor - sec.base
      if (diferenca !== 0) {
        let custoPorNivel = sec.custo
        
        if (key === "DB") {
          custoPorNivel = calcularCustoComModificador(sec.custo, "MOVE")
        }
        
        total += diferenca * custoPorNivel
      }
    })
    
    // Custo das perícias
    pericias.forEach(pericia => {
      total += pericia.pontos
    })
    
    // Custo das vantagens e desvantagens
    vantagensDesvantagens.forEach(vd => {
      total += vd.custo
    })
    
    setPontosGastos(total)
  }, [atributos, valoresSecundarios, modificadores, pericias, vantagensDesvantagens])

  // Obter dano baseado na ST
  const dano = DAMAGE_TABLE[atributos.ST.valor] ?? { thrust: "-", swing: "-" }

  // ===== HANDLERS =====
  const ajustarAtributo = (key: string, incremento: number) => {
    const atributo = atributos[key]
    const novoValor = atributo.valor + incremento
    const diferenca = novoValor - 10
    
    // Calcular custo da mudança considerando modificadores
    const custoPorNivel = calcularCustoComModificador(atributo.custo, key)
    const custoMudança = incremento * custoPorNivel
    
    // Verificar pontos disponíveis
    if (custoMudança > 0 && custoMudança > (pontosTotaisNumero - pontosGastos)) {
      return
    }
    
    if (novoValor >= 1) {
      setAtributos(prev => ({
        ...prev,
        [key]: { ...atributo, valor: novoValor }
      }))
    }
  }

  const ajustarAtributoSecundario = (key: string, incremento: number) => {
    const atributo = valoresSecundarios[key]
    
    // Definir incremento baseado no atributo
    let incrementoEfetivo = incremento
    if (key === "VB") {
      incrementoEfetivo = incremento * 0.25
    }
    
    const novoValor = atributo.valor + incrementoEfetivo
    const diferencaAtual = atributo.valor - atributo.base
    const novaDiferenca = novoValor - atributo.base
    
    // Calcular custo da mudança considerando modificadores
    let custoPorNivel = atributo.custo
    if (key === "DB") {
      custoPorNivel = calcularCustoComModificador(atributo.custo, "MOVE")
    }
    
    const custoMudança = (novaDiferenca - diferencaAtual) * custoPorNivel
    
    // Verificar pontos disponíveis
    if (custoMudança > 0 && custoMudança > (pontosTotaisNumero - pontosGastos)) {
      return
    }
    
    // Verificar valor mínimo
    const valorMinimo = key === "VB" ? 0.25 : 1
    if (novoValor >= valorMinimo) {
      setValoresSecundarios(prev => ({
        ...prev,
        [key]: { ...atributo, valor: novoValor }
      }))
    }
  }

  const handlePesoChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCarga(prev => ({ ...prev, peso: value }))
    }
  }

  const handlePontosTotaisChange = (value: string) => {
    if (value === "" || /^\d*$/.test(value)) {
      setPontosTotais(value)
    }
  }

  const handleModificadorChange = (id: string, valor: number) => {
    setModificadores(prev => 
      prev.map(mod => 
        mod.id === id ? { ...mod, valor } : mod
      )
    )
  }

  const handleToggleModificador = (id: string) => {
    setModificadores(prev => 
      prev.map(mod => 
        mod.id === id ? { ...mod, aplicavel: !mod.aplicavel } : mod
      )
    )
  }

  const handleAdicionarPericia = () => {
    const novaPericia: PericiaType = {
      id: Date.now().toString(),
      nome: "Nova Perícia",
      atributo: "DX",
      dificuldade: "medio",
      pontos: 0,
      predefinido: "",
      nhFinal: atributos.DX.valor
    }
    setPericias([...pericias, novaPericia])
  }

  const handleRemoverPericia = (id: string) => {
    setPericias(pericias.filter(p => p.id !== id))
  }

  const handlePericiaChange = (id: string, campo: keyof PericiaType, valor: any) => {
    setPericias(prev => prev.map(pericia => {
      if (pericia.id === id) {
        const atualizada = { ...pericia, [campo]: valor }
        
        // Recalcular NH final se necessário
        if (campo === 'pontos' || campo === 'predefinido' || campo === 'atributo' || campo === 'dificuldade') {
          atualizada.nhFinal = calcularNHPericia(atualizada)
        }
        
        return atualizada
      }
      return pericia
    }))
  }

const handleAdicionarVD = (novaVD: VantagemDesvantagemType) => {
  setVantagensDesvantagens([...vantagensDesvantagens, novaVD])
}

const handleRemoverVD = (id: string) => {
  setVantagensDesvantagens(vantagensDesvantagens.filter(vd => vd.id !== id))
}

const handleVDChange = (id: string, campo: keyof VantagemDesvantagemType, valor: any) => {
  setVantagensDesvantagens(prev => prev.map(vd => {
    if (vd.id === id) {
      // Se o tipo mudou de desvantagem para vantagem ou vice-versa, ajustar o custo
      if (campo === 'tipo' && valor !== vd.tipo) {
        const novoCusto = valor === 'desvantagem' ? -Math.abs(vd.custo) : Math.abs(vd.custo)
        return { ...vd, tipo: valor, custo: novoCusto }
      }
      // Se mudou o custo, garantir o sinal correto
      if (campo === 'custo') {
        const custoAjustado = vd.tipo === 'desvantagem' ? -Math.abs(valor) : Math.abs(valor)
        return { ...vd, [campo]: custoAjustado }
      }
      return { ...vd, [campo]: valor }
    }
    return vd
  }))
}

const handleAdicionarEquipamento = (tipo: 'arma-corpo' | 'arma-distancia' | 'armadura' | 'outro') => {
  let novoEquipamento: EquipamentoType
  
  const baseData = {
    id: Date.now().toString(),
    nome: "Novo Equipamento",
    custo: 0,
    peso: 0
  }
  
  switch (tipo) {
    case 'arma-corpo':
      novoEquipamento = {
        ...baseData,
        tipo: 'arma-corpo',
        nome: "Nova Arma",
        dano: "-",
        alcance: "-",
        aparar: "-",
        stMinima: 0
      }
      break
    case 'arma-distancia':
      novoEquipamento = {
        ...baseData,
        tipo: 'arma-distancia',
        nome: "Nova Arma à Distância",
        dano: "-",
        precisao: 0,
        alcance: "-",
        cdt: "-",
        tiros: "-",
        stMinima: 0,
        magnet: "-"
      }
      break
    case 'armadura':
      novoEquipamento = {
        ...baseData,
        tipo: 'armadura',
        nome: "Nova Armadura",
        local: "-",
        rd: 0
      }
      break
    case 'outro':
      novoEquipamento = {
        ...baseData,
        tipo: 'outro',
        nome: "Novo Item",
        descricao: ""
      }
      break
  }
  
  setEquipamentos([...equipamentos, novoEquipamento])
}

const handleRemoverEquipamento = (id: string) => {
  setEquipamentos(equipamentos.filter(e => e.id !== id))
}

const handleEquipamentoChange = (id: string, campo: string, valor: any) => {
  setEquipamentos(prev => prev.map(e => {
    if (e.id === id) {
      // Type assertion para evitar erros do TypeScript
      const equipamento = { ...e } as any
      equipamento[campo] = valor
      return equipamento as EquipamentoType
    }
    return e
  }))
}

const ajustarPontosPericia = (id: string, incremento: number) => {
  const pericia = pericias.find(p => p.id === id)
  if (!pericia) return
  
  const pontosAtuais = pericia.pontos
  
  // Calcular o próximo nível válido
  const proximoNivel = obterProximoNivelValido(pontosAtuais, pericia.dificuldade, incremento)
  
  // Não permitir pontos negativos
  if (proximoNivel < 0) return
  
  // Calcular custo da mudança
  const custoMudança = proximoNivel - pontosAtuais
  
  // Verificar pontos disponíveis
  if (custoMudança > 0 && custoMudança > (pontosTotaisNumero - pontosGastos)) {
    return
  }
  
  // Atualizar pontos
  handlePericiaChange(id, 'pontos', proximoNivel)
}

  return (
<main className="min-h-screen p-4 max-w-7xl mx-auto space-y-6">
  {/* Cabeçalho */}
  <div className="text-center">
    <h1 className="text-2xl font-light">FICHA GURPS</h1>
    <div className="text-xs text-gray-500">Sistema baseado em pontos</div>
  </div>

  {/* Controle de pontos */}
  <ControlePontos
    pontosTotais={pontosTotais}
    pontosGastos={pontosGastos}
    pontosTotaisNumero={pontosTotaisNumero}
    onPontosTotaisChange={handlePontosTotaisChange}
  />

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Coluna esquerda - Atributos (mais alta) */}
    <div className="space-y-4">
      {/* Atributos Básicos */}
      <div className="border border-gray-700 rounded p-3">
        <h2 className="text-sm font-medium mb-2 border-b border-gray-800 pb-1">
          Atributos Básicos
        </h2>
        <div className="space-y-1">
          {Object.entries(atributos).map(([key, attr]) => (
            <AtributoBasico
              key={key}
              id={key}
              nome={attr.nome}
              valor={attr.valor}
              custo={calcularCustoComModificador(attr.custo, key)}
              pontosDisponiveis={pontosTotaisNumero - pontosGastos}
              onAjustar={ajustarAtributo}
              modificador={modificadores.find(m => m.id === key)?.valor || 0}
            />
          ))}
        </div>
      </div>

      {/* Atributos Secundários */}
      <div className="border border-gray-700 rounded p-3">
        <h2 className="text-sm font-medium mb-2 border-b border-gray-800 pb-1">
          Características
        </h2>
        <div className="space-y-1">
          {Object.entries(valoresSecundarios).map(([key, sec]) => (
            <AtributoSecundario
              key={key}
              id={key}
              nome={sec.nome}
              valor={sec.valor}
              base={sec.base}
              custo={key === "DB" ? calcularCustoComModificador(sec.custo, "MOVE") : sec.custo}
              pontosDisponiveis={pontosTotaisNumero - pontosGastos}
              onAjustar={ajustarAtributoSecundario}
              modificador={key === "DB" ? modificadores.find(m => m.id === "MOVE")?.valor : undefined}
            />
          ))}
        </div>
      </div>

      {/* Modificadores Percentuais */}
      <ModificadoresPercentuais
        modificadores={modificadores}
        onModificadorChange={handleModificadorChange}
        onToggleModificador={handleToggleModificador}
      />
    </div>

    {/* Colunas direita - Grid de 2 colunas para o restante */}
    <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sub-coluna esquerda (dentro da área de 2 colunas) */}
      <div className="space-y-4">
        {/* Atributos em Combate */}
        <div className="border border-gray-700 rounded p-3">
          <h2 className="text-sm font-medium mb-2 border-b border-gray-800 pb-1">
            Atributos em Combate
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ResultadoDisplay 
              label="Esquiva" 
              value={valoresCombate.esquivaFinal} 
              subtext={`Base: ${valoresCombate.esquivaBase} ${valoresCombate.enc.esquiva < 0 ? `(${valoresCombate.enc.esquiva})` : ''}`} 
            />
            <ResultadoDisplay 
              label="DX em Combate" 
              value={valoresCombate.DXcomPenalidade} 
              subtext={`Base: ${atributos.DX.valor} ${valoresCombate.enc.dxPenalty < 0 ? `(${valoresCombate.enc.dxPenalty})` : ''}`} 
            />
            <ResultadoDisplay 
              label="Deslocamento" 
              value={valoresCombate.DBfinal} 
              subtext={`Base: ${valoresCombate.DB} × ${valoresCombate.enc.moveMult}`} 
            />
            <ResultadoDisplay label="Velocidade" value={valoresCombate.VB.toFixed(2)} />
            <ResultadoDisplay label="PV" value={valoresSecundarios.PV.valor} />
            <ResultadoDisplay label="PF" value={valoresSecundarios.PF.valor} />
            <ResultadoDisplay label="Vontade" value={valoresSecundarios.Vont.valor} />
            <ResultadoDisplay label="Percepção" value={valoresSecundarios.Per.valor} />
          </div>
        </div>

        {/* Dano */}
        <DanoDisplay 
          st={atributos.ST.valor}
          thrust={dano.thrust}
          swing={dano.swing}
        />
      </div>

      {/* Sub-coluna direita (dentro da área de 2 colunas) */}
      <div className="space-y-4">
        {/* Carga */}
        <CargaAtual
          peso={carga.peso}
          onPesoChange={handlePesoChange}
          valoresCombate={valoresCombate}
        />

        {/* Tabela de Cargas */}
        <TabelaCargas
          st={atributos.ST.valor}
          cb={valoresCombate.CB}
          cargaRatio={valoresCombate.cargaRatio}
          pesoAtual={valoresCombate.pesoNumero}
          nivelEncargo={valoresCombate.enc.nivel}
        />

        {/* Resumo de Encargo */}
        {valoresCombate.enc.nivel > 0 && (
          <PenalidadesEncargo encargo={valoresCombate.enc} />
        )}
      </div>

      {/* Equipamentos (ocupa as 2 sub-colunas abaixo) */}
      <div className="lg:col-span-2">
        <Equipamentos
          equipamentos={equipamentos}
          onAdicionar={handleAdicionarEquipamento}
          onRemover={handleRemoverEquipamento}
          onChange={handleEquipamentoChange}
        />
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    {/* Coluna esquerda - Perícias */}
    <div>
      <Pericias
        pericias={pericias}
        atributos={atributos}
        pontosDisponiveis={pontosTotaisNumero - pontosGastos}
        onAdicionarPericia={handleAdicionarPericia}
        onRemoverPericia={handleRemoverPericia}
        onPericiaChange={handlePericiaChange}
        onAjustarPontosPericia={ajustarPontosPericia}
      />
    </div>

    {/* Coluna direita - Vantagens e Desvantagens */}
    <div>
      <VantagensDesvantagens
        vantagensDesvantagens={vantagensDesvantagens}
        pontosDisponiveis={pontosTotaisNumero - pontosGastos}
        onAdicionar={handleAdicionarVD}
        onRemover={handleRemoverVD}
        onChange={handleVDChange}
      />
    </div>
  </div>

  {/* Footer */}
  <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
    Ficha GURPS • Valores calculados em tempo real
  </div>
</main>
  )
}
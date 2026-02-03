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

export default function Home() {
  // ===== ESTADO =====
  const [pontosTotais, setPontosTotais] = useState<string>("100")
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
  const [modificadores, setModificadores] = useState<ModificadorType[]>([
    { id: "ST", nome: "Força (ST)", valor: 0, aplicavel: true },
    { id: "HT", nome: "Vitalidade (HT)", valor: 0, aplicavel: true },
    { id: "MOVE", nome: "Movimento (DB)", valor: 0, aplicavel: true }
  ])

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

  // Calcular pontos gastos incluindo modificadores
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
    // DB usa modificador de MOVE
    Object.entries(valoresSecundarios).forEach(([key, sec]) => {
      const diferenca = sec.valor - sec.base
      if (diferenca !== 0) {
        let custoPorNivel = sec.custo
        
        // Aplicar modificador de movimento no DB
        if (key === "DB") {
          custoPorNivel = calcularCustoComModificador(sec.custo, "MOVE")
        }
        
        total += diferenca * custoPorNivel
      }
    })
    
    setPontosGastos(total)
  }, [atributos, valoresSecundarios, modificadores])

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
        {/* Coluna esquerda - Atributos */}
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

        {/* Coluna direita - Resultados */}
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

        {/* Coluna direita - Carga e Tabela */}
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
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
        Ficha GURPS • Valores calculados em tempo real
      </div>
    </main>
  )
}
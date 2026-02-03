interface ControlePontosProps {
  pontosTotais: string
  pontosGastos: number
  pontosTotaisNumero: number
  onPontosTotaisChange: (value: string) => void
}

export default function ControlePontos({ 
  pontosTotais, pontosGastos, pontosTotaisNumero, onPontosTotaisChange 
}: ControlePontosProps) {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="p-2 border border-gray-700 rounded">
        <div className="text-xs text-gray-500">Pontos Totais</div>
        <input
          type="text"
          inputMode="numeric"
          value={pontosTotais}
          onChange={(e) => onPontosTotaisChange(e.target.value)}
          placeholder="100"
          className="w-full bg-transparent text-lg text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div className="p-2 border border-gray-700 rounded">
        <div className="text-xs text-gray-500">Pontos Gastos</div>
        <div className="text-lg font-semibold">{pontosGastos}</div>
      </div>
      <div className={`p-2 border rounded ${pontosGastos <= pontosTotaisNumero ? 'border-gray-700' : 'border-red-700'}`}>
        <div className="text-xs text-gray-500">Pontos Restantes</div>
        <div className={`text-lg font-semibold ${pontosGastos <= pontosTotaisNumero ? '' : 'text-red-500'}`}>
          {pontosTotaisNumero - pontosGastos}
        </div>
      </div>
    </div>
  )
}
interface ResultadoDisplayProps {
  label: string
  value: string | number
  subtext?: string
}

export default function ResultadoDisplay({ label, value, subtext }: ResultadoDisplayProps) {
  return (
    <div className="p-2 border border-gray-700 rounded">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-center">{value}</div>
      {subtext && <div className="text-xs text-gray-500 text-center">{subtext}</div>}
    </div>
  )
}
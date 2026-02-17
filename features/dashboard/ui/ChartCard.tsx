interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export default function ChartCard({ title, children }: Readonly<ChartCardProps>) {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      {children}
    </div>
  )
}

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

export default function LineChart({
  data,
  dataKey,
  xAxisKey = 'month',
  color = '#f97316',
  height = 300,
  showGrid = true
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-black/80 border border-white/10 backdrop-blur-xl rounded-xl p-3 shadow-2xl"
          style={{
            boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.2)',
          }}
        >
          <p className="text-xs font-bold text-violet-400 mb-1 tracking-wide uppercase">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
            <span className="text-sm font-bold text-white">
              {payload[0].value} Hires
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
            <stop offset="50%" stopColor="#f97316" stopOpacity={0.05} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>

        {showGrid && (
          <CartesianGrid strokeDasharray="6 6" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
        )}

        <XAxis
          dataKey={xAxisKey}
          stroke="rgba(255, 255, 255, 0.4)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={10}
        />

        <YAxis
          stroke="rgba(255, 255, 255, 0.4)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dx={-5}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.15)', strokeWidth: 1.5 }} />

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="url(#strokeGradient)"
          strokeWidth={3}
          fill="url(#areaGradient)"
          activeDot={{ 
            r: 6, 
            stroke: '#ea580c', 
            strokeWidth: 2, 
            fill: '#ffffff', 
            style: { filter: 'drop-shadow(0px 0px 8px rgba(234, 88, 12, 0.8))' } 
          }}
          dot={false}
          animationDuration={1200}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

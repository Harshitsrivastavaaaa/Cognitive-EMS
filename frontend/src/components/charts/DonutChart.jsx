import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#22c55e', '#ef4444']

export default function DonutChart({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colors = COLORS,
  height = 200,
  innerRadius = 60,
  outerRadius = 78,
  showLegend = true
}) {
  const allZero = data && data.length > 0 && data.every(d => Number(d[dataKey] || 0) === 0);
  const chartData = allZero ? data.map(d => ({ ...d, chartValue: 1 })) : data;
  const effectiveDataKey = allZero ? 'chartValue' : dataKey;
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const itemData = payload[0].payload;
      const displayValue = itemData[dataKey] !== undefined ? itemData[dataKey] : 0;
      return (
        <div
          className="bg-black/80 border border-white/10 backdrop-blur-xl rounded-xl p-3 shadow-2xl"
          style={{
            boxShadow: '0 10px 30px -5px rgba(236, 72, 153, 0.2)',
          }}
        >
          <p className="text-xs font-bold text-slate-400 mb-1 tracking-wide uppercase">Department</p>
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ 
                background: payload[0].payload.fill,
                boxShadow: `0 0 6px ${payload[0].payload.fill}`
              }}
            ></span>
            <span className="text-sm font-bold text-white">
              {payload[0].name}: {displayValue}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  const renderLegend = () => (
    <ul className="mt-4 flex flex-wrap justify-center gap-2 text-xs w-full">
      {data.map((item, i) => (
        <li 
          key={i} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors duration-200"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ 
              background: colors[i % colors.length],
              boxShadow: `0 0 6px ${colors[i % colors.length]}`
            }}
          />
          {item.name} ({item[dataKey] ?? 0})
        </li>
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey={effectiveDataKey}
            nameKey={nameKey}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={colors[i % colors.length]}
                stroke="rgba(0,0,0,0)"
                style={{
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'filter 0.3s ease-out',
                }}
                className="hover:brightness-110"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {showLegend && renderLegend()}
    </div>
  )
}

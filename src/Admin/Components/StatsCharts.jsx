import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#0EA5E9"];

export default function StatsCharts({ stats, type }) {
  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={stats}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366F1"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        );

      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" />
            <PolarRadiusAxis />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        );

      case "pie":
      default:
        const renderCustomLabel = ({
          cx,
          cy,
          midAngle,
          outerRadius,
          percent,
          index,
          value,
          name,
        }) => {
          const RADIAN = Math.PI / 180;
          const radius = outerRadius + 20;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text
              x={x}
              y={y}
              fill="#fff"
              textAnchor={x > cx ? "start" : "end"}
              dominantBaseline="central"
              fontSize={12}
            >
              {`${name}: ${value}`}
            </text>
          );
        };

        return (
          <PieChart>
            <Pie
              data={stats}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomLabel}
            >
              {stats.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-gray-700">
      <ResponsiveContainer width="100%" height={350}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

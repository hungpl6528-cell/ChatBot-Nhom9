import React from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { ComparisonItem, DashboardStats } from '../../services/experimentService'

// ── Metric KPI Card ──────────────────────────────────────────
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, subtitle, icon, color = 'text-brand-400',
}) => (
  <div className="bg-surface-card rounded-2xl border border-surface-border p-5 hover:border-brand-500/30 transition-all hover:shadow-lg hover:shadow-brand-500/5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
)

// ── Dashboard Stats Row ──────────────────────────────────────
interface StatsRowProps {
  stats: DashboardStats
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
    <MetricCard title="Tài liệu" value={stats.total_documents} icon="📚" />
    <MetricCard title="Câu hỏi" value={stats.total_questions} icon="❓" />
    <MetricCard
      title="Thời gian TB"
      value={`${stats.avg_response_time.toFixed(2)}s`}
      subtitle="Phản hồi trung bình"
      icon="⚡"
      color="text-amber-400"
    />
    <MetricCard
      title="Accuracy TB"
      value={`${(stats.avg_accuracy * 100).toFixed(1)}%`}
      icon="🎯"
      color="text-emerald-400"
    />
    <MetricCard
      title="Relevancy TB"
      value={`${(stats.avg_relevancy * 100).toFixed(1)}%`}
      icon="🔗"
      color="text-sky-400"
    />
    <MetricCard
      title="Faithfulness TB"
      value={`${(stats.avg_faithfulness * 100).toFixed(1)}%`}
      icon="✅"
      color="text-violet-400"
    />
  </div>
)

// ── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? (entry.value * 100).toFixed(1) + '%' : entry.value}
        </p>
      ))}
    </div>
  )
}

// ── Bar Chart: Accuracy / Relevancy / Faithfulness ───────────
interface PerformanceChartProps {
  data: ComparisonItem[]
}

export const PerformanceBarChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.ten_thu_nghiem.length > 15
      ? item.ten_thu_nghiem.substring(0, 15) + '...'
      : item.ten_thu_nghiem,
    'Accuracy': item.avg_accuracy,
    'Relevancy': item.avg_relevancy,
    'Faithfulness': item.avg_faithfulness,
  }))

  return (
    <Card>
      <CardHeader
        title="So Sánh Metrics"
        subtitle="Accuracy / Relevancy / Faithfulness theo thử nghiệm"
        icon={<span>📊</span>}
      />
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: '20px' }} />
            <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Relevancy" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Faithfulness" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}

// ── Line Chart: Latency ──────────────────────────────────────
export const LatencyLineChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.ten_thu_nghiem.length > 12
      ? item.ten_thu_nghiem.substring(0, 12) + '...'
      : item.ten_thu_nghiem,
    'Latency (ms)': item.avg_latency,
    'Overall Score': item.avg_overall * 100,
  }))

  return (
    <Card>
      <CardHeader
        title="Latency & Overall Score"
        subtitle="Thời gian phản hồi và điểm tổng hợp"
        icon={<span>⚡</span>}
      />
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: '20px' }} />
            <Line yAxisId="left" type="monotone" dataKey="Latency (ms)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="Overall Score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}

// ── Radar Chart ──────────────────────────────────────────────
export const RadarComparisonChart: React.FC<PerformanceChartProps> = ({ data }) => {
  if (!data.length) return null

  const radarData = [
    { metric: 'Accuracy', ...Object.fromEntries(data.map((d) => [d.ten_thu_nghiem, d.avg_accuracy])) },
    { metric: 'Relevancy', ...Object.fromEntries(data.map((d) => [d.ten_thu_nghiem, d.avg_relevancy])) },
    { metric: 'Faithfulness', ...Object.fromEntries(data.map((d) => [d.ten_thu_nghiem, d.avg_faithfulness])) },
    { metric: 'Overall', ...Object.fromEntries(data.map((d) => [d.ten_thu_nghiem, d.avg_overall])) },
  ]

  const COLORS = ['#6366f1', '#38bdf8', '#a78bfa', '#f59e0b', '#10b981']

  return (
    <Card>
      <CardHeader title="Radar So Sánh" subtitle="Tổng quan các chỉ số" icon={<span>🎯</span>} />
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2d3148" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            {data.slice(0, 5).map((item, i) => (
              <Radar
                key={item.experiment_id}
                name={item.ten_thu_nghiem}
                dataKey={item.ten_thu_nghiem}
                stroke={COLORS[i]}
                fill={COLORS[i]}
                fillOpacity={0.15}
              />
            ))}
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}

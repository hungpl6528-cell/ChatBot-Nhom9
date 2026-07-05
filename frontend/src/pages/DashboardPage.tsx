import React, { useEffect, useState } from 'react'
import { experimentService } from '../services/experimentService'
import { StatsRow, PerformanceBarChart, LatencyLineChart, RadarComparisonChart } from '../components/dashboard/DashboardCharts'
import { Spinner } from '../components/ui/index'
import type { DashboardStats, ComparisonItem } from '../services/experimentService'

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, compData] = await Promise.all([
        experimentService.getDashboardStats(),
        experimentService.getComparison(),
      ])
      setStats(statsData)
      setComparisons(compData)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError('Không thể tải dữ liệu dashboard. Đảm bảo backend đang chạy.')
      // Use mock data for demo
      setStats({
        total_documents: 0,
        total_questions: 0,
        avg_response_time: 0,
        avg_accuracy: 0,
        avg_relevancy: 0,
        avg_faithfulness: 0,
      })
      setComparisons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">📊 Dashboard & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tổng quan hiệu năng hệ thống RAG và kết quả benchmark
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-xs text-slate-600">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </p>
          )}
          <button
            id="dashboard-refresh"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-surface-card border border-surface-border rounded-xl text-sm text-slate-300 hover:border-brand-500/40 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-400 text-lg">⚠️</span>
          <div>
            <p className="text-amber-300 font-medium text-sm">{error}</p>
            <p className="text-amber-500/70 text-xs mt-1">Hiển thị dữ liệu mẫu — Chạy backend để xem dữ liệu thực.</p>
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : stats ? (
        <StatsRow stats={stats} />
      ) : null}

      {/* Charts */}
      {!loading && comparisons.length === 0 ? (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Chưa có dữ liệu so sánh</h3>
          <p className="text-slate-500 text-sm mb-6">
            Tạo và chạy các thử nghiệm trong trang <strong className="text-brand-400">Thử Nghiệm</strong> để xem biểu đồ so sánh tại đây.
          </p>
          <a
            href="/experiments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            🧪 Đến trang Thử Nghiệm
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PerformanceBarChart data={comparisons} />
          <LatencyLineChart data={comparisons} />
          <div className="xl:col-span-2">
            <RadarComparisonChart data={comparisons} />
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {!loading && comparisons.length > 0 && (
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border flex items-center gap-3">
            <span className="text-lg">🏆</span>
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">Bảng So Sánh Experiments</h3>
              <p className="text-xs text-slate-500">Xếp hạng theo Overall Score</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên thử nghiệm</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chunking</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Embedding</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Relevancy</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Faithfulness</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Latency</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall</th>
                </tr>
              </thead>
              <tbody>
                {[...comparisons]
                  .sort((a, b) => b.avg_overall - a.avg_overall)
                  .map((item, index) => (
                    <tr key={item.experiment_id} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-yellow-400">🥇</span>}
                          {index === 1 && <span className="text-slate-400">🥈</span>}
                          {index === 2 && <span className="text-amber-700">🥉</span>}
                          <span className="text-slate-200 font-medium">{item.ten_thu_nghiem}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 border border-violet-500/20 rounded-full text-xs">
                          {item.chunking_strategy}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[150px] truncate">{item.embedding_model}</td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBar value={item.avg_accuracy} color="brand" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBar value={item.avg_relevancy} color="sky" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBar value={item.avg_faithfulness} color="violet" />
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-xs">
                        {item.avg_latency.toFixed(0)} ms
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-emerald-400">
                          {(item.avg_overall * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const ScoreBar: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
  }
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorMap[color] || 'bg-brand-500'} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default DashboardPage

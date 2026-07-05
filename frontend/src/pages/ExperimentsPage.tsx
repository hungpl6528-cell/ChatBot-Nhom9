import React, { useEffect, useState } from 'react'
import { experimentService, Experiment, ExperimentCreate } from '../services/experimentService'
import { Badge, Spinner, Select, Input } from '../components/ui/index'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'

const CHUNKING_OPTIONS = [
  { value: 'recursive', label: '🔄 Recursive (Đề xuất)' },
  { value: 'fixed-size', label: '📏 Fixed-size' },
  { value: 'semantic', label: '🧠 Semantic' },
]

const EMBEDDING_OPTIONS = [
  { value: 'text-embedding-3-small', label: '🤖 OpenAI text-embedding-3-small' },
  { value: 'multilingual-e5-base', label: '🌐 multilingual-e5-base (Free)' },
  { value: 'BAAI/bge-m3', label: '🔓 BAAI/bge-m3 (Free)' },
]

const AI_MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: '⚡ GPT-4o Mini' },
  { value: 'gpt-4o', label: '🧠 GPT-4o' },
  { value: 'gpt-3.5-turbo', label: '🚀 GPT-3.5 Turbo' },
]

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  pending: { label: '⏳ Pending', variant: 'default' },
  running: { label: '🔄 Đang chạy', variant: 'info' },
  completed: { label: '✅ Hoàn thành', variant: 'success' },
  failed: { label: '❌ Thất bại', variant: 'error' },
}

const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [runningId, setRunningId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list')
  const [maxQuestions, setMaxQuestions] = useState(20)

  // Form state
  const [form, setForm] = useState<ExperimentCreate>({
    ten_thu_nghiem: '',
    mo_ta: '',
    chunking_strategy: 'recursive',
    embedding_model: 'text-embedding-3-small',
    ai_model: 'gpt-4o-mini',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchExperiments = async () => {
    setLoading(true)
    try {
      const data = await experimentService.listExperiments()
      setExperiments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiments()
    // Poll for status updates if any experiment is running
    const interval = setInterval(() => {
      const hasRunning = experiments.some(e => e.trang_thai === 'running')
      if (hasRunning) fetchExperiments()
    }, 5000)
    return () => clearInterval(interval)
  }, [experiments.some(e => e.trang_thai === 'running')])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ten_thu_nghiem.trim()) {
      setFormError('Vui lòng nhập tên thử nghiệm')
      return
    }
    setCreating(true)
    setFormError(null)
    setSuccessMsg(null)
    try {
      const created = await experimentService.createExperiment(form)
      setExperiments(prev => [created, ...prev])
      setSuccessMsg(`✅ Đã tạo thử nghiệm "${created.ten_thu_nghiem}" thành công!`)
      setForm({ ten_thu_nghiem: '', mo_ta: '', chunking_strategy: 'recursive', embedding_model: 'text-embedding-3-small', ai_model: 'gpt-4o-mini' })
      setActiveTab('list')
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Không thể tạo thử nghiệm')
    } finally {
      setCreating(false)
    }
  }

  const handleRunBenchmark = async (expId: number, name: string) => {
    if (!confirm(`Chạy benchmark cho "${name}" với ${maxQuestions} câu hỏi?`)) return
    setRunningId(expId)
    try {
      await experimentService.runExperiment(expId, maxQuestions)
      setExperiments(prev =>
        prev.map(e => e.id === expId ? { ...e, trang_thai: 'running' } : e)
      )
      // Poll for completion
      const poll = setInterval(async () => {
        const exp = await experimentService.getExperiment(expId)
        setExperiments(prev => prev.map(e => e.id === expId ? exp : e))
        if (exp.trang_thai !== 'running') {
          clearInterval(poll)
          setRunningId(null)
        }
      }, 3000)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Lỗi khi chạy benchmark')
      setRunningId(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">🧪 Thử Nghiệm Benchmark</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tạo và chạy thử nghiệm so sánh các chiến lược RAG khác nhau
          </p>
        </div>
        <Button id="create-experiment-btn" onClick={() => setActiveTab('create')}>
          ＋ Tạo thử nghiệm mới
        </Button>
      </div>

      {/* Success msg */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm flex items-center gap-2">
          {successMsg}
          <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-600 hover:text-emerald-400">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          id="tab-experiments-list"
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'list'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
          }`}
        >
          📋 Danh Sách ({experiments.length})
        </button>
        <button
          id="tab-experiments-create"
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'create'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
          }`}
        >
          ＋ Tạo Mới
        </button>
      </div>

      {activeTab === 'create' ? (
        /* Create Form */
        <Card>
          <CardHeader
            title="Tạo Thử Nghiệm Mới"
            subtitle="Cấu hình chiến lược chunking và embedding model để so sánh"
            icon={<span>🧪</span>}
          />
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-5">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  ⚠️ {formError}
                </div>
              )}

              <Input
                id="exp-name"
                label="Tên thử nghiệm *"
                placeholder="VD: Fixed-size + OpenAI Embeddings"
                value={form.ten_thu_nghiem}
                onChange={e => setForm(f => ({ ...f, ten_thu_nghiem: e.target.value }))}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Mô tả (tùy chọn)</label>
                <textarea
                  id="exp-desc"
                  className="bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors resize-none"
                  rows={2}
                  placeholder="Ghi chú về thử nghiệm này..."
                  value={form.mo_ta || ''}
                  onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  id="exp-chunking"
                  label="Chiến lược Chunking"
                  options={CHUNKING_OPTIONS}
                  value={form.chunking_strategy}
                  onChange={e => setForm(f => ({ ...f, chunking_strategy: e.target.value as any }))}
                />
                <Select
                  id="exp-embedding"
                  label="Embedding Model"
                  options={EMBEDDING_OPTIONS}
                  value={form.embedding_model}
                  onChange={e => setForm(f => ({ ...f, embedding_model: e.target.value }))}
                />
                <Select
                  id="exp-ai-model"
                  label="AI Model (LLM)"
                  options={AI_MODEL_OPTIONS}
                  value={form.ai_model || 'gpt-4o-mini'}
                  onChange={e => setForm(f => ({ ...f, ai_model: e.target.value }))}
                />
              </div>

              {/* Config Preview */}
              <div className="bg-surface border border-surface-border rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Preview cấu hình</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Chunking', value: form.chunking_strategy, icon: '✂️' },
                    { label: 'Embedding', value: form.embedding_model.split('/').pop() || form.embedding_model, icon: '🔢' },
                    { label: 'LLM', value: form.ai_model || 'gpt-4o-mini', icon: '🤖' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-xs font-medium text-slate-300 mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button id="create-exp-submit" type="submit" loading={creating}>
                  Tạo Thử Nghiệm
                </Button>
                <Button variant="ghost" onClick={() => setActiveTab('list')}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : (
        /* Experiments List */
        <div className="space-y-4">
          {/* Max questions config */}
          <div className="flex items-center gap-3 bg-surface-card border border-surface-border rounded-xl p-4">
            <span className="text-sm text-slate-400">Số câu hỏi benchmark tối đa:</span>
            <input
              id="max-questions-input"
              type="number"
              min={1}
              max={50}
              value={maxQuestions}
              onChange={e => setMaxQuestions(Number(e.target.value))}
              className="w-20 bg-surface border border-surface-border rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            <span className="text-xs text-slate-500">câu (từ testset.json)</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : experiments.length === 0 ? (
            <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🧪</div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Chưa có thử nghiệm nào</h3>
              <p className="text-slate-500 text-sm mb-6">Tạo thử nghiệm đầu tiên để so sánh các chiến lược RAG.</p>
              <Button id="create-first-exp" onClick={() => setActiveTab('create')}>
                ＋ Tạo thử nghiệm đầu tiên
              </Button>
            </div>
          ) : (
            experiments.map(exp => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                isRunning={runningId === exp.id}
                onRun={() => handleRunBenchmark(exp.id, exp.ten_thu_nghiem)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

const ExperimentCard: React.FC<{
  experiment: Experiment
  isRunning: boolean
  onRun: () => void
}> = ({ experiment: exp, isRunning, onRun }) => {
  const status = STATUS_CONFIG[exp.trang_thai] || STATUS_CONFIG.pending
  const canRun = exp.trang_thai === 'pending' || exp.trang_thai === 'failed' || exp.trang_thai === 'completed'

  return (
    <div className={`bg-surface-card border rounded-2xl p-5 transition-all hover:shadow-lg ${
      exp.trang_thai === 'running' ? 'border-brand-500/40 shadow-brand-500/10' : 'border-surface-border hover:border-brand-500/20'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-slate-200">{exp.ten_thu_nghiem}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
            {exp.trang_thai === 'running' && (
              <Spinner size="sm" />
            )}
          </div>
          {exp.mo_ta && <p className="text-xs text-slate-500 mb-3">{exp.mo_ta}</p>}

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 border border-violet-500/20 rounded-full text-xs">
              ✂️ {exp.chunking_strategy}
            </span>
            <span className="px-2 py-0.5 bg-sky-500/15 text-sky-400 border border-sky-500/20 rounded-full text-xs">
              🔢 {exp.embedding_model.split('/').pop()}
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">
              🤖 {exp.ai_model}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {exp.completed_at && (
            <p className="text-xs text-slate-600">
              {new Date(exp.completed_at).toLocaleDateString('vi-VN')}
            </p>
          )}
          <Button
            id={`run-exp-${exp.id}`}
            size="sm"
            variant={exp.trang_thai === 'completed' ? 'secondary' : 'primary'}
            onClick={onRun}
            disabled={!canRun || isRunning}
            loading={isRunning}
          >
            {exp.trang_thai === 'completed' ? '🔁 Chạy lại' : '▶ Chạy Benchmark'}
          </Button>
        </div>
      </div>

      {exp.trang_thai === 'running' && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Đang đánh giá các câu hỏi...</span>
            <span>Vui lòng chờ</span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExperimentsPage

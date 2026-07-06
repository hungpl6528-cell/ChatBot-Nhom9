import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

const features = [
  {
    icon: '🧠',
    title: 'RAG Pipeline',
    desc: 'Retrieval-Augmented Generation với ChromaDB — tìm kiếm vector ngữ nghĩa cực nhanh.',
  },
  {
    icon: '📊',
    title: 'Benchmarking',
    desc: 'So sánh Chunking Strategies và Embedding Models theo 4 tiêu chí RAGAS.',
  },
  {
    icon: '📁',
    title: 'Đa Định Dạng',
    desc: 'Hỗ trợ PDF và DOCX — tự động parse, chunk và nhúng vào vector DB.',
  },
  {
    icon: '🔬',
    title: 'Đánh Giá Tự Động',
    desc: 'Accuracy, Relevancy, Faithfulness, Latency đo lường tự động với RAGAS.',
  },
]

const stack = [
  { label: 'FastAPI', color: '#059669' },
  { label: 'LangChain', color: '#6366f1' },
  { label: 'ChromaDB', color: '#f59e0b' },
  { label: 'GPT-4o-mini', color: '#10b981' },
  { label: 'React', color: '#38bdf8' },
  { label: 'MySQL', color: '#f97316' },
]

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm text-brand-400 mb-6">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-slow" />
            Nhóm 9 — Đề Tài Nghiên Cứu RAG & Fine-Tuning
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="gradient-text">ChatBot Học Tập</span>
            <br />
            <span className="text-slate-300">Thông Minh với RAG</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hệ thống chatbot tích hợp <strong className="text-slate-300">Retrieval-Augmented Generation</strong> giúp
            sinh viên học tập hiệu quả hơn. Tự động đánh giá và so sánh các chiến lược RAG theo tiêu chuẩn RAGAS.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/chat">
              <Button size="lg" id="hero-chat-btn">
                🚀 Bắt Đầu Chat
              </Button>
            </Link>
            <Link to="/documents">
              <Button size="lg" variant="secondary" id="hero-docs-btn">
                📁 Upload Tài Liệu
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="ghost" id="hero-dashboard-btn">
                📊 Xem Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-8 border-y border-surface-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-slate-600 text-sm">Powered by:</span>
            {stack.map((s) => (
              <span
                key={s.label}
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  color: s.color,
                  borderColor: s.color + '30',
                  backgroundColor: s.color + '10',
                }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-4">
            Tính Năng Chính
          </h2>
          <p className="text-slate-500 text-center mb-12">
            Hệ thống đầy đủ từ ingestion đến benchmarking
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-surface-card border border-surface-border rounded-2xl p-6 hover:border-brand-500/40 transition-all hover:shadow-lg hover:shadow-brand-500/5 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-semibold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Questions */}
      <section className="py-16 px-6 bg-surface-card border-t border-surface-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">🔬 Research Questions</h2>
          <div className="space-y-4">
            <div className="border border-brand-500/20 bg-brand-500/5 rounded-xl p-4">
              <p className="font-semibold text-brand-300 mb-1">RQ Chính:</p>
              <p className="text-slate-300 text-sm">RAG hay fine-tuning hiệu quả hơn cho chatbot học tập tiếng Việt xét theo độ chính xác, chi phí và khả năng cập nhật kiến thức?</p>
            </div>
            <div className="border border-surface-border rounded-xl p-4">
              <p className="font-semibold text-slate-400 mb-1">RQ Phụ 1:</p>
              <p className="text-slate-400 text-sm">Chunking strategy nào (fixed-size, semantic, hierarchical) cho retrieval accuracy cao nhất với slide bài giảng PDF?</p>
            </div>
            <div className="border border-surface-border rounded-xl p-4">
              <p className="font-semibold text-slate-400 mb-1">RQ Phụ 2:</p>
              <p className="text-slate-400 text-sm">Embedding model nào (multilingual-e5, PhoBERT, OpenAI) phù hợp nhất cho tài liệu kỹ thuật tiếng Việt?</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { chatService, ChatResponse, ContextSource } from '../../services/chatService'
import { Button } from '../ui/Button'
import { Select, Badge, Spinner } from '../ui/index'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ContextSource[]
  response_time?: number
  model_used?: string
  isLoading?: boolean
}

interface ChatConfig {
  ai_model: string
  embedding_model: string
  chunking_strategy: string
  top_k: number
}

interface ChatWindowProps {
  documentIds?: number[]
}

const AI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-pro-latest', label: 'Gemini Pro Latest' },
]

const EMBEDDING_MODELS = [
  { value: 'models/gemini-embedding-2', label: 'Google gemini-embedding-2' },
  { value: 'multilingual-e5-base', label: 'multilingual-e5-base (Free)' },
  { value: 'BAAI/bge-m3', label: 'BAAI/bge-m3 (Free)' },
]

const CHUNKING_STRATEGIES = [
  { value: 'recursive', label: 'Recursive (Recommended)' },
  { value: 'fixed-size', label: 'Fixed-size' },
  { value: 'semantic', label: 'Semantic' },
]

const SESSION_ID = uuidv4()

export const ChatWindow: React.FC<ChatWindowProps> = ({ documentIds }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào! 🎓 Tôi là trợ lý học tập AI. Hãy upload tài liệu và đặt câu hỏi cho tôi nhé!\n\nTôi sẽ tìm kiếm thông tin từ tài liệu của bạn và trả lời dựa trên ngữ cảnh thực tế.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<ChatConfig>({
    ai_model: 'gemini-2.5-flash',
    embedding_model: 'models/gemini-embedding-2',
    chunking_strategy: 'recursive',
    top_k: 5,
  })
  const [selectedSource, setSelectedSource] = useState<ContextSource | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
    }
    const loadingMsg: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      isLoading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await chatService.sendMessage({
        question: text,
        session_id: SESSION_ID,
        document_ids: documentIds,
        ...config,
      })

      setMessages(prev =>
        prev.map(m =>
          m.isLoading
            ? {
                ...m,
                content: response.answer,
                sources: response.sources,
                response_time: response.response_time,
                model_used: response.model_used,
                isLoading: false,
              }
            : m
        )
      )
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.isLoading
            ? {
                ...m,
                content: `⚠️ Lỗi: ${err.response?.data?.detail || 'Không thể kết nối đến server. Đảm bảo backend đang chạy tại http://localhost:8000'}`,
                isLoading: false,
              }
            : m
        )
      )
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Cuộc trò chuyện đã được xóa. Hãy đặt câu hỏi mới! 🎓',
    }])
  }

  return (
    <div className="flex h-full gap-4">
      {/* Config Sidebar */}
      <aside className={clsx(
        'flex-shrink-0 flex flex-col gap-3 transition-all duration-300',
        sidebarCollapsed ? 'w-10' : 'w-60'
      )}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="self-end p-1.5 text-slate-500 hover:text-slate-300 hover:bg-surface-hover rounded-lg transition-all"
          title={sidebarCollapsed ? 'Mở cấu hình' : 'Đóng cấu hình'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>

        {!sidebarCollapsed && (
          <>
            {/* Config Panel */}
            <div className="bg-surface-card rounded-2xl border border-surface-border p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>⚙️</span> Cấu Hình
              </h3>
              <div className="flex flex-col gap-3">
                <Select
                  label="AI Model"
                  options={AI_MODELS}
                  value={config.ai_model}
                  onChange={e => setConfig(c => ({ ...c, ai_model: e.target.value }))}
                />
                <Select
                  label="Embedding Model"
                  options={EMBEDDING_MODELS}
                  value={config.embedding_model}
                  onChange={e => setConfig(c => ({ ...c, embedding_model: e.target.value }))}
                />
                <Select
                  label="Chunking Strategy"
                  options={CHUNKING_STRATEGIES}
                  value={config.chunking_strategy}
                  onChange={e => setConfig(c => ({ ...c, chunking_strategy: e.target.value }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">
                    Top-K Results: <span className="text-brand-400">{config.top_k}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={config.top_k}
                    onChange={e => setConfig(c => ({ ...c, top_k: Number(e.target.value) }))}
                    className="accent-brand-500 w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>1</span><span>15</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document filter info */}
            {documentIds && documentIds.length > 0 && (
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
                <p className="text-xs text-brand-400 font-medium mb-1">🔍 Lọc tài liệu</p>
                <p className="text-xs text-slate-500">
                  Đang tìm kiếm trong {documentIds.length} tài liệu được chọn
                </p>
              </div>
            )}

            {/* Context Viewer */}
            {selectedSource && (
              <div className="bg-surface-card rounded-2xl border border-brand-500/30 p-4 flex-1 overflow-y-auto animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-brand-400">📄 Nguồn Trích Dẫn</h4>
                  <button
                    onClick={() => setSelectedSource(null)}
                    className="text-slate-500 hover:text-slate-300 text-xs p-1 rounded hover:bg-surface-hover transition-all"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-2 truncate font-mono">{selectedSource.source_file}</p>
                <div className="text-xs text-slate-300 leading-relaxed bg-surface p-3 rounded-lg border border-surface-border max-h-48 overflow-y-auto">
                  {selectedSource.content}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="info">
                    Độ tương đồng: {(selectedSource.score * 100).toFixed(1)}%
                  </Badge>
                  {selectedSource.page && (
                    <Badge variant="default">Trang {selectedSource.page}</Badge>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-card rounded-2xl border border-surface-border overflow-hidden min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">
              {config.ai_model} · {config.embedding_model.split('/').pop()} · {config.chunking_strategy}
            </span>
          </div>
          <button
            id="clear-chat-btn"
            onClick={clearChat}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 rounded hover:bg-surface-hover"
          >
            🗑 Xóa chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSourceClick={setSelectedSource}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-surface-border flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                id="chat-input"
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Đặt câu hỏi về tài liệu học tập... (Enter để gửi, Shift+Enter xuống dòng)"
                className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none overflow-hidden"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <Button
              id="send-button"
              onClick={sendMessage}
              loading={loading}
              disabled={!input.trim()}
              className="flex-shrink-0 h-12"
              icon={
                !loading ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ) : undefined
              }
            >
              Gửi
            </Button>
          </div>
          <p className="text-xs text-slate-700 mt-2 text-right">
            Enter gửi · Shift+Enter xuống dòng
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Message Bubble ─────────────────────────────────────────────
const MessageBubble: React.FC<{
  message: Message
  onSourceClick: (src: ContextSource) => void
}> = ({ message, onSourceClick }) => {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold',
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-gradient-to-br from-violet-600 to-blue-600 text-white'
        )}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      <div className={clsx('flex flex-col gap-1.5 max-w-[78%]', isUser && 'items-end')}>
        {/* Bubble */}
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-600 text-white rounded-tr-sm'
              : 'bg-surface border border-surface-border text-slate-200 rounded-tl-sm'
          )}
        >
          {message.isLoading ? (
            <div className="typing-dots flex gap-1.5 items-center py-1">
              <span /><span /><span />
            </div>
          ) : (
            <div className={clsx(!isUser && 'prose-chat')}>{message.content}</div>
          )}
        </div>

        {/* Metadata row */}
        {!isUser && !message.isLoading && message.response_time !== undefined && (
          <div className="flex items-center gap-2 px-1 flex-wrap">
            <Badge variant="default">⏱ {message.response_time.toFixed(2)}s</Badge>
            {message.model_used && (
              <Badge variant="info">{message.model_used}</Badge>
            )}
          </div>
        )}

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            <span className="text-xs text-slate-600">Nguồn:</span>
            {message.sources.map((src, i) => (
              <button
                key={src.chunk_id}
                onClick={() => onSourceClick(src)}
                className="text-xs text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors hover:bg-brand-500/10 px-1 rounded"
              >
                [{i + 1}] {src.source_file.split('/').pop()?.split('\\').pop()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState, useCallback } from 'react'
import clsx from 'clsx'
import { chatService, SessionInfo } from '../../services/chatService'
import { Spinner } from '../ui/index'

interface ChatHistoryPanelProps {
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  refreshTrigger?: number  // increment to force re-fetch
}

function timeAgo(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  currentSessionId,
  onSelectSession,
  onNewChat,
  refreshTrigger,
}) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await chatService.getSessions()
      setSessions(data)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions, refreshTrigger])

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmDeleteId !== sessionId) {
      setConfirmDeleteId(sessionId)
      return
    }
    setDeletingId(sessionId)
    setConfirmDeleteId(null)
    try {
      await chatService.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      // If deleted current session, start a new one
      if (sessionId === currentSessionId) {
        onNewChat()
      }
    } catch {
      // silent fail
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>🕐</span> Lịch Sử Chat
        </h3>
        {loading && <Spinner size="sm" />}
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-full mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-brand-500/40 text-brand-400 hover:border-brand-500/70 hover:bg-brand-500/10 transition-all text-xs font-medium group"
      >
        <span className="text-base group-hover:scale-110 transition-transform">✦</span>
        Cuộc trò chuyện mới
      </button>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-0.5">
        {sessions.length === 0 && !loading && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-600">Chưa có lịch sử chat nào</p>
            <p className="text-xs text-slate-700 mt-1">Bắt đầu đặt câu hỏi!</p>
          </div>
        )}

        {sessions.map((session) => {
          const isActive = session.session_id === currentSessionId
          const isDeleting = deletingId === session.session_id
          const isConfirming = confirmDeleteId === session.session_id

          return (
            <div
              key={session.session_id}
              className={clsx(
                'group relative rounded-xl px-3 py-2.5 cursor-pointer transition-all border',
                'hover:bg-surface-hover',
                isActive
                  ? 'bg-brand-600/15 border-brand-500/30 shadow-sm shadow-brand-500/10'
                  : 'border-transparent hover:border-surface-border'
              )}
              onClick={() => {
                setConfirmDeleteId(null)
                onSelectSession(session.session_id)
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-400 rounded-r" />
              )}

              <div className="flex items-start gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'text-xs font-medium leading-relaxed line-clamp-2 pr-5',
                    isActive ? 'text-brand-300' : 'text-slate-300'
                  )}>
                    {session.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600">
                      {timeAgo(session.created_at)}
                    </span>
                    <span className="text-xs text-slate-700">·</span>
                    <span className="text-xs text-slate-600">
                      {session.total_questions} câu hỏi
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(session.session_id, e)}
                  disabled={isDeleting}
                  title={isConfirming ? 'Nhấn lần nữa để xác nhận' : 'Xóa phiên'}
                  className={clsx(
                    'flex-shrink-0 p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100',
                    isConfirming
                      ? 'opacity-100 text-red-400 bg-red-500/15 hover:bg-red-500/25'
                      : 'text-slate-600 hover:text-red-400 hover:bg-red-500/10'
                  )}
                >
                  {isDeleting ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : isConfirming ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

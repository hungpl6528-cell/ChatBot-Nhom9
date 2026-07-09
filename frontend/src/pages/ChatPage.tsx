import React, { useEffect, useState } from 'react'
import { ChatWindow } from '../components/chat/ChatWindow'
import { docService, Document } from '../services/docService'
import { Badge } from '../components/ui/index'

const ChatPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([])

  useEffect(() => {
    docService.listDocuments().then(data => {
      const ready = data.items.filter(d => d.trang_thai === 'ready')
      setDocuments(ready)
    }).catch(() => {})
  }, [])

  const toggleDoc = (id: number) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">💬 Chat Sandbox</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Đặt câu hỏi về tài liệu đã upload. Cấu hình model và chiến lược ở sidebar.
            </p>
          </div>
          {documents.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Lọc tài liệu:</span>
              {documents.slice(0, 4).map(doc => (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                    selectedDocIds.includes(doc.id)
                      ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                      : 'border-surface-border text-slate-500 hover:border-brand-500/30 hover:text-slate-300'
                  }`}
                >
                  {doc.ten_file.length > 20 ? doc.ten_file.substring(0, 20) + '…' : doc.ten_file}
                </button>
              ))}
              {documents.length > 4 && (
                <Badge variant="default">+{documents.length - 4} tài liệu</Badge>
              )}
              {selectedDocIds.length > 0 && (
                <button
                  onClick={() => setSelectedDocIds([])}
                  className="text-xs text-slate-600 hover:text-slate-400 underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* No documents warning */}
        {documents.length === 0 && (
          <div className="mt-3 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <span className="text-amber-400">⚠️</span>
            <p className="text-xs text-amber-400/80">
              Chưa có tài liệu nào sẵn sàng.{' '}
              <a href="/documents" className="underline hover:text-amber-300">Upload tài liệu</a>{' '}
              trước để chatbot có thể trả lời dựa trên ngữ cảnh.
            </p>
          </div>
        )}
      </div>

      {/* Chat Window - fill remaining height */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <ChatWindow documentIds={selectedDocIds.length > 0 ? selectedDocIds : undefined} />
      </div>
    </div>
  )
}

export default ChatPage

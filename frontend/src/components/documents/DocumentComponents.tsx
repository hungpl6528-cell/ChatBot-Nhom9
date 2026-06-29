import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { docService, Document } from '../../services/docService'
import { Badge, Select, Spinner } from '../ui/index'
import clsx from 'clsx'

// ── File Uploader ─────────────────────────────────────────────
interface FileUploaderProps {
  onUploadSuccess?: (result: { document_id: number; chunks_count: number }) => void
}

interface UploadState {
  file: File | null
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  message: string
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null, progress: 0, status: 'idle', message: '',
  })
  const [options, setOptions] = useState({
    mon_hoc: '',
    embedding_model: 'models/gemini-embedding-2',
    chunking_strategy: 'recursive',
  })
  const [showOptions, setShowOptions] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setUploadState({ file: accepted[0], progress: 0, status: 'idle', message: '' })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!uploadState.file) return
    setUploadState(s => ({ ...s, status: 'uploading', progress: 10, message: 'Đang tải lên...' }))

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadState(s => {
        if (s.progress >= 85) { clearInterval(progressInterval); return s }
        return { ...s, progress: s.progress + 15 }
      })
    }, 800)

    try {
      const result = await docService.uploadDocument(uploadState.file, {
        mon_hoc: options.mon_hoc || undefined,
        embedding_model: options.embedding_model,
        chunking_strategy: options.chunking_strategy,
      })
      clearInterval(progressInterval)
      setUploadState({
        file: null,
        progress: 100,
        status: 'success',
        message: `✅ Tải lên thành công! ${result.chunks_count} chunks đã được tạo và nhúng vào vector DB.`,
      })
      onUploadSuccess?.({ document_id: result.document_id, chunks_count: result.chunks_count })
      setTimeout(() => setUploadState({ file: null, progress: 0, status: 'idle', message: '' }), 4000)
    } catch (err: any) {
      clearInterval(progressInterval)
      setUploadState(s => ({
        ...s,
        status: 'error',
        progress: 0,
        message: `❌ Lỗi: ${err.response?.data?.detail || 'Không thể upload file'}`,
      }))
    }
  }

  const handleRemove = () => {
    setUploadState({ file: null, progress: 0, status: 'idle', message: '' })
  }

  const EMBEDDING_OPTIONS = [
    { value: 'models/gemini-embedding-2', label: 'Google gemini-embedding-2' },
    { value: 'multilingual-e5-base', label: 'multilingual-e5-base (Free)' },
    { value: 'BAAI/bge-m3', label: 'BAAI/bge-m3 (Free)' },
  ]

  const CHUNKING_OPTIONS = [
    { value: 'recursive', label: 'Recursive (Đề xuất)' },
    { value: 'fixed-size', label: 'Fixed-size' },
    { value: 'semantic', label: 'Semantic' },
  ]

  const isUploading = uploadState.status === 'uploading'

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        id="file-dropzone"
        className={clsx(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
          isDragActive
            ? 'border-brand-500 bg-brand-500/5 scale-[1.01]'
            : uploadState.file
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-surface-border hover:border-brand-500/50 hover:bg-brand-500/5',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} id="file-input" />
        {uploadState.file ? (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <p className="font-semibold text-slate-200">{uploadState.file.name}</p>
            <p className="text-sm text-slate-500">
              {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`text-5xl transition-transform ${isDragActive ? 'scale-110' : ''}`}>
              {isDragActive ? '📥' : '☁️'}
            </div>
            <div>
              <p className="font-semibold text-slate-300">
                {isDragActive ? 'Thả file vào đây!' : 'Kéo thả file hoặc click để chọn'}
              </p>
              <p className="text-sm text-slate-500 mt-1">Hỗ trợ PDF, DOCX · Tối đa 50MB</p>
            </div>
          </div>
        )}
      </div>

      {/* File rejection errors */}
      {fileRejections.length > 0 && (
        <p className="text-sm text-red-400 text-center">
          ⚠️ {fileRejections[0].errors[0].message}
        </p>
      )}

      {/* Options Toggle */}
      {uploadState.file && !isUploading && (
        <>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-1 mx-auto"
          >
            <span>{showOptions ? '▲' : '▼'}</span>
            {showOptions ? 'Ẩn tùy chọn nâng cao' : 'Hiện tùy chọn nâng cao'}
          </button>

          {showOptions && (
            <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3 animate-fade-in">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Môn học / Chủ đề</label>
                <input
                  id="mon-hoc-input"
                  type="text"
                  placeholder="VD: Trí Tuệ Nhân Tạo, Cơ Sở Dữ Liệu..."
                  value={options.mon_hoc}
                  onChange={e => setOptions(o => ({ ...o, mon_hoc: e.target.value }))}
                  className="w-full bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  id="upload-embedding"
                  label="Embedding Model"
                  options={EMBEDDING_OPTIONS}
                  value={options.embedding_model}
                  onChange={e => setOptions(o => ({ ...o, embedding_model: e.target.value }))}
                />
                <Select
                  id="upload-chunking"
                  label="Chunking Strategy"
                  options={CHUNKING_OPTIONS}
                  value={options.chunking_strategy}
                  onChange={e => setOptions(o => ({ ...o, chunking_strategy: e.target.value }))}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Đang xử lý...</span>
            <span>{uploadState.progress}%</span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">{uploadState.message}</p>
        </div>
      )}

      {/* Result Message */}
      {uploadState.message && !isUploading && (
        <div className={clsx(
          'rounded-xl p-4 text-sm border',
          uploadState.status === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        )}>
          {uploadState.message}
        </div>
      )}

      {/* Action Buttons */}
      {uploadState.file && !isUploading && uploadState.status !== 'success' && (
        <div className="flex gap-3">
          <button
            id="upload-submit"
            onClick={handleUpload}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-brand-500/20"
          >
            🚀 Upload & Xử Lý
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-3 border border-surface-border text-slate-400 hover:text-slate-200 rounded-xl text-sm transition-all"
          >
            ✕ Xóa
          </button>
        </div>
      )}
    </div>
  )
}

// ── Document List ─────────────────────────────────────────────
interface DocumentListProps {
  documents: Document[]
  loading: boolean
  onRefresh?: () => void
  onDelete?: (id: number) => void
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  ready: { label: '✅ Sẵn sàng', variant: 'success' },
  processing: { label: '⏳ Đang xử lý', variant: 'info' },
  pending: { label: '🕐 Chờ xử lý', variant: 'warning' },
  error: { label: '❌ Lỗi', variant: 'error' },
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, loading, onRefresh, onDelete }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-5xl mb-4">📂</div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Chưa có tài liệu nào</h3>
        <p className="text-slate-500 text-sm">Upload tài liệu PDF/DOCX để bắt đầu sử dụng chatbot.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => {
        const status = STATUS_MAP[doc.trang_thai] || STATUS_MAP.pending
        const ext = doc.ten_file.split('.').pop()?.toLowerCase() || 'pdf'
        return (
          <div
            key={doc.id}
            className="flex items-center gap-4 p-4 bg-surface border border-surface-border rounded-xl hover:border-brand-500/20 transition-all group"
          >
            {/* File Icon */}
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0',
              ext === 'pdf' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
            )}>
              {ext === 'pdf' ? '📕' : '📘'}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200 text-sm truncate">{doc.ten_file}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {doc.mon_hoc && (
                  <span className="text-xs text-slate-500">📚 {doc.mon_hoc}</span>
                )}
                {doc.so_chunks > 0 && (
                  <span className="text-xs text-slate-500">✂️ {doc.so_chunks} chunks</span>
                )}
                {doc.embedding_model && (
                  <span className="text-xs text-slate-600 truncate max-w-[150px]">
                    🔢 {doc.embedding_model}
                  </span>
                )}
                <span className="text-xs text-slate-600">
                  {new Date(doc.ngay_upload).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant={status.variant}>{status.label}</Badge>
              {doc.trang_thai === 'processing' && <Spinner size="sm" />}
              {onDelete && (
                <button
                  id={`delete-doc-${doc.id}`}
                  onClick={() => onDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Xóa tài liệu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

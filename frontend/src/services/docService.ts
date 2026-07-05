import api from './api'

export interface Document {
  id: number
  user_id: number
  ten_file: string
  mon_hoc: string | null
  trang_thai: 'pending' | 'processing' | 'ready' | 'error'
  so_chunks: number
  embedding_model: string | null
  ngay_upload: string
}

export interface DocumentListResponse {
  total: number
  items: Document[]
}

export interface UploadResult {
  message: string
  document_id: number
  chunks_count: number
  embedding_model: string
  chunking_strategy: string
}

export const docService = {
  listDocuments: () =>
    api.get<DocumentListResponse>('/documents/').then((r) => r.data),

  getDocument: (id: number) =>
    api.get<Document>(`/documents/${id}`).then((r) => r.data),

  uploadDocument: (
    file: File,
    options?: {
      mon_hoc?: string
      embedding_model?: string
      chunking_strategy?: string
    }
  ) => {
    const form = new FormData()
    form.append('file', file)
    if (options?.mon_hoc) form.append('mon_hoc', options.mon_hoc)
    if (options?.embedding_model) form.append('embedding_model', options.embedding_model)
    if (options?.chunking_strategy) form.append('chunking_strategy', options.chunking_strategy)

    return api
      .post<UploadResult>('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300_000, // 5 min for large files
      })
      .then((r) => r.data)
  },

  deleteDocument: (id: number) =>
    api.delete(`/documents/${id}`).then((r) => r.data),
}

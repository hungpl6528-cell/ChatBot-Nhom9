import api from './api'

export interface ChatRequest {
  question: string
  session_id: string
  user_id?: number
  ai_model?: string
  embedding_model?: string
  chunking_strategy?: string
  top_k?: number
  document_ids?: number[]
}

export interface ContextSource {
  chunk_id: string
  content: string
  source_file: string
  page?: number
  score: number
}

export interface ChatResponse {
  answer_id: number
  question_id: number
  answer: string
  response_time: number
  sources: ContextSource[]
  model_used: string
  embedding_model: string
  chunking_strategy: string
}

export interface HistoryMessage {
  id: number
  question: string
  created_at: string
  answers: Array<{
    id: number
    answer: string
    response_time: number
    model_used: string | null
    created_at: string
  }>
}

export const chatService = {
  sendMessage: (payload: ChatRequest) =>
    api.post<ChatResponse>('/chat/', payload).then((r) => r.data),

  getHistory: (sessionId: string) =>
    api.get<HistoryMessage[]>(`/chat/history/${sessionId}`).then((r) => r.data),
}

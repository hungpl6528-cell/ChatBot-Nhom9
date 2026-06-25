import api from './api'

export interface Experiment {
  id: number
  ten_thu_nghiem: string
  mo_ta: string | null
  chunking_strategy: string
  embedding_model: string
  ai_model: string
  trang_thai: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
}

export interface ExperimentCreate {
  ten_thu_nghiem: string
  mo_ta?: string
  chunking_strategy: 'fixed-size' | 'semantic' | 'recursive'
  embedding_model: string
  ai_model?: string
  user_id?: number
}

export interface Evaluation {
  id: number
  experiment_id: number
  answer_id: number | null
  accuracy: number | null
  relevancy: number | null
  faithfulness: number | null
  latency: number | null
  overall_score: number | null
  created_at: string
}

export interface DashboardStats {
  total_documents: number
  total_questions: number
  avg_response_time: number
  avg_accuracy: number
  avg_relevancy: number
  avg_faithfulness: number
}

export interface ComparisonItem {
  experiment_id: number
  ten_thu_nghiem: string
  chunking_strategy: string
  embedding_model: string
  avg_accuracy: number
  avg_relevancy: number
  avg_faithfulness: number
  avg_latency: number
  avg_overall: number
}

export const experimentService = {
  createExperiment: (payload: ExperimentCreate) =>
    api.post<Experiment>('/experiments/', payload).then((r) => r.data),

  listExperiments: () =>
    api.get<Experiment[]>('/experiments/').then((r) => r.data),

  getExperiment: (id: number) =>
    api.get<Experiment>(`/experiments/${id}`).then((r) => r.data),

  runExperiment: (id: number, maxQuestions = 20) =>
    api
      .post<{ message: string; experiment_id: number; status: string }>(
        `/experiments/${id}/run?max_questions=${maxQuestions}`
      )
      .then((r) => r.data),

  getEvaluations: (id: number) =>
    api.get<Evaluation[]>(`/experiments/${id}/evaluations`).then((r) => r.data),

  getDashboardStats: () =>
    api.get<DashboardStats>('/reports/dashboard').then((r) => r.data),

  getComparison: () =>
    api.get<ComparisonItem[]>('/reports/comparison').then((r) => r.data),
}

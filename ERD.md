# ERD - Hệ Thống Chatbot Học Tập Tích Hợp RAG & Fine-Tuning
*(Benchmark Chunking Strategy & Embedding Model)*

## USERS
| Field | Type |
|---------|---------|
| user_id (PK) | UUID |
| full_name | VARCHAR(100) |
| email | VARCHAR(100) |
| role | VARCHAR(50) |
| created_at | DATETIME |

## AI_MODELS
| Field | Type |
|---------|---------|
| model_id (PK) | UUID |
| model_name | VARCHAR(100) |
| created_at | DATETIME |

## EMBEDDING_MODELS
| Field | Type |
|---------|---------|
| embedding_id (PK) | UUID |
| embedding_name | VARCHAR(100) |

## CHUNKING_STRATEGIES
| Field | Type |
|---------|---------|
| chunking_id (PK) | UUID |
| strategy_name | VARCHAR(100) |

## DOCUMENTS
| Field | Type |
|---------|---------|
| document_id (PK) | UUID |
| title | VARCHAR(255) |
| uploaded_at | DATETIME |

## DOCUMENT_CHUNKS
| Field | Type |
|---------|---------|
| chunk_id (PK) | UUID |
| document_id (FK) | UUID |

## EXPERIMENTS
| Field | Type |
|---------|---------|
| experiment_id (PK) | UUID |
| model_id (FK) | UUID |
| embedding_id (FK) | UUID |
| chunking_id (FK) | UUID |
| experiment_name | VARCHAR(255) |
| description | TEXT |
| created_by (FK) | UUID |
| created_at | DATETIME |

## QUESTIONS
| Field | Type |
|---------|---------|
| question_id (PK) | UUID |
| user_id (FK) | UUID |
| question_text | TEXT |
| subject | VARCHAR(100) |
| created_at | DATETIME |

## ANSWERS
| Field | Type |
|---------|---------|
| answer_id (PK) | UUID |
| question_id (FK) | UUID |
| experiment_id (FK) | UUID |
| answer_text | TEXT |
| response_time | FLOAT |
| created_at | DATETIME |

## EVALUATIONS
| Field | Type |
|---------|---------|
| evaluation_id (PK) | UUID |
| answer_id (FK) | UUID |
| accuracy_score | FLOAT |
| relevancy_score | FLOAT |
| faithfulness_score | FLOAT |
| latency_score | FLOAT |
| overall_score | FLOAT |
| created_at | DATETIME |

## REPORTS
| Field | Type |
|---------|---------|
| report_id (PK) | UUID |
| report_name | VARCHAR(255) |
| created_at | DATETIME |

## Luồng hoạt động chính (RAG)

Documents → Chunking → Embedding → Vector DB (Chunks)

Question → Retrieval → LLM (Model) → Answer

Answer → Evaluation → Dashboard / Reports

## Ký hiệu

- **PK**: Primary Key
- **FK**: Foreign Key
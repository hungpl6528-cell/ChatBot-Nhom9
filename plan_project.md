# Kế Hoạch Triển Khai Chi Tiết Hệ Thống ChatBot (Nhóm 9)

Tài liệu này chi tiết hóa kiến trúc, framework và kế hoạch triển khai của cả hai hệ thống **Backend (BE)** và **Frontend (FE)** cho hệ thống Chatbot Học Tập tích hợp RAG & Fine-Tuning.

---

## 1. Kiến Trúc Hệ Thống Tổng Quan

Hệ thống được thiết kế theo mô hình client-server hiện đại:

- **Frontend (FE):** Xây dựng bằng **React.js**, cung cấp giao diện tương tác thời gian thực, quản lý tài liệu và các bảng phân tích kết quả thử nghiệm (dashboard).
- **Backend (BE):** **FastAPI (Python)** tổ chức theo **Clean Architecture** để phân tách rõ ràng trách nhiệm giữa các layer, dễ mở rộng và viết unit test.
- **Cơ sở dữ liệu (Database):**
  - **Relational DB (MySQL):** Quản lý người dùng, tài liệu tải lên, danh mục các model, chiến lược chunking, cấu hình thử nghiệm (experiments), các câu hỏi/câu trả lời và kết quả đánh giá (evaluations).
  - **Vector DB (ChromaDB):** Lưu trữ các chunk văn bản cùng vector embedding tương ứng để phục vụ quá trình tìm kiếm ngữ cảnh (Retrieval).

---

## 2. Framework & Thư Viện Sử Dụng

### 2.1 Backend

| Framework / Thư viện | Dùng để làm gì |
|---|---|
| **FastAPI** | Web framework chính |
| **SQLAlchemy** | ORM kết nối MySQL |
| **Pydantic** | Validate dữ liệu đầu vào |
| **LangChain** | Xử lý RAG pipeline |
| **ChromaDB** | Vector database lưu embeddings |
| **PyPDF / python-docx** | Đọc file PDF, DOCX |
| **RAGAS** | Đánh giá benchmark RAG |
| **sentence-transformers** | Chạy embedding model miễn phí (multilingual-e5, PhoBERT, bge-m3) |
| **OpenAI SDK** | Gọi GPT-4o-mini + text-embedding-3-small |
| **python-dotenv** | Đọc biến môi trường từ file `.env` |
| **uvicorn** | Chạy server FastAPI |

### 2.2 Frontend

| Framework / Thư viện | Dùng để làm gì |
|---|---|
| **React.js** | Framework UI chính |
| **React Router** | Điều hướng giữa các trang |
| **Axios** | Gọi API từ FE xuống BE |
| **Tailwind CSS** | Styling nhanh, responsive |
| **Recharts** | Vẽ biểu đồ dashboard (Line Chart, Bar Chart) |

### 2.3 Database

| Tool | Dùng để làm gì |
|---|---|
| **MySQL** | Lưu users, documents, questions, answers, evaluations |
| **ChromaDB** | Lưu vector embeddings và metadata chunks |
| **MySQL Workbench** | Quản lý và truy vấn DB trực quan |

### 2.4 Công Cụ & DevOps

| Tool | Dùng để làm gì |
|---|---|
| **Git + GitHub** | Quản lý source code, branching |
| **Jira** | Quản lý task, sprint |
| **Postman** | Test API backend |

---

## 3. Triển Khai Backend (BE) - FastAPI & Clean Architecture

### 3.1 Cấu Trúc Thư Mục

```
backend/
├── app/
│   ├── domain/               # Lớp thực thể (Entities & DB Schema)
│   │   ├── models.py         # SQLAlchemy models ánh xạ từ ERD.md
│   │   └── schemas.py        # Pydantic schemas cho validation dữ liệu
│   ├── use_cases/            # Lớp logic nghiệp vụ chính (Business Logic)
│   │   ├── ingestion.py      # Xử lý cắt tài liệu (Chunking) & nhúng (Embedding)
│   │   ├── chat.py           # Quản lý luồng RAG: Retrieval -> Prompt -> LLM -> Trả lời
│   │   ├── evaluation.py     # Tính toán chỉ số đánh giá (accuracy, relevancy, latency...)
│   │   └── benchmark.py      # Chạy so sánh hiệu năng giữa các chiến lược
│   ├── repositories/         # Lớp giao tiếp với DB & Vector DB (Data Access)
│   │   ├── mysql_repo.py     # CRUD trên MySQL (Users, Experiments, Answers...)
│   │   └── vector_repo.py    # Thêm/Truy vấn trên ChromaDB
│   └── api/                  # Lớp Interface Adapter (FastAPI Routers)
│       ├── v1/
│       │   ├── users.py      # API quản lý user
│       │   ├── documents.py  # API upload/list tài liệu
│       │   ├── chat.py       # API chat & sandbox
│       │   ├── experiments.py# API quản lý và chạy thử nghiệm
│       │   └── reports.py    # API truy xuất báo cáo/thống kê
│       └── main.py           # Khởi tạo ứng dụng FastAPI và CORS middleware
├── requirements.txt          # Các thư viện phụ thuộc (FastAPI, PyPDF, langchain, etc.)
└── .env                      # File cấu hình môi trường (DB Connection, OpenAI keys, Jira token)
```

### 3.2 Luồng Logic Nghiệp Vụ RAG & Benchmarking

**1. Document Ingestion (Nạp tài liệu):**
- Đọc tệp PDF/DOCX → Cắt nhỏ tài liệu dựa trên `CHUNKING_STRATEGIES` được chọn (Fixed-size, Semantic, Recursive).
- Sử dụng `EMBEDDING_MODELS` tương ứng để tạo vector.
- Lưu thông tin tài liệu vào MySQL và lưu các vector chunk vào ChromaDB với metadata liên kết `document_id`.
**2. Quy Trình Trả Lời RAG (Chat):**
- Nhận câu hỏi từ User → Truy vấn ChromaDB để lấy các chunks có độ tương đồng cao nhất (Cosine/Euclidean).
- Xây dựng prompt chứa ngữ cảnh (context) và lịch sử chat → Gửi đến LLM (`AI_MODELS` được chọn).
- Lưu câu hỏi (`QUESTIONS`) và câu trả lời (`ANSWERS`) kèm thời gian phản hồi (`response_time`) vào MySQL.

**3. Đánh Giá & Benchmarking (RAGAS):**
- Đánh giá câu trả lời dựa trên 4 tiêu chí chính:
  - `accuracy_score` — Độ chính xác
  - `relevancy_score` — Mức độ liên quan của câu trả lời với câu hỏi
  - `faithfulness_score` — Độ trung thực (câu trả lời có khớp với ngữ cảnh không)
  - `latency_score` — Độ trễ phản hồi
- Lưu trữ kết quả đánh giá vào bảng `EVALUATIONS` để vẽ biểu đồ so sánh.

### 3.3 Phân Công Backend (3 người)

| Người | Phụ trách | Branch |
|---|---|---|
| **Người 1** | `domain/`, `repositories/` — DB schema, MySQL, ChromaDB | `feature/be-domain` |
| **Người 2** | `use_cases/ingestion.py`, `use_cases/chat.py`, `api/v1/documents.py`, `api/v1/chat.py` | `feature/be-rag` |
| **Người 3** | `use_cases/evaluation.py`, `use_cases/benchmark.py`, `api/v1/experiments.py`, `api/v1/reports.py`, `api/main.py` | `feature/be-benchmark` |

> ⚠️ Người 1 làm xong trước — Người 2 và 3 phụ thuộc vào phần này.

---

## 4. Triển Khai Frontend (FE) - React.js

### 4.1 Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── app/                  # Các page chính trong hệ thống
│   │   ├── layout.tsx        # Layout chung (Sidebar, Navbar)
│   │   ├── page.tsx          # Trang chủ / Giới thiệu tổng quan
│   │   ├── chat/             # Trang Chat Sandbox (Tương tác chatbot)
│   │   │   └── page.tsx
│   │   ├── documents/        # Trang Quản lý tài liệu (Upload & List)
│   │   │   └── page.tsx
│   │   ├── experiments/      # Trang Cấu hình & Chạy thử nghiệm
│   │   │   └── page.tsx
│   │   └── dashboard/        # Báo cáo, so sánh hiệu năng (Charts & Analytics)
│   │       └── page.tsx
│   ├── components/           # Các component dùng chung và có thể tái sử dụng
│   │   ├── ui/               # Component nguyên tử (Button, Input, Card, Modal, Select)
│   │   ├── chat/             # ChatWindow, MessageBubble, ContextViewer
│   │   ├── documents/        # FileUploader, DocumentList
│   │   └── dashboard/        # MetricCard, PerformanceChart (sử dụng Chart.js hoặc Recharts)
│   ├── services/             # Lớp gọi API gọi xuống BE (Sử dụng Fetch/Axios)
│   │   ├── api.ts            # Client cấu hình Axios chung
│   │   ├── chatService.ts
│   │   └── docService.ts
│   └── styles/               # CSS styling tùy biến (Sử dụng Vanilla CSS hoặc Tailwind CSS)
│       └── globals.css
├── package.json
└── tailwind.config.js        # Cấu hình Tailwind (nếu sử dụng)
```

### 4.2 Giao Diện Các Trang

**Trang Chat Sandbox:**
- Sidebar cấu hình nhanh: chọn AI Model, Embedding Model, Chunking Strategy.
- Giao diện chat có bubble phân biệt User và AI.
- Khu vực hiển thị **Context Sources** — các đoạn tài liệu được trích xuất từ ChromaDB.

**Trang Dashboard & Analytics:**
- KPI Cards: Tổng số tài liệu, Tổng số câu hỏi, Thời gian phản hồi trung bình, Điểm đánh giá trung bình.
- Line Chart: So sánh Latency giữa các Model/Embedding.
- Bar Chart: So sánh Accuracy, Relevancy, Faithfulness giữa các chiến lược Chunking.

**Trang Document Manager:**
- Vùng kéo thả file (Drag & Drop).
- Progress bar hiển thị tiến trình upload.
- Danh sách tài liệu kèm trạng thái: Đang xử lý / Đã sẵn sàng.

### 4.3 Phân Công Frontend (2 người)

| Người | Phụ trách | Branch |
|---|---|---|
| **Người 4** | Layout, trang Chat, trang Documents, `components/ui/`, `services/` | `feature/fe-chat-docs` |
| **Người 5** | Trang Experiments, trang Dashboard, `components/dashboard/` | `feature/fe-dashboard` |

> ⚠️ Người 4 làm `services/api.ts` xong trước — Người 5 import vào dùng. Người 5 dùng mock data trước khi BE benchmark hoàn thành.

---

## 5. Cơ Sở Dữ Liệu

### MySQL — Dữ liệu có cấu trúc

| Bảng | Lưu gì |
|---|---|
| `users` | id, tên, email, mật khẩu |
| `documents` | id, tên file, môn học, trạng thái, ngày upload |
| `questions` | id, nội dung câu hỏi, session_id |
| `answers` | id, nội dung trả lời, response_time, question_id |
| `experiments` | id, tên thử nghiệm, chunking strategy, embedding model |
| `evaluations` | id, accuracy, relevancy, faithfulness, latency, experiment_id |

### ChromaDB — Vector Embeddings

- Nội dung từng chunk tài liệu
- Vector embedding tương ứng
- Metadata: `document_id`, tên file, số trang

---

## 6. Kế Hoạch Phân Công Tổng Thể (7 người)

| Người | Vai trò | Công việc chính |
|---|---|---|
| **HIỂN ĐẠT** | BE - Database | Khởi tạo DB schema, MySQL, ChromaDB, cấu trúc project |
| **LIÊN HƯNG** | BE - RAG Core | Luồng RAG: ingestion, chat, API upload, API chat |
| **NINH DANH** | BE - Benchmark | Evaluation, benchmark, API experiments, reports |
| **VĂN KHÁNH** | FE - Chat & Docs | Layout, trang Chat, trang Documents, services API |
| **HOÀNG DŨNG** | FE - Dashboard | Trang Experiments, Dashboard, biểu đồ Recharts |
| **THÀNH ĐẠT** | QA & Báo cáo | Kiểm thử hiệu năng, tối ưu, viết báo cáo cuối kỳ |
| **KIỀU TRINH** | Nghiên cứu | So sánh RAG vs Fine-tuning, kết luận RQ chính và RQ phụ |

---

## 7. Quy Tắc Quản Lý Git

- Không commit/push trực tiếp vào nhánh `main`.
- Luồng: `feature/...` → PR → review → merge vào `develop` → merge vào `main`.
- Format commit message:
  - `feat(be): add document upload endpoint`
  - `fix(fe): fix layout responsive on chat page`
  - `docs: update README`

### Cấu trúc Branch

```
main
└── develop
    ├── feature/be-domain
    ├── feature/be-rag
    ├── feature/be-benchmark
    ├── feature/fe-chat-docs
    └── feature/fe-dashboard
```

---

## 8. Quản Lý Công Việc trên Jira

- Tạo **Epic** cho từng phần: Backend, Frontend, Database, Nghiên cứu.
- Mỗi Epic chia thành **Tasks** → **Sub-tasks** tương ứng công việc từng người.
- Cập nhật trạng thái liên tục: `To Do` → `In Progress` → `Done`.

---

## 9. Test Set & Benchmark

- **50+ câu hỏi + ground truth** lưu tại `docs/testset/testset.json`.
- Format JSON: `id`, `question`, `ground_truth`, `category`.
- Dùng thư viện **RAGAS** để tự động đánh giá chatbot theo các chỉ số: accuracy, relevancy, faithfulness, latency.

### Embedding Models So Sánh

| Model | Loại | Chi phí |
|---|---|---|
| `multilingual-e5-base` | Hugging Face | Miễn phí |
| `text-embedding-3-small` | OpenAI | Trả phí |
| `PhoBERT-base` | Tiếng Việt | Miễn phí |
| `bge-m3` | BAAI | Miễn phí |

---

## 10. Research Questions

**RQ Chính:** RAG hay fine-tuning hiệu quả hơn cho chatbot hỗ trợ học tập với tài liệu tiếng Việt, xét theo độ chính xác, chi phí triển khai và khả năng cập nhật kiến thức?

**RQ Phụ 1:** Chunking strategy nào (fixed-size, semantic, hierarchical) cho retrieval accuracy cao nhất với slide bài giảng PDF?

**RQ Phụ 2:** Embedding model nào (multilingual-e5, PhoBERT, OpenAI) phù hợp nhất cho tài liệu kỹ thuật tiếng Việt?
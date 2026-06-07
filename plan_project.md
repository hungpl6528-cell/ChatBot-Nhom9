# Kế Hoạch Triển Khai Chi Tiết Hệ Thống ChatBot (Nhóm 9)

Tài liệu này chi tiết hóa kiến trúc và kế hoạch triển khai của cả hai hệ thống **Backend (BE)** và **Frontend (FE)** cho hệ thống Chatbot Học Tập tích hợp RAG & Fine-Tuning.

---

## 1. Kiến Trúc Hệ Thống Tổng Quan
Hệ thống được thiết kế theo mô hình client-server hiện đại:
- **Frontend (FE):** Xây dựng bằng React.js / Next.js (App Router), cung cấp giao diện tương tác thời gian thực, quản lý tài liệu và các bảng phân tích kết quả thử nghiệm (dashboard).
- **Backend (BE):** FastAPI (Python) tổ chức theo **Clean Architecture** (Kiến trúc sạch) để phân tách rõ ràng trách nhiệm giữa các layer, dễ mở rộng và viết unit test.
- **Cơ sở dữ liệu (Database):**
  - **Relational DB (MySQL):** Quản lý người dùng, tài liệu tải lên, danh mục các model, chiến lược chunking, cấu hình thử nghiệm (experiments), các câu hỏi/câu trả lời và kết quả đánh giá (evaluations).
  - **Vector DB (ChromaDB):** Lưu trữ các chunk văn bản cùng vector embedding tương ứng để phục vụ quá trình tìm kiếm ngữ cảnh (Retrieval).

---

## 2. Triển Khai Backend (BE) - FastAPI & Clean Architecture

### 2.1 Cấu Trúc Thư Mục Clean Architecture
Thư mục `/backend` sẽ được tổ chức như sau:
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
└── config.env                # File cấu hình môi trường (DB Connection, OpenAI keys, Jira token)
```

### 2.2 Luồng Logic Nghiệp Vụ RAG & Benchmarking
1. **Document Ingestion (Nạp tài liệu):**
   - Đọc tệp PDF/DOCX -> Cắt nhỏ tài liệu dựa trên `CHUNKING_STRATEGIES` được chọn (ví dụ: Fixed-size, Semantic, Recursive).
   - Sử dụng `EMBEDDING_MODELS` tương ứng để tạo vector.
   - Lưu thông tin tài liệu vào MySQL và lưu các vector chunk vào ChromaDB với metadata liên kết `document_id`.
2. **Quy Trình Trả Lời RAG (Chat):**
   - Nhận câu hỏi từ User -> Truy vấn ChromaDB để lấy các chunks có độ tương đồng cao nhất (Cosine/Euclidean).
   - Xây dựng prompt chứa ngữ cảnh (context) và lịch sử chat -> Gửi đến LLM (`AI_MODELS` được chọn).
   - Lưu câu hỏi (`QUESTIONS`) và câu trả lời (`ANSWERS`) kèm thời gian phản hồi (`response_time`) vào MySQL.
3. **Đánh Giá & Benchmarking:**
   - Đánh giá câu trả lời dựa trên 4 tiêu chí chính:
     - `accuracy_score` (Độ chính xác)
     - `relevancy_score` (Mức độ liên quan của câu trả lời với câu hỏi)
     - `faithfulness_score` (Độ trung thực - câu trả lời có khớp với ngữ cảnh không)
     - `latency_score` (Độ trễ)
   - Lưu trữ kết quả đánh giá vào bảng `EVALUATIONS` để vẽ biểu đồ so sánh.

---

## 3. Triển Khai Frontend (FE) - Next.js & Components

### 3.1 Cấu Trúc Thư Mục Hướng Hợp Phần (Component-Driven)
Thư mục `/frontend` sẽ được tổ chức theo cấu trúc Next.js App Router:
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

### 3.2 Giao Diện Trực Quan & Premium
Giao diện sẽ được thiết kế hiện đại, responsive và trực quan hóa dữ liệu hiệu quả:
- **Trang Chat Sandbox:**
  - Sidebar cho phép cấu hình nhanh: Chọn AI Model (GPT-4o-mini, Llama3, ...), chọn Embedding Model và Chunking Strategy.
  - Giao diện chat có bubble phân biệt User và AI.
  - Khu vực hiển thị **Context Sources** (các đoạn tài liệu được trích xuất từ ChromaDB làm dữ liệu đầu vào cho AI) để kiểm chứng tính chính xác của RAG.
- **Trang Dashboard & Analytics:**
  - Hiển thị các chỉ số tổng quan dưới dạng thẻ (KPI Cards): Tổng số tài liệu, Tổng số câu hỏi, Thời gian phản hồi trung bình, Điểm đánh giá trung bình.
  - Biểu đồ đường (Line Chart) so sánh **Latency** của các Model/Embedding khác nhau.
  - Biểu đồ cột (Bar Chart) so sánh **Độ chính xác (Accuracy, Relevancy, Faithfulness)** của các chiến lược Chunking khác nhau.
- **Trang Document Manager:**
  - Vùng kéo thả file (Drag & Drop) thông minh.
  - Tiến trình tải lên (Progress bar) và hiển thị danh sách các tài liệu hiện có trong hệ thống kèm trạng thái (Đang xử lý / Đã sẵn sàng).

---

## 4. Cơ Sở Dữ Liệu & Quy Trình Khớp Nối (MySQL Integration)
Dựa trên `ERD.md`, các bảng cơ sở dữ liệu sẽ được khởi tạo trong MySQL và đồng bộ với ORM (SQLAlchemy) ở Backend:
1. Khi có kết quả từ các cuộc hội thoại, dữ liệu của câu hỏi (`QUESTIONS`) và câu trả lời (`ANSWERS`) sẽ được tự động ghi nhận vào MySQL.
2. Một module chạy ngầm (Background Worker) hoặc API Endpoint sẽ thực hiện việc đánh giá (`EVALUATIONS`) và lưu điểm số tương ứng để làm dữ liệu đầu vào cho `REPORTS`.

---

## 5. Kế Hoạch Phân Phối Công Việc & Checklist (`checklist.md`)
Các nhiệm vụ sẽ được chia nhỏ và đưa vào [checklist.md](file:///c:/B%C3%81O%20C%C3%81O%20NH%C3%93M/ChatBot-Nhom9/ChatBot-Nhom9/checklist.md) để cập nhật liên tục:
- **Người 1: Khởi tạo Cơ sở dữ liệu và Cấu trúc dự án (BE & FE Structure)**
- **Người 2: Triển khai luồng RAG cơ bản ở Backend (FastAPI + ChromaDB + OpenAI)**
- **Người 3: Thiết lập các Use Case đánh giá và Benchmarking trên Backend**
- **Người 4: Thiết kế Giao diện người dùng trên Frontend (Next.js)**
- **Người 5: Kết nối API (BE-FE Integration) & Triển khai Dashboard trực quan hóa**
- **Người 6: Kiểm thử hiệu năng, tối ưu hóa và làm báo cáo cuối kỳ**
- **Người 7: Kết Luận , đánh giá và so sánh giữa RAG và fine-tunning**
---

## 6. Quy Tắc Quản Lý Dự Án & Git
- **Quản lý Git:**
  - Không được commit/push trực tiếp vào nhánh `main`.
  - Tạo các nhánh tính năng, ví dụ: `feature/be-setup`, `feature/fe-chat-interface`.
  - Tạo Pull Request (PR) và review kỹ lưỡng trước khi merge vào nhánh phát triển `dev`, sau đó mới chuyển lên `main`.
  - Commit message cần tuân thủ định dạng rõ ràng (ví dụ: `feat(be): add document upload endpoint` hoặc `fix(fe): fix layout responsive on chat page`).
- **Quản lý công việc trên Jira:**
  - Sử dụng Jira Board để tạo các Epics, Tasks, Sub-tasks tương ứng với các pha trong dự án.
  - Gắn nhãn, phân công thành viên và cập nhật trạng thái (`To Do`, `In Progress`, `Done`) ngay khi có tiến triển.

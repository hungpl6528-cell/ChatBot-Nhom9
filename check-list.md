# Checklist Triển Khai ChatBot Nhóm 9


---

## 👤 HIỂN ĐẠT — BE: Database & Domain Layer

### Setup Môi Trường
- [ ] Clone repo về máy
- [ ] Tạo branch `feature/be-domain`
- [ ] Tạo virtual environment Python
- [ ] Cài đặt dependencies từ `requirements.txt`
- [ ] Tạo file `.env` và `.env.example`

### Database MySQL
- [ ] Cài MySQL + MySQL Workbench
- [ ] Tạo database `chatbot_nhom9`
- [ ] Tạo 6 bảng: users, documents, questions, answers, experiments, evaluations

### Code Domain Layer
- [ ] Viết `app/domain/models.py` — SQLAlchemy ORM models
- [ ] Viết `app/domain/schemas.py` — Pydantic schemas
- [ ] Viết `app/domain/database.py` — kết nối SQLAlchemy
- [ ] Viết `app/repositories/mysql_repo.py` — CRUD MySQL
- [ ] Viết `app/repositories/vector_repo.py` — ChromaDB
- [ ] Test kết nối MySQL thành công
- [ ] Test kết nối ChromaDB thành công

### Git
- [ ] Tạo Pull Request `feature/be-domain` → `develop`
- [ ] Được review và merge

---

## 👤 LIÊN HƯNG — BE: RAG Core + Kiến Trúc Tổng Thể

### Setup & Kiến Trúc
- [ ] Tạo branch `feature/be-rag` từ `develop`
- [ ] Thiết kế toàn bộ Clean Architecture: domain → repositories → use_cases → api
- [ ] Cấu hình `app/api/main.py` — khởi tạo FastAPI, CORS, đăng ký tất cả router
- [ ] Viết `app/api/v1/users.py` — API đăng ký / đăng nhập

### RAG Ingestion Pipeline
- [ ] Viết `app/use_cases/ingestion.py`
  - [ ] Đọc và parse file PDF
  - [ ] Đọc và parse file DOCX
  - [ ] Chunking: Fixed-size
  - [ ] Chunking: Recursive
  - [ ] Chunking: Semantic
  - [ ] Embed văn bản với embedding model được chọn
  - [ ] Lưu vectors + metadata vào ChromaDB
  - [ ] Cập nhật trạng thái tài liệu trong MySQL

### RAG Chat Pipeline
- [ ] Viết `app/use_cases/chat.py`
  - [ ] Nhúng câu hỏi thành vector embedding
  - [ ] Truy vấn ChromaDB lấy Top-K chunks liên quan
  - [ ] Xây dựng prompt với context + lịch sử chat
  - [ ] Gọi GPT-4o-mini
  - [ ] Lưu question + answer + context_sources vào MySQL
  - [ ] Trả về response_time, model_used, context_sources

### API Endpoints
- [ ] Viết `app/api/v1/documents.py`
  - [ ] POST /documents/ — upload file PDF/DOCX
  - [ ] GET /documents/ — danh sách tài liệu
  - [ ] DELETE /documents/{id} — xóa tài liệu
- [ ] Viết `app/api/v1/chat.py`
  - [ ] POST /chat/ — gửi câu hỏi, nhận câu trả lời RAG
  - [ ] GET /chat/history — lịch sử hội thoại

### Test
- [ ] Test upload PDF thành công
- [ ] Test upload DOCX thành công
- [ ] Test chat trả lời đúng ngữ cảnh
- [ ] Test trích dẫn nguồn tài liệu
- [ ] Test với tài liệu tiếng Việt

### Git
- [ ] Tạo Pull Request `feature/be-rag` → `develop`
- [ ] Được review và merge

---

## 👤 NINH DANH — BE: Benchmark & Evaluation

### Setup
- [ ] Tạo branch `feature/be-benchmark` từ `develop`
- [ ] Cài thư viện `ragas`

### Code Benchmark
- [ ] Viết `app/use_cases/evaluation.py`
  - [ ] Tính `accuracy_score`
  - [ ] Tính `relevancy_score`
  - [ ] Tính `faithfulness_score`
  - [ ] Tính `latency_score`
- [ ] Viết `app/use_cases/benchmark.py`
  - [ ] So sánh các chunking strategy
  - [ ] So sánh các embedding model
- [ ] Viết `app/api/v1/experiments.py` — API chạy thử nghiệm
- [ ] Viết `app/api/v1/reports.py` — API lấy kết quả

### Test
- [ ] Chạy RAGAS với test set 50 câu hỏi
- [ ] Lưu kết quả vào bảng `evaluations`
- [ ] API reports trả về đúng format

### Git
- [ ] Tạo Pull Request `feature/be-benchmark` → `develop`
- [ ] Được review và merge

---

## 👤 VĂN KHÁNH — FE: Chat & Documents

### Setup
- [ ] Tạo branch `feature/fe-chat-docs`
- [ ] Khởi tạo project React.js
- [ ] Cài Tailwind CSS
- [ ] Cài Axios
- [ ] Cài React Router

### Code Layout & Services
- [ ] Viết `src/app/layout.tsx` — Sidebar, Navbar
- [ ] Viết `src/app/page.tsx` — Trang chủ
- [ ] Viết `src/services/api.ts` — Cấu hình Axios chung
- [ ] Viết `src/services/chatService.ts`
- [ ] Viết `src/services/docService.ts`
- [ ] Viết `src/styles/globals.css`

### Components UI chung
- [ ] Button
- [ ] Input
- [ ] Card
- [ ] Modal
- [ ] Select

### Trang Chat
- [ ] Viết `src/app/chat/page.tsx`
- [ ] Component `ChatWindow`
- [ ] Component `MessageBubble` (phân biệt User/AI)
- [ ] Component `ContextViewer` — hiển thị nguồn trích dẫn
- [ ] Sidebar chọn AI Model, Embedding Model, Chunking Strategy

### Trang Documents
- [ ] Viết `src/app/documents/page.tsx`
- [ ] Component `FileUploader` — drag & drop
- [ ] Progress bar upload
- [ ] Component `DocumentList` — danh sách + trạng thái

### Git
- [ ] Tạo Pull Request vào `develop`
- [ ] Được review và merge

---

## 👤 HOÀNG DŨNG — FE: Dashboard & Experiments

### Điều kiện
- [ ] Người 4 đã merge `services/api.ts` vào `develop`

### Setup
- [ ] Tạo branch `feature/fe-dashboard`
- [ ] Cài Recharts

### Trang Experiments
- [ ] Viết `src/app/experiments/page.tsx`
- [ ] Form chọn chunking strategy
- [ ] Form chọn embedding model
- [ ] Nút chạy benchmark
- [ ] Hiển thị trạng thái đang chạy

### Trang Dashboard
- [ ] Viết `src/app/dashboard/page.tsx`
- [ ] Component `MetricCard` — KPI Cards
  - [ ] Tổng số tài liệu
  - [ ] Tổng số câu hỏi
  - [ ] Thời gian phản hồi trung bình
  - [ ] Điểm đánh giá trung bình
- [ ] Component `PerformanceChart`
  - [ ] Line Chart — so sánh Latency
  - [ ] Bar Chart — so sánh Accuracy/Relevancy/Faithfulness

### Git
- [ ] Tạo Pull Request vào `develop`
- [ ] Được review và merge

---

## 👤 THÀNH ĐẠT — Làm Báo Cáo

### Kiểm Thử
- [ ] Test toàn bộ API với Postman
- [ ] Test upload file PDF/DOCX
- [ ] Test chat với tài liệu đã upload
- [ ] Test benchmark chạy đúng
- [ ] Test dashboard hiển thị đúng số liệu
- [ ] Test responsive giao diện trên mobile

### Tối Ưu
- [ ] Tối ưu tốc độ truy vấn ChromaDB
- [ ] Tối ưu chunking size
- [ ] Xử lý các edge case (file lỗi, câu hỏi ngoài tài liệu...)

### Báo Cáo
- [ ] Soạn thảo chi tiết nội dung bài tập lớn trên latex
- [ ] Viết báo cáo thực nghiệm so sánh models
- [ ] Lập bảng số liệu RAGAS benchmark
- [ ] Vẽ biểu đồ so sánh kết quả

---

## 👤 KIỀU TRINH — Nghiên Cứu & Kết Luận

### Chuẩn Bị
- [ ] Soạn 50+ câu hỏi + ground truth lưu vào `docs/testset/testset.json`
- [ ] Phân loại câu hỏi theo category

### Thực Nghiệm
- [ ] Chạy RAG với từng embedding model
  - [ ] `multilingual-e5-base`
  - [ ] `text-embedding-3-small` (OpenAI)
  - [ ] `PhoBERT-base`
  - [ ] `bge-m3`
- [ ] Chạy RAG với từng chunking strategy
  - [ ] Fixed-size
  - [ ] Semantic
  - [ ] Recursive/Hierarchical
- [ ] Ghi lại kết quả RAGAS từng lần chạy
- [ ] Làm file README.md
### Phân Tích & Kết Luận
- [ ] So sánh RAG vs Fine-tuning (RQ Chính)
- [ ] Trả lời RQ Phụ 1: Chunking strategy tốt nhất
- [ ] Trả lời RQ Phụ 2: Embedding model phù hợp nhất
- [ ] Viết kết luận và đề xuất hướng phát triển
- [ ] Viết README.md đầy đủ cho repo
---

## 👑 Quản Lý Repo (PHAN LIÊN HƯNG / Chủ Repo)

### Khởi tạo Repository
- [ ] Tạo repo GitHub `ChatBot-Nhom9` ở chế độ Public
- [ ] Tạo file `README.md` và `.gitignore` ban đầu
- [ ] Tạo branch `develop` từ `main`
- [ ] Bật **Branch Protection** cho `main` — không cho push thẳng
- [ ] Bật **Branch Protection** cho `develop` — bắt buộc qua PR

### Quản Lý Thành Viên
- [ ] Add toàn bộ 7 thành viên vào repo (Settings → Collaborators)
- [ ] Xác nhận tất cả đã Accept invitation
- [ ] Phân quyền: thành viên thường dùng role **Write**

### Quản Lý Branch
- [ ] Tạo sẵn các branch feature cho từng người
  - [ ] `feature/be-domain`
  - [ ] `feature/be-rag`
  - [ ] `feature/be-benchmark`
  - [ ] `feature/fe-chat-docs`
  - [ ] `feature/fe-dashboard`
- [ ] Hướng dẫn nhóm quy tắc đặt tên branch và commit message

### Quản Lý Pull Request
- [ ] Review PR của Người 1 → merge vào `develop`
- [ ] Review PR của Người 2 → merge vào `develop`
- [ ] Review PR của Người 3 → merge vào `develop`
- [ ] Review PR của Người 4 → merge vào `develop`
- [ ] Review PR của Người 5 → merge vào `develop`
- [ ] Giải quyết conflict khi merge (nếu có)
- [ ] Merge `develop` vào `main` khi hoàn thành toàn bộ

### Hoàn Thiện Repo
- [ ] Tạo file `.env.example` mẫu cho cả nhóm
- [ ] Đảm bảo cấu trúc thư mục đúng theo kế hoạch
- [ ] Tag release version cuối cùng trước khi nộp

---

## 📋 Quản Lý Jira

### Khởi Tạo Jira & API Token
- [ ] Tạo tài khoản Jira tại **atlassian.com**
- [ ] Tạo project Jira tên `ChatBot-Nhom9`
- [ ] Chọn template **Scrum** hoặc **Kanban**
- [ ] Mời toàn bộ 7 thành viên vào Jira project
- [ ] Cấu hình các cột: `To Do` | `In Progress` | `Review` | `Done`
- [ ] Tạo Jira API Token: **Account Settings → Security → API Token → Create**
- [ ] Copy token → lưu vào file `config.env` với key `JIRA_TOKEN`

### Tạo Board, Epic, Task, Bug
- [ ] Tạo **Board** Scrum/Kanban cho project
- [ ] Tạo Epic:
  - [ ] Epic 1: **Backend - Database & Domain**
  - [ ] Epic 2: **Backend - RAG Core**
  - [ ] Epic 3: **Backend - Benchmark & Evaluation**
  - [ ] Epic 4: **Frontend - Chat & Documents**
  - [ ] Epic 5: **Frontend - Dashboard & Experiments**
  - [ ] Epic 6: **QA & Báo Cáo**
  - [ ] Epic 7: **Nghiên Cứu & Kết Luận**
- [ ] Tạo **Task** chi tiết cho từng Epic
- [ ] Tạo **Bug** ticket khi phát hiện lỗi trong quá trình test
- [ ] Assign task cho đúng thành viên phụ trách
- [ ] Đặt deadline cho từng task

### Theo Dõi & Cập Nhật
- [ ] Cập nhật trạng thái task sau mỗi lần hoàn thành (`To Do` → `In Progress` → `Done`)
- [ ] Họp standup hàng tuần và đồng bộ tiến độ trên board
- [ ] Nhắc nhở thành viên cập nhật task khi hoàn thành
- [ ] Theo dõi task bị block — hỗ trợ giải quyết kịp thời
- [ ] Tổng kết sprint cuối trước khi nộp

---


### ĐÁNH GIÁ MỨC ĐỘ ĐÓNG GÓP TỪNG THÀNH VIÊN SAU KHI HOÀN THIỆN ( THEO THỨ TỰ TỪ TRÊN XUỐNG )
1. PHAN LIÊN HƯNG
2. NGUYỄN HIỂN ĐẠT
3. ĐÀO VĂN KHÁNH
4. PHẠM HOÀNG DŨNG
5. LƯƠNG THÀNH ĐẠT
6. NGUYỄN CÔNG NINH DANH
7. TRẦN THỊ KIỀU TRINH

# Tài Liệu Đặc Tả Yêu Cầu Phần Mềm (SRS) - Phần Sơ Đồ
*(Các sơ đồ thiết kế cho Hệ thống ChatBot Nhóm 9)*

---

### 1. Sơ đồ Use Case
![Sơ đồ Use Case](docs/images/use-case.png)

**Giải thích luồng hoạt động:** 
Sinh viên có thể gửi câu hỏi, hệ thống sẽ sử dụng RAG hoặc Fine-tuning (nếu có) để truy xuất dữ liệu từ các tài liệu môn học và gọi mô hình AI bên ngoài để sinh câu trả lời. Quản trị viên chịu trách nhiệm quản lý tài liệu, cập nhật nguồn dữ liệu và xem các báo cáo phân tích hiệu suất hệ thống.

---

### 2. Sơ đồ Kiến trúc Tổng Quan
![Sơ đồ Kiến trúc](docs/images/context-diagram.png)

**Giải thích luồng hoạt động:**
Tài liệu sau khi được người dùng tải lên sẽ qua quá trình Ingestion (Cắt nhỏ - Chunking và nhúng vector - Embedding), sau đó lưu vào ChromaDB. Khi user đặt câu hỏi, hệ thống truy vấn vector tương đồng (Retrieval), kết hợp với Prompt và gửi cho LLM (GPT-4o-mini/Gemini). Câu trả lời cuối cùng được trả về cho người dùng và lưu vào MySQL.

---

### 3. Biểu đồ Lớp (Class Diagram)
![Sơ đồ Lớp](docs/images/class-diagram.png)

---

### 4. Biểu đồ Thực thể Kết hợp (ERD)
![Sơ đồ ERD](docs/images/erd.png)

**Giải thích luồng hoạt động (áp dụng chung cho Database):**
Cơ sở dữ liệu lưu trữ 6 thực thể chính: `Users` (Người dùng), `Documents` (Tài liệu), `Questions` (Câu hỏi), `Answers` (Câu trả lời), `Experiments` (Cấu hình thử nghiệm), và `Evaluations` (Kết quả đánh giá). Mỗi `Answer` liên kết với một `Question` và có thể có nhiều `Evaluations` đi kèm để đo đạc chất lượng câu trả lời.

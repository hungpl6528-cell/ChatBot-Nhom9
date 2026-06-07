# Checklist Triển Khai Dự Án Chatbot Học Tập (Nhóm 9)

## 📋 Pha 1: Khởi tạo Cơ sở dữ liệu và Cấu trúc dự án
- [ ] Thiết lập cơ sở dữ liệu MySQL dựa trên [ERD.md](file:///c:/B%C3%81O%20C%C3%81O%20NH%C3%93M/ChatBot-Nhom9/ChatBot-Nhom9/ERD.md)
- [ ] Khởi tạo thư mục và cấu trúc Clean Architecture cho Backend (`/backend/app/...`)
- [ ] Khởi tạo project Next.js và cấu trúc Component-Driven cho Frontend (`/frontend/...`)
- [ ] Thiết lập cấu hình biến môi trường (`config.env` và `.env`)

## 📋 Pha 2: Triển khai luồng RAG cơ bản (Backend)
- [ ] Cài đặt kết nối SQLAlchemy/SQLModel đến MySQL
- [ ] Cài đặt kết nối đến ChromaDB (Vector DB)
- [ ] Xây dựng Use Case `ingestion.py` (Hỗ trợ PDF/DOCX, Chunking, Embedding)
- [ ] Xây dựng Use Case `chat.py` (Retrieval + Prompt + Gọi LLM và lưu lịch sử)
- [ ] Hoàn thành API endpoint `/upload` và `/chat` cơ bản

## 📋 Pha 3: Đánh giá & Benchmarking (Backend)
- [ ] Xây dựng Use Case `evaluation.py` (Tính toán accuracy, relevancy, faithfulness, latency)
- [ ] Xây dựng Use Case `benchmark.py` (So sánh hiệu năng giữa các chiến lược chunking và embedding)
- [ ] Thiết lập API `/experiments` để kích hoạt và quản lý tiến trình benchmark
- [ ] Thiết lập API `/reports` để xuất dữ liệu thống kê

## 📋 Pha 4: Thiết kế Giao diện người dùng (Frontend)
- [ ] Xây dựng Layout cơ bản (Sidebar, Navbar điều hướng)
- [ ] Xây dựng giao diện **Chat Sandbox** (Cho phép cấu hình Model, Chiến lược chunking/embedding ngay trên UI)
- [ ] Xây dựng giao diện **Document Manager** (Kéo thả upload tệp và hiển thị danh sách tài liệu)
- [ ] Xây dựng giao diện **Dashboard & Analytics** (Hiển thị KPI Cards và Charts so sánh hiệu năng)

## 📋 Pha 5: Kết nối API (BE-FE Integration)
- [ ] Thiết lập cấu hình Axios/Fetch chung ở Frontend
- [ ] Kết nối API upload và hiển thị danh sách tài liệu
- [ ] Kết nối API chat sandbox, hiển thị Context Sources (nguồn trích xuất ngữ cảnh)
- [ ] Vẽ các biểu đồ thống kê Latency và Accuracy trên Dashboard từ API `/reports`

## 📋 Pha 6: Kiểm thử & Tối ưu hóa
- [ ] Viết unit test cho các Use Case chính ở Backend
- [ ] Kiểm thử độ tương thích responsive trên thiết bị di động cho Frontend
- [ ] Tối ưu hóa tốc độ tải và caching truy vấn ChromaDB
- [ ] Đồng bộ hóa trạng thái công việc với Jira Board và tạo Pull Request merge vào `main`
## ⬛ Pha 7: Đánh giá tổng quan & Kết luận

- [ ] Người đánh giá kết luận và so sánh giữa RAG và Fine-tuning (ưu/nhược điểm, hiệu năng, chi phí, trường hợp áp dụng)
- [ ] Tổng hợp kết quả benchmark từ các chiến lược chunking và embedding đã thử nghiệm
- [ ] Phân tích sai số và hạn chế của hệ thống (hallucination, out-of-context, latency cao)
- [ ] Đề xuất hướng cải tiến và mở rộng hệ thống trong tương lai
- [ ] Viết báo cáo tổng kết dự án (Introduction → Method → Results → Conclusion)
- [ ] Chuẩn bị slide thuyết trình bảo vệ đồ án nhóm
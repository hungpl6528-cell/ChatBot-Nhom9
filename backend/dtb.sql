-- ============================================================
--  DATABASE: chatbot_nhom9
--  Theo đúng cấu trúc slide "5. Cơ Sở Dữ Liệu"
-- ============================================================

CREATE DATABASE IF NOT EXISTS chatbot_nhom9
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chatbot_nhom9;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    ten           VARCHAR(100)  NOT NULL COMMENT 'Tên người dùng',
    email         VARCHAR(255)  NOT NULL,
    mat_khau      VARCHAR(255)  NOT NULL COMMENT 'Bcrypt hash',
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tài khoản người dùng';

-- ============================================================
-- 2. DOCUMENTS
-- ============================================================
CREATE TABLE documents (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id       INT UNSIGNED  NOT NULL,
    ten_file      VARCHAR(255)  NOT NULL COMMENT 'Tên file gốc',
    mon_hoc       VARCHAR(255)           COMMENT 'Môn học / chủ đề',
    trang_thai    ENUM('pending','processing','ready','error')
                                NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái xử lý',
    ngay_upload   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày upload',
    PRIMARY KEY (id),
    KEY idx_documents_user_id    (user_id),
    KEY idx_documents_trang_thai (trang_thai),
    CONSTRAINT fk_documents_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tài liệu PDF/DOCX tải lên hệ thống';

-- ============================================================
-- 3. QUESTIONS
-- ============================================================
CREATE TABLE questions (
    id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    noi_dung_cau_hoi   TEXT          NOT NULL COMMENT 'Nội dung câu hỏi',
    session_id         VARCHAR(100)  NOT NULL COMMENT 'ID phiên hội thoại',
    user_id            INT UNSIGNED           COMMENT 'Người đặt câu hỏi',
    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_questions_session_id (session_id),
    KEY idx_questions_user_id    (user_id),
    CONSTRAINT fk_questions_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Câu hỏi của người dùng trong từng phiên chat';

-- ============================================================
-- 4. ANSWERS
-- ============================================================
CREATE TABLE answers (
    id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    noi_dung_tra_loi   LONGTEXT      NOT NULL COMMENT 'Nội dung trả lời của LLM',
    response_time      FLOAT         NOT NULL DEFAULT 0 COMMENT 'Thời gian phản hồi (giây)',
    question_id        INT UNSIGNED  NOT NULL,
    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_answers_question_id (question_id),
    CONSTRAINT fk_answers_question_id
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Câu trả lời của chatbot cho từng câu hỏi';

-- ============================================================
-- 5. EXPERIMENTS
-- ============================================================
CREATE TABLE experiments (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    ten_thu_nghiem      VARCHAR(255)  NOT NULL COMMENT 'Tên thử nghiệm',
    chunking_strategy   ENUM('fixed-size','semantic','recursive')
                                     NOT NULL COMMENT 'Chiến lược chunking',
    embedding_model     VARCHAR(100)  NOT NULL COMMENT 'Model embedding sử dụng',
    user_id             INT UNSIGNED           COMMENT 'Người tạo thử nghiệm',
    trang_thai          ENUM('pending','running','completed','failed')
                                     NOT NULL DEFAULT 'pending',
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME              COMMENT 'Thời điểm hoàn thành',
    PRIMARY KEY (id),
    KEY idx_experiments_user_id (user_id),
    CONSTRAINT fk_experiments_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cấu hình mỗi lần chạy thử nghiệm benchmark RAG';

-- ============================================================
-- 6. EVALUATIONS
-- ============================================================
CREATE TABLE evaluations (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    experiment_id       INT UNSIGNED  NOT NULL,
    accuracy            FLOAT                  COMMENT 'Độ chính xác (0.0 - 1.0)',
    relevancy           FLOAT                  COMMENT 'Độ liên quan (0.0 - 1.0)',
    faithfulness        FLOAT                  COMMENT 'Độ trung thực (0.0 - 1.0)',
    latency             FLOAT                  COMMENT 'Độ trễ phản hồi (ms)',
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_evaluations_experiment_id (experiment_id),
    CONSTRAINT fk_evaluations_experiment_id
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kết quả đánh giá RAGAS cho từng thử nghiệm';

-- ============================================================
-- Xác nhận
-- ============================================================
SELECT TABLE_NAME AS `Bảng`, TABLE_COMMENT AS `Mô tả`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'chatbot_nhom9'
ORDER BY CREATE_TIME;

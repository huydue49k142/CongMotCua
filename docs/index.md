# Cổng 1 Cửa - Documentation Index

---

# 1. Giới thiệu

Thư mục `docs` chứa toàn bộ tài liệu thiết kế, kiến trúc, cơ sở dữ liệu, API và quy trình nghiệp vụ của hệ thống **Cổng 1 Cửa**.

Tài liệu được xây dựng nhằm:

- Chuẩn hóa quá trình phát triển.
- Giúp Developer nhanh chóng hiểu hệ thống.
- Hỗ trợ AI Coding Assistant (Cline, Claude Code, Codex...) đọc và triển khai đúng kiến trúc.
- Đảm bảo tất cả thành viên dự án sử dụng cùng một nguồn tài liệu.

---

# 2. Cấu trúc thư mục

```text
docs/

│

├── index.md
├── overview.md
│
├── architecture/
│   ├── ai-agent.md
│   └── conversation-state.md
│
├── business-rules/
│   └── system.md
│
├── database/
│   ├── erd.md
│   ├── tables.md
│   └── ...
│
├── api/
│   ├── authentication.md
│   ├── student.md
│   ├── academic-affairs.md
│   ├── procedures.md
│   └── ...
│
├── workflows/
│   ├── login.md
│   ├── logout.md
│   ├── forgot-password.md
│   ├── procedure-information.md
│   ├── submit-procedure.md
│   ├── request-list.md
│   ├── request-detail.md
│   ├── cancel-request.md
│   ├── supplement-request.md
│   ├── chatbot.md
│   ├── notifications.md
│   ├── approve-request.md
│   ├── reject-request.md
│   ├── request-additional-documents.md
│   └── ...
│
└── assets/
```

---

# 3. Ý nghĩa từng thư mục

## overview.md

Giới thiệu tổng quan hệ thống.

Bao gồm:

- Mục tiêu
- Tác nhân
- Kiến trúc
- Công nghệ
- Workflow tổng quát
- Module
- Quy tắc thiết kế

---

## architecture/

Mô tả kiến trúc của hệ thống.

Hiện gồm:

- AI Agent
- Conversation State

Trong tương lai có thể bổ sung:

- Backend Architecture
- Frontend Architecture
- Deployment
- Infrastructure

---

## business-rules/

Chứa toàn bộ Business Rule của hệ thống.

Ví dụ:

- Quy tắc tạo hồ sơ.
- Quy tắc kiểm tra điều kiện.
- Quy tắc Conversation.
- Quy tắc Notification.
- Quy tắc phân quyền.

---

## database/

Mô tả thiết kế cơ sở dữ liệu.

Bao gồm:

- ERD
- Danh sách bảng
- Quan hệ
- Chỉ mục
- Quy ước đặt tên
- Version Database

---

## api/

Định nghĩa toàn bộ REST API.

Mỗi API nên mô tả:

- Endpoint
- Method
- Authentication
- Request
- Response
- Error Code

---

## workflows/

Đây là thư mục lớn nhất.

Mỗi file mô tả một nghiệp vụ độc lập.

Workflow không mô tả code.

Workflow mô tả:

- Mục tiêu
- Luồng xử lý
- Business Rule
- API liên quan
- Database liên quan
- AI Agent liên quan
- Notification
- Exception

---

## assets/

Lưu hình ảnh.

Ví dụ:

- BPMN
- Use Case
- ERD
- Sequence Diagram
- UI
- Flowchart

---

# 4. Kiến trúc tài liệu

```text
overview

↓

architecture

↓

business-rules

↓

database

↓

api

↓

workflows

↓

implementation
```

Điều này có nghĩa:

Developer phải hiểu hệ thống trước.

Sau đó mới:

- Kiến trúc
- Business Rule
- Database
- API
- Workflow

Cuối cùng mới viết code.

---

# 5. Quy tắc đọc tài liệu

Đối với Developer mới hoặc AI Coding Assistant, nên đọc theo thứ tự sau.

## Bước 1

```
overview.md
```

Hiểu hệ thống.

---

## Bước 2

```
architecture/
```

Hiểu:

- AI Agent
- Conversation State

---

## Bước 3

```
business-rules/
```

Hiểu:

- Business Rule toàn hệ thống.

---

## Bước 4

```
database/
```

Hiểu:

- Cơ sở dữ liệu.

---

## Bước 5

```
api/
```

Hiểu:

- REST API.

---

## Bước 6

```
workflows/
```

Hiểu:

- Nghiệp vụ.

---

## Bước 7

Bắt đầu phát triển.

---

# 6. Quan hệ giữa các tài liệu

```text
overview.md

↓

architecture/

↓

business-rules/

↓

database/

↓

api/

↓

workflows/

↓

source code
```

Mỗi tầng chỉ phụ thuộc vào tầng phía trên.

Ví dụ:

Workflow không được định nghĩa Business Rule mới.

Workflow chỉ sử dụng Business Rule đã được định nghĩa.

---

# 7. Quy tắc cập nhật tài liệu

Khi phát triển hệ thống, mọi thay đổi phải được cập nhật theo thứ tự sau:

1. Business Rule
2. Database
3. API
4. Workflow
5. Source Code

Không được cập nhật Source Code trước tài liệu.

---

# 8. Quy tắc đặt tên file

Sử dụng:

- Chữ thường.
- Kebab-case.
- Tiếng Anh.

Ví dụ:

```
submit-procedure.md
```

Không sử dụng:

```
SubmitProcedure.md
```

hoặc

```
Gửi thủ tục.md
```

---

# 9. Quy tắc viết tài liệu

Mỗi tài liệu Workflow nên có cấu trúc thống nhất:

```text
1. Mục tiêu

2. Actors

3. Trigger

4. Preconditions

5. Main Workflow

6. Alternative Flow

7. Exception Flow

8. Business Rules

9. AI Responsibilities

10. API Mapping

11. Database Mapping

12. Notification

13. Logging

14. Sequence Diagram (nếu có)
```

Điều này giúp tất cả Workflow có cấu trúc đồng nhất.

---

# 10. Công nghệ sử dụng

## Frontend

- Next.js
- TypeScript
- Tailwind CSS

---

## Backend

- Django
- Django REST Framework

---

## AI

- AI Agent
- RAG (Retrieval-Augmented Generation)
- OCR

---

## Workflow

- n8n

---

## Database

- PostgreSQL

---

## Authentication

- JWT

---

# 11. Quy tắc kiến trúc

Hệ thống được thiết kế theo các nguyên tắc sau:

- Frontend và Backend tách biệt.
- AI Agent không ghi trực tiếp vào cơ sở dữ liệu.
- Backend là nơi thực thi Business Rule.
- n8n điều phối các quy trình tự động.
- Notification là module dùng chung.
- Mọi thay đổi trạng thái đều được ghi nhận vào Timeline và Audit Log.
- Một sinh viên chỉ có một yêu cầu thủ tục đang hoạt động tại một thời điểm.
- Conversation State chỉ tồn tại trong phiên đăng nhập và bị xóa sau khi hoàn thành thủ tục hoặc đăng xuất.

---

# 12. Dành cho AI Coding Assistant

Khi AI Coding Assistant (Cline, Claude Code, Codex...) triển khai hoặc chỉnh sửa hệ thống, cần tuân thủ các nguyên tắc sau:

- Luôn đọc tài liệu theo thứ tự được quy định trong `index.md`.
- Không tự ý thay đổi Business Rule nếu chưa cập nhật tài liệu tương ứng.
- Không triển khai chức năng trái với các Workflow đã được định nghĩa.
- Mọi thay đổi về Database hoặc API phải phản ánh vào tài liệu trước khi sửa mã nguồn.
- Khi có xung đột giữa tài liệu và mã nguồn, **tài liệu trong thư mục `docs` được xem là nguồn tham chiếu chính** cho đến khi dự án được cập nhật đồng bộ.

---

# 13. Mục tiêu của bộ tài liệu

Bộ tài liệu này nhằm đảm bảo:

- Kiến trúc hệ thống rõ ràng.
- Nghiệp vụ thống nhất.
- Dễ bảo trì và mở rộng.
- Dễ onboarding thành viên mới.
- AI Coding Assistant có thể hiểu đầy đủ bối cảnh dự án trước khi sinh mã nguồn.
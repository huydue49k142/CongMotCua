# Cổng 1 Cửa - Tổng quan hệ thống

---

# 1. Giới thiệu

Cổng 1 Cửa là hệ thống hỗ trợ số hóa và tự động hóa quy trình xử lý các thủ tục học vụ dành cho sinh viên và Phòng Đào tạo.

Hệ thống được xây dựng với mục tiêu giảm thời gian xử lý hồ sơ, hạn chế thao tác thủ công và nâng cao trải nghiệm người dùng thông qua AI Agent và Workflow Automation.

Khác với các hệ thống quản lý thủ tục truyền thống, Cổng 1 Cửa sử dụng AI Agent làm trung tâm của quy trình nghiệp vụ. AI Agent hỗ trợ sinh viên kiểm tra điều kiện, hướng dẫn bổ sung thông tin, tạo mẫu đơn, kiểm tra sơ bộ minh chứng và điều phối quy trình trước khi chuyển hồ sơ đến Phòng Đào tạo xử lý.

---

# 2. Mục tiêu hệ thống

Hệ thống hướng đến các mục tiêu sau:

- Tự động hóa quy trình tiếp nhận hồ sơ học vụ.
- Giảm khối lượng xử lý thủ công của Phòng Đào tạo.
- Hỗ trợ sinh viên thực hiện thủ tục nhanh chóng và chính xác.
- Chuẩn hóa quy trình xử lý hồ sơ.
- Tăng khả năng mở rộng cho các loại thủ tục trong tương lai.
- Tích hợp AI Agent để hỗ trợ nghiệp vụ.
- Tích hợp Workflow Automation bằng n8n.

---

# 3. Tác nhân

Hệ thống hiện có hai tác nhân chính.

## 3.1 Sinh viên

Sinh viên sử dụng hệ thống để:

- Đăng nhập.
- Quên mật khẩu.
- Đăng xuất.
- Tra cứu thông tin thủ tục.
- Thực hiện thủ tục học vụ với AI Agent.
- Theo dõi hồ sơ.
- Bổ sung minh chứng.
- Hủy hồ sơ.
- Trao đổi với Chatbot AI.
- Nhận thông báo.

---

## 3.2 Phòng Đào tạo

Phòng Đào tạo sử dụng hệ thống để:

- Đăng nhập.
- Quên mật khẩu.
- Đăng xuất.
- Quản lý danh sách yêu cầu thủ tục.
- Xem chi tiết hồ sơ.
- Duyệt hồ sơ.
- Từ chối hồ sơ.
- Yêu cầu bổ sung minh chứng.
- Nhận thông báo.

---

# 4. Kiến trúc tổng thể

Hệ thống được chia thành các lớp chức năng.

```text
Frontend (Next.js)

↓

REST API

↓

Backend (Django)

↓

AI Agent

↓

Workflow Automation (n8n)

↓

Database

↓

File Storage
```

---

# 5. Công nghệ sử dụng

## Frontend

- Next.js
- Node.js
- Tailwind CSS
- TypeScript

---

## Backend

- Django
- Django REST Framework
- JWT Authentication

---

## AI

- AI Agent
- RAG (Retrieval-Augmented Generation)
- OCR Agent

---

## Workflow Automation

- n8n

---

## Database

- PostgreSQL

---

## File Storage

Lưu trữ:

- PDF
- DOCX
- JPG
- JPEG
- PNG

---

# 6. Các thành phần chính

## Authentication

Quản lý:

- Đăng nhập.
- Đăng xuất.
- Quên mật khẩu.
- Phân quyền.

---

## AI Agent

AI Agent chịu trách nhiệm:

- Hội thoại với sinh viên.
- Kiểm tra Business Rule.
- Kiểm tra OCR.
- Sinh mẫu đơn.
- Điều phối quá trình thực hiện thủ tục.

Chi tiết xem:

```
docs/architecture/ai-agent.md
```

---

## Conversation State

Quản lý:

- Ngữ cảnh hội thoại.
- Trạng thái Workflow.
- Waiting Upload.
- Waiting Confirmation.

Chi tiết xem:

```
docs/architecture/conversation-state.md
```

---

## Workflow Automation

n8n chịu trách nhiệm:

- Điều phối các bước nghiệp vụ.
- Gọi AI Agent.
- Gọi Backend API.
- Gửi Notification.

---

## Notification

Quản lý:

- Thông báo.
- Badge.
- Trạng thái đã đọc.

Chi tiết xem:

```
docs/workflows/notifications.md
```

---

# 7. Quy trình xử lý tổng quát

```text
Sinh viên

↓

Đăng nhập

↓

Tra cứu thủ tục

↓

AI Agent

↓

Kiểm tra điều kiện

↓

Tạo mẫu đơn

↓

Upload minh chứng

↓

OCR

↓

Xác nhận

↓

Gửi hồ sơ

↓

Chờ tiếp nhận

↓

Phòng Đào tạo xử lý

├──────────────┐
│              │
▼              ▼
Duyệt      Từ chối
│
│
└──────────────┐
               │
      Yêu cầu bổ sung
               │
               ▼
      Sinh viên bổ sung
               │
               ▼
        Chờ tiếp nhận
```

---

# 8. Vòng đời của một yêu cầu thủ tục

```text
Khởi tạo

↓

AI đang xử lý

↓

Chờ xác nhận sinh viên

↓

Chờ tiếp nhận

↓

Đang xử lý

├──────────────┐
│              │
▼              ▼
Đã hoàn thành  Đã từ chối
│
│
└──────────────┐
               │
Chờ bổ sung minh chứng
               │
               ▼
Sinh viên bổ sung
               │
               ▼
Chờ tiếp nhận
```

---

# 9. Các module của hệ thống

| Module | Mô tả |
|----------|------|
| Authentication | Quản lý đăng nhập và phân quyền |
| Student | Chức năng dành cho sinh viên |
| Academic Affairs | Chức năng dành cho Phòng Đào tạo |
| Procedure | Quản lý yêu cầu thủ tục |
| AI Agent | Hội thoại và xử lý nghiệp vụ |
| OCR | Kiểm tra sơ bộ minh chứng |
| Notification | Thông báo |
| Timeline | Theo dõi tiến độ xử lý |
| Audit Log | Nhật ký hệ thống |
| File Storage | Lưu trữ tệp |
| Workflow | Điều phối nghiệp vụ |
| Chatbot | Hỏi đáp AI |

---

# 10. Tài liệu liên quan

## Architecture

```
docs/architecture/
```

- ai-agent.md
- conversation-state.md

---

## Business Rules

```
docs/business-rules/
```

- system.md

---

## Workflows

```
docs/workflows/
```

Bao gồm toàn bộ Workflow của:

- Sinh viên.
- Phòng Đào tạo.
- Notification.

---

## API

```
docs/api/
```

Định nghĩa REST API của hệ thống.

---

## Database

```
docs/database/
```

Thiết kế cơ sở dữ liệu.

---

# 11. Nguyên tắc thiết kế

Hệ thống được xây dựng theo các nguyên tắc sau:

- Phân tách rõ Frontend và Backend.
- AI Agent chỉ xử lý các nghiệp vụ được định nghĩa.
- Mọi Business Rule được xử lý tại Backend.
- AI Agent không được phép ghi trực tiếp vào cơ sở dữ liệu.
- n8n chịu trách nhiệm điều phối quy trình.
- Notification là module dùng chung.
- Timeline và Audit Log phải được ghi nhận cho mọi thay đổi trạng thái.
- Một sinh viên chỉ được phép có một yêu cầu thủ tục đang hoạt động tại một thời điểm.
- Conversation State chỉ tồn tại trong phiên đăng nhập và sẽ bị xóa khi người dùng hoàn thành thủ tục hoặc đăng xuất.

---

# 12. Tài liệu nên đọc theo thứ tự

Đối với Developer hoặc AI Coding Assistant, thứ tự đọc tài liệu được khuyến nghị như sau:

1. docs/overview.md
2. docs/architecture/ai-agent.md
3. docs/architecture/conversation-state.md
4. docs/business-rules/system.md
5. docs/database/
6. docs/api/
7. docs/workflows/
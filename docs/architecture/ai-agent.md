# AI Agent Architecture

> Version: 1.0
>
> Project: AI Agent và Tự động hóa quy trình hành chính tại Phòng Đào tạo
>
> Framework:
>
> - Front-end: Next.js + Tailwind CSS
> - Backend: Django
> - Workflow Engine: n8n
> - Database: PostgreSQL
> - AI: Large Language Model (LLM)
> - OCR: AI OCR Service

---

# 1. Mục đích

Tài liệu này mô tả kiến trúc AI Agent của hệ thống Cổng Một Cửa.

AI Agent không chỉ đóng vai trò Chatbot trả lời câu hỏi mà là một **AI Workflow Assistant** có khả năng:

- Hiểu ý định của sinh viên.
- Điều phối hội thoại.
- Gọi Workflow Automation.
- Kiểm tra điều kiện thực hiện thủ tục.
- Hướng dẫn sinh viên hoàn thiện hồ sơ.
- Tương tác với Backend thông qua Tool Calling.
- Phối hợp với n8n để tự động hóa quy trình.

AI Agent **không trực tiếp xử lý Business Rule** và **không truy cập Database**.

---

# 2. Kiến trúc tổng thể

```text
                         Student
                            │
                            ▼
                  Next.js Conversation UI
                            │
                            ▼
                    AI Coordinator
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
      ▼                     ▼                     ▼
Conversation Agent   Procedure Agent      OCR Agent
      │                     │
      └──────────────┬──────┘
                     ▼
                Rule Agent
                     │
                     ▼
                Tool Calling
                     │
                     ▼
                     n8n
                     │
      ┌──────────────┼───────────────┐
      ▼              ▼               ▼
 Django API     OCR Service    Notification
      │
      ▼
 PostgreSQL
```

---

# 3. Kiến trúc Multi-Agent

Hệ thống sử dụng mô hình Multi-Agent.

Mỗi Agent chỉ đảm nhiệm một trách nhiệm duy nhất.

Việc phân chia này giúp:

- dễ mở rộng
- dễ bảo trì
- giảm Prompt phức tạp
- giảm Hallucination
- tăng khả năng tái sử dụng

---

# 4. AI Coordinator

## Vai trò

AI Coordinator là Agent trung tâm.

Đây là Agent duy nhất giao tiếp với Front-end.

Mọi tin nhắn của sinh viên đều đi qua AI Coordinator.

---

## Nhiệm vụ

- Quản lý Conversation
- Hiểu Intent
- Điều phối Agent
- Gọi Tool
- Trả kết quả về Front-end

AI Coordinator không xử lý nghiệp vụ.

---

## Ví dụ

```text
Sinh viên

↓

"Tôi muốn chuyển ngành"

↓

Coordinator

↓

Procedure Agent

↓

Rule Agent

↓

n8n

↓

Backend

↓

Coordinator

↓

Sinh viên
```

---

# 5. Conversation Agent

## Vai trò

Conversation Agent chịu trách nhiệm quản lý toàn bộ cuộc hội thoại.

---

## Chức năng

- Ghi nhớ ngữ cảnh.
- Quản lý Conversation State.
- Trả lời tự nhiên.
- Hỏi bổ sung thông tin.
- Gợi ý bước tiếp theo.

---

## Không thực hiện

Conversation Agent KHÔNG:

- đọc Database
- kiểm tra điều kiện
- OCR
- tạo hồ sơ

---

# 6. Procedure Agent

Procedure Agent hiểu quy trình nghiệp vụ.

Ví dụ:

- Chuyển ngành
- Bảo lưu
- Học tiếp
- Thôi học

---

## Chức năng

- Xác định Procedure.
- Xác định Business Rule.
- Xác định loại minh chứng.
- Xác định mẫu đơn.
- Xác định Workflow cần gọi.

---

## Không thực hiện

Procedure Agent không:

- đọc Database
- tính GPA
- OCR
- sinh PDF

---

# 7. Rule Agent

Rule Agent chịu trách nhiệm đánh giá điều kiện.

Rule Agent KHÔNG sử dụng LLM để suy luận.

Mọi điều kiện đều được kiểm tra bởi Backend hoặc Rule Engine.

Ví dụ

```text
IF GPA >= 2.5

PASS

ELSE FAIL
```

AI chỉ diễn giải kết quả.

---

# 8. OCR Agent

OCR Agent xử lý minh chứng.

---

## Chức năng

- kiểm tra loại file

- kiểm tra tên file

- OCR

- xác định có đọc được văn bản

---

OCR Agent KHÔNG:

- xác minh nội dung

- xác minh giấy tờ

- xác minh tính hợp pháp

Những công việc này do Phòng Đào tạo thực hiện.

---

# 9. Tool Calling

AI Agent không truy cập Backend trực tiếp.

AI sử dụng Tool Calling.

Ví dụ

```text
AI

↓

Tool

↓

n8n

↓

API

↓

Database
```

---

## Tool tiêu chuẩn

GetStudentProfile

GetProcedure

CheckBusinessRule

GenerateDraft

CheckOCR

CreateProcedureRequest

CancelProcedure

GetConversationState

RestoreConversation

---

# 10. Workflow Automation (n8n)

n8n là Workflow Engine.

AI chỉ yêu cầu thực hiện Workflow.

n8n chịu trách nhiệm:

- gọi API

- xử lý dữ liệu

- điều phối

- gửi Notification

---

Ví dụ

```text
Start Procedure

↓

Get Student

↓

Check Rule

↓

Generate PDF

↓

OCR

↓

Create Request

↓

Notify Academic Office
```

---

# 11. Backend Django

Backend chịu trách nhiệm

- Authentication

- Business Rule

- Database

- Generate PDF

- Generate Word

- Upload File

- Lưu hồ sơ

Backend không xử lý hội thoại.

---

# 12. RAG

Hệ thống sử dụng RAG.

RAG chỉ dùng để trả lời:

- quy chế

- hướng dẫn

- FAQ

- quy trình

RAG không dùng để:

- kiểm tra điều kiện

- tính GPA

- xác minh hồ sơ

---

Nguồn dữ liệu RAG

- docs/

- Quy chế đào tạo

- Procedure Manual

- FAQ

---

# 13. Conversation Memory

Conversation được lưu trong suốt phiên làm việc.

Conversation dùng để:

- nhớ Procedure

- nhớ Checklist

- nhớ Draft

- nhớ Upload

- nhớ Conversation State

---

Conversation không lưu vĩnh viễn.

---

# 14. Intent Recognition

AI không yêu cầu sinh viên nhập đúng câu lệnh.

Ví dụ

Các câu sau đều được hiểu là:

SUBMIT_REQUEST

- Gửi hồ sơ

- Đồng ý gửi

- Hoàn tất

- Xác nhận

- Ok gửi đi

---

# 15. Error Handling

Nếu Tool lỗi

↓

AI giải thích bằng ngôn ngữ tự nhiên.

Ví dụ

"Lỗi truy xuất dữ liệu sinh viên.

Vui lòng thử lại sau."

---

# 16. Security

AI không:

- truy cập Database

- thực hiện SQL

- thay đổi Business Rule

- quyết định kết quả

Mọi dữ liệu phải thông qua Backend.

---

# 17. Nguyên tắc thiết kế

## Single Responsibility

Mỗi Agent chỉ làm một nhiệm vụ.

---

## Backend First

Backend là nguồn dữ liệu duy nhất.

---

## AI Explain

AI chỉ giải thích.

Không quyết định.

---

## Human in the Loop

Các quyết định cuối cùng liên quan đến hồ sơ và minh chứng do Phòng Đào tạo xử lý.

---

## Stateless Business Logic

Business Rule không được lưu trong Prompt.

Business Rule luôn lấy từ Backend.

---

# 18. Hướng mở rộng

Kiến trúc này có thể mở rộng thêm:

- Voice Agent

- Email Agent

- Zalo OA

- Microsoft Teams

- Mobile App

mà không cần thay đổi Backend.

---
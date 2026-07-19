# Conversation State Architecture

> Version: 1.0
>
> Project: AI Agent và Tự động hóa quy trình hành chính tại Phòng Đào tạo

---

# 1. Mục đích

Tài liệu này mô tả vòng đời (Lifecycle) của một Conversation giữa Sinh viên và AI Agent trong quá trình thực hiện một thủ tục học vụ.

Conversation State giúp:

- Quản lý trạng thái hội thoại.
- Đồng bộ giữa Front-end, AI Agent, n8n và Backend.
- Khôi phục hội thoại khi người dùng Refresh trình duyệt.
- Đảm bảo chỉ có một Conversation hoạt động tại một thời điểm.
- Xác định chính xác AI đang ở bước nào của Workflow.

Conversation State không thay thế trạng thái hồ sơ (Procedure Request Status).

---

# 2. Conversation là gì?

Conversation là toàn bộ quá trình trao đổi giữa Sinh viên và AI Agent để thực hiện một thủ tục học vụ.

Một Conversation chỉ gắn với duy nhất:

- Một sinh viên.
- Một phiên đăng nhập.
- Một thủ tục học vụ.

Ví dụ:

```text
Conversation
    │
    ├── Student
    ├── Procedure
    ├── Messages
    ├── Uploaded Files
    ├── Draft Form
    └── Current State
```

---

# 3. Nguyên tắc

## Một Conversation chỉ thực hiện một thủ tục

Ví dụ

```
Conversation A

↓

Chuyển ngành
```

Không được chuyển sang:

```
Thôi học
```

khi Conversation chưa kết thúc.

---

## Chỉ tồn tại một Conversation hoạt động

Một sinh viên chỉ được phép có một Conversation đang hoạt động.

Nếu đã có Conversation:

AI phải khôi phục Conversation đó.

Không tạo Conversation mới.

---

## Conversation không lưu vĩnh viễn

Conversation chỉ tồn tại trong phiên làm việc.

Sau khi:

- Gửi hồ sơ thành công.
- Hủy thủ tục.
- Đăng xuất.

Conversation phải bị xóa.

---

# 4. State Machine

Conversation gồm các trạng thái sau.

```
Idle
 │
 ▼
Procedure Selected
 │
 ▼
Checklist Displayed
 │
 ▼
Checklist Confirmed
 │
 ▼
Loading Student Data
 │
 ▼
Checking Business Rules
 │
 ├──────────────┐
 │              │
 ▼              ▼
Not Eligible   Eligible
 │              │
 │              ▼
 │       Generating Draft
 │              │
 │              ▼
 │     Waiting User Information
 │              │
 │              ▼
 │     Waiting User Confirmation
 │              │
 │              ▼
 │        Waiting Upload
 │              │
 │              ▼
 │        OCR Processing
 │              │
 │              ▼
 │       Ready To Submit
 │              │
 │              ▼
 │      Submitting Request
 │              │
 │              ▼
 │          Submitted
 │
 ▼
Conversation Closed
```

---

# 5. Chi tiết từng State

## 5.1 Idle

Đây là trạng thái mặc định.

Điều kiện:

- Chưa chọn thủ tục.

AI:

```
Xin chào!

Bạn muốn thực hiện thủ tục nào?
```

---

## 5.2 Procedure Selected

Sinh viên chọn:

- Chuyển ngành
- Bảo lưu
- Học tiếp
- Thôi học

AI bắt đầu khởi tạo Workflow.

---

## 5.3 Checklist Displayed

AI hiển thị:

Danh sách điều kiện tự kiểm tra.

Ví dụ

```
☐ Không phải năm cuối

☐ Không bị kỷ luật

☐ ...
```

AI chờ sinh viên xác nhận.

---

## 5.4 Checklist Confirmed

Sinh viên đã tích toàn bộ checklist.

AI chuẩn bị kiểm tra dữ liệu thực tế.

---

## 5.5 Loading Student Data

AI gọi:

Tool

↓

GetStudentProfile

↓

n8n

↓

Backend

↓

Database

AI thông báo:

```
Đang lấy dữ liệu của bạn...
```

---

## 5.6 Checking Business Rules

AI gọi

CheckBusinessRule

Backend trả kết quả.

Nếu dữ liệu sinh viên khác với Checklist:

AI giải thích rõ nguyên nhân.

Ví dụ

```
Bạn đã chọn:

Không phải năm cuối.

Tuy nhiên dữ liệu hệ thống cho thấy
bạn đang là sinh viên năm cuối.

Điều kiện này không đạt.
```

---

## 5.7 Not Eligible

AI hiển thị:

- Điều kiện đạt.
- Điều kiện không đạt.
- Giải thích.

Ví dụ

```
Bạn chưa đủ điều kiện vì:

- GPA chưa đạt.
- Đang năm cuối.
```

Conversation kết thúc.

---

## 5.8 Eligible

Toàn bộ điều kiện đều đạt.

AI chuyển sang sinh mẫu đơn.

---

## 5.9 Generating Draft

Backend Django sinh:

- PDF
- Word

AI chờ kết quả.

---

## 5.10 Waiting User Information

Nếu mẫu đơn còn thiếu dữ liệu.

Ví dụ

```
Lý do chuyển ngành
```

AI hỏi toàn bộ các trường còn thiếu trong một lần.

Sinh viên bổ sung.

Nếu vẫn còn thiếu.

AI tiếp tục hỏi tất cả trường còn thiếu.

---

## 5.11 Waiting User Confirmation

AI hiển thị Preview:

- PDF

- Word

Sinh viên xem.

Nếu cần chỉnh sửa.

Quay lại:

Waiting User Information

---

## 5.12 Waiting Upload

AI yêu cầu upload minh chứng.

Sinh viên upload.

Front-end hỗ trợ:

- Drag & Drop
- Upload Button
- Preview

---

## 5.13 OCR Processing

AI gọi:

CheckOCR

OCR kiểm tra:

- đúng loại file

- đúng tên file

- đọc được văn bản

Nếu lỗi.

AI yêu cầu upload lại.

---

## 5.14 Ready To Submit

AI thông báo:

```
Bạn đã hoàn tất hồ sơ.

Bạn có thể gửi hồ sơ.
```

AI hiểu nhiều cách diễn đạt:

- Gửi hồ sơ
- Đồng ý
- Hoàn tất
- Xác nhận
- Ok gửi

---

## 5.15 Submitting Request

AI gọi

CreateProcedureRequest

Backend:

- tạo mã hồ sơ

- lưu dữ liệu

- lưu minh chứng

- lưu PDF

- lưu Word

- gửi Phòng đào tạo

---

## 5.16 Submitted

AI:

```
Bạn đã gửi hồ sơ thành công.
```

Conversation kết thúc.

---

## 5.17 Conversation Closed

Conversation bị xóa.

Workflow hoàn thành.

---

# 6. Chuyển State

| Từ | Sang | Điều kiện |
|------|------|----------|
| Idle | Procedure Selected | Chọn thủ tục |
| Procedure Selected | Checklist Displayed | AI khởi tạo |
| Checklist Displayed | Checklist Confirmed | Sinh viên xác nhận |
| Checklist Confirmed | Loading Student Data | AI gọi Tool |
| Loading Student Data | Checking Business Rules | Đã lấy dữ liệu |
| Checking Business Rules | Eligible | PASS |
| Checking Business Rules | Not Eligible | FAIL |
| Eligible | Generating Draft | Sinh PDF |
| Generating Draft | Waiting User Information | Thiếu dữ liệu |
| Generating Draft | Waiting User Confirmation | Đủ dữ liệu |
| Waiting User Information | Waiting User Confirmation | Bổ sung xong |
| Waiting User Confirmation | Waiting Upload | Xác nhận |
| Waiting Upload | OCR Processing | Upload xong |
| OCR Processing | Ready To Submit | PASS |
| Ready To Submit | Submitting Request | Người dùng xác nhận |
| Submitting Request | Submitted | Thành công |
| Submitted | Conversation Closed | Hoàn tất |

---

# 7. Khôi phục Conversation

Nếu người dùng:

- Refresh trình duyệt.
- F5.
- Reload.

Conversation phải được khôi phục.

Các dữ liệu cần khôi phục:

- Procedure.
- Checklist.
- Draft.
- PDF.
- Word.
- Uploaded Files.
- Current State.
- Conversation History.

---

# 8. Xóa Conversation

Conversation bị xóa khi:

- Đăng xuất.
- Hủy thủ tục.
- Gửi hồ sơ thành công.

Sau khi xóa:

- Không thể khôi phục.
- Muốn làm thủ tục mới phải tạo Conversation mới.

---

# 9. Upload Session

Trong Waiting Upload.

Mỗi file có trạng thái:

```
Waiting Upload

↓

Uploading

↓

Uploaded

↓

OCR Checking

↓

Verified

↓

Completed
```

Nếu OCR lỗi.

↓

Rejected

↓

Upload lại.

---

# 10. Conversation Memory

Conversation Memory lưu:

- Procedure ID
- Conversation ID
- Student ID
- Current State
- Checklist
- Uploaded Files
- Draft Form
- AI Messages
- Student Messages
- OCR Result

Không lưu:

- Token
- Prompt nội bộ
- Chain of Thought

---

# 11. Thiết kế dành cho Front-end

Front-end luôn render theo Current State.

Ví dụ

Waiting Upload

↓

Hiển thị:

- Preview PDF
- Preview Word
- Upload Area

Ready To Submit

↓

Hiển thị:

- Nút gửi hồ sơ
- Khung chat

Không sử dụng nhiều màn hình.

Toàn bộ Workflow diễn ra trong một cửa sổ hội thoại.

---

# 12. Thiết kế dành cho AI Agent

AI không tự quyết định State.

State chỉ thay đổi khi:

- Tool thành công.
- Backend xác nhận.
- Người dùng thực hiện hành động.

AI chỉ đọc Current State.

Sau đó quyết định câu trả lời phù hợp.

---
# System Business Rules

> Version: 1.0
>
> Project: AI Agent và Tự động hóa quy trình hành chính tại Phòng Đào tạo

---

# 1. Mục đích

Tài liệu này mô tả các Business Rule áp dụng cho toàn bộ hệ thống.

Các Business Rule trong tài liệu này không thuộc riêng một thủ tục nào mà được áp dụng cho tất cả các chức năng của hệ thống.

Mọi thành phần của hệ thống phải tuân thủ tài liệu này, bao gồm:

- AI Agent
- Front-end
- Backend Django
- n8n Workflow
- OCR Service
- Database

---

# 2. Nguyên tắc chung

## BR-SYS-001

Backend Django là nguồn dữ liệu duy nhất của hệ thống.

AI Agent không được tự sinh dữ liệu.

---

## BR-SYS-002

AI Agent không được phép tự quyết định Business Rule.

Mọi kết quả kiểm tra điều kiện đều phải lấy từ Backend hoặc Rule Engine.

AI Agent chỉ có nhiệm vụ diễn giải kết quả bằng ngôn ngữ tự nhiên.

---

## BR-SYS-003

Trong trường hợp dữ liệu sinh viên tự khai báo khác với dữ liệu trong hệ thống.

Hệ thống luôn ưu tiên dữ liệu trong Database.

AI Agent phải giải thích rõ sự khác biệt cho sinh viên.

Ví dụ

```
Sinh viên chọn:

✓ Không phải sinh viên năm cuối

Nhưng dữ liệu hệ thống cho thấy:

Bạn đang là sinh viên năm cuối.

Điều kiện này không đạt.
```

---

## BR-SYS-004

Mọi Business Rule phải được Backend kiểm tra trước khi AI Agent trả lời kết quả.

Không cho phép AI tự suy luận.

---

# 3. Conversation Rules

## BR-SYS-005

Một Conversation chỉ được gắn với đúng một thủ tục.

Không được phép thay đổi sang thủ tục khác trong cùng Conversation.

---

## BR-SYS-006

Mỗi sinh viên chỉ được có một Conversation đang hoạt động.

Nếu Conversation đã tồn tại.

AI Agent phải khôi phục Conversation.

Không tạo Conversation mới.

---

## BR-SYS-007

Conversation phải được khôi phục khi:

- Refresh Browser
- Reload Browser
- F5

và Session vẫn còn hiệu lực.

---

## BR-SYS-008

Conversation phải bị xóa khi:

- Đăng xuất.
- Hủy thủ tục.
- Gửi hồ sơ thành công.

Sau khi bị xóa.

Conversation không được khôi phục.

---

## BR-SYS-009

Conversation chỉ tồn tại trong phiên đăng nhập hiện tại.

Không lưu Conversation lâu dài.

---

# 4. Procedure Rules

## BR-SYS-010

Một sinh viên chỉ được tồn tại tối đa một hồ sơ đang xử lý.

Các trạng thái bao gồm:

- Chờ tiếp nhận
- Đang xử lý
- Chờ bổ sung

Nếu còn một hồ sơ ở các trạng thái trên.

Không cho phép tạo hồ sơ mới.

---

## BR-SYS-011

Nếu sinh viên cố gắng tạo thủ tục mới.

AI Agent phải thông báo:

```
Bạn đang có một hồ sơ đang xử lý.

Vui lòng hoàn thành hoặc hủy hồ sơ hiện tại trước khi tạo thủ tục mới.
```

---

## BR-SYS-012

Mẫu đơn chỉ được sinh khi toàn bộ Business Rule của thủ tục đều đạt.

Không được phép sinh mẫu đơn trước.

---

## BR-SYS-013

Business Rule của từng thủ tục được quản lý riêng.

Hệ thống không hard-code Business Rule trong AI Agent.

---

# 5. Draft Rules

## BR-SYS-014

Draft Form chỉ được tạo sau khi:

- Kiểm tra Business Rule thành công.

---

## BR-SYS-015

Draft Form phải được Backend Django sinh tự động.

AI Agent không tạo Draft.

---

## BR-SYS-016

Nếu Draft còn thiếu dữ liệu.

AI Agent phải yêu cầu sinh viên bổ sung toàn bộ các trường còn thiếu trong một lần.

Sau khi sinh viên trả lời.

Nếu vẫn còn thiếu.

AI Agent tiếp tục liệt kê toàn bộ các trường còn thiếu.

---

## BR-SYS-017

Hệ thống chỉ lưu bản Draft cuối cùng.

Không lưu lịch sử các phiên bản Draft.

---

# 6. Upload Rules

## BR-SYS-018

Minh chứng chỉ được phép tải lên sau khi:

- Sinh viên đủ điều kiện.
- Draft Form đã được sinh.

---

## BR-SYS-019

Mỗi loại thủ tục có danh sách minh chứng riêng.

Danh sách này được Backend quản lý.

---

## BR-SYS-020

Front-end phải hiển thị Preview của tất cả các minh chứng đã tải lên.

---

## BR-SYS-021

Sinh viên có thể thay thế minh chứng trước khi gửi hồ sơ.

---

# 7. OCR Rules

## BR-SYS-022

OCR chỉ kiểm tra:

- Đúng loại file.
- Đúng cấu trúc tên file.
- Có thể đọc được văn bản.

---

## BR-SYS-023

OCR không kiểm tra:

- Tính hợp lệ của giấy tờ.
- Nội dung giấy tờ.
- Tính minh bạch.
- Tính pháp lý.

Các nội dung này do Phòng Đào tạo xử lý thủ công.

---

## BR-SYS-024

Nếu OCR thất bại.

AI Agent phải yêu cầu sinh viên tải lại minh chứng.

---

# 8. AI Agent Rules

## BR-SYS-025

AI Agent phải hiểu ý định (Intent).

Không yêu cầu sinh viên nhập đúng câu lệnh.

Ví dụ.

Các câu sau đều được hiểu là:

SUBMIT_REQUEST

- Gửi hồ sơ
- Đồng ý
- Hoàn tất
- Ok gửi
- Xác nhận gửi

---

## BR-SYS-026

AI Agent phải duy trì ngữ cảnh trong toàn bộ Conversation.

---

## BR-SYS-027

AI Agent không được tự tạo dữ liệu.

---

## BR-SYS-028

AI Agent không được phép sửa dữ liệu trong Database.

---

## BR-SYS-029

AI Agent chỉ giao tiếp với Backend thông qua Tool Calling.

---

# 9. Workflow Rules

## BR-SYS-030

Mọi Workflow đều được điều phối bởi n8n.

AI Agent không điều phối Workflow.

---

## BR-SYS-031

n8n chịu trách nhiệm:

- Gọi API
- Điều phối Tool
- Đồng bộ dữ liệu
- Gửi Notification

---

# 10. Security Rules

## BR-SYS-032

AI Agent không được truy cập Database trực tiếp.

---

## BR-SYS-033

Mọi thao tác với Database đều thông qua Backend Django.

---

## BR-SYS-034

Không lưu Prompt nội bộ hoặc Chain of Thought vào Database.

---

## BR-SYS-035

Không sử dụng dữ liệu do AI suy luận làm dữ liệu chính thức.

---

# 11. Human-in-the-loop Rules

## BR-SYS-036

AI Agent chỉ hỗ trợ chuẩn bị hồ sơ.

Không thay thế quyết định của Phòng Đào tạo.

---

## BR-SYS-037

Phòng Đào tạo là đơn vị cuối cùng quyết định:

- Hồ sơ hợp lệ.
- Minh chứng hợp lệ.
- Kết quả xử lý thủ tục.

---
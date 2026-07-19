# Module: Notifications

---

# 1. Mục đích

Module Notifications chịu trách nhiệm gửi và quản lý các thông báo trong hệ thống Cổng 1 Cửa.

Mỗi khi có một sự kiện làm thay đổi trạng thái của yêu cầu thủ tục, hệ thống sẽ tự động tạo thông báo để người dùng liên quan biết được sự thay đổi.

Module này chỉ dùng để thông báo, không xử lý nghiệp vụ.

---

# 2. Actors

- Sinh viên
- Phòng Đào tạo
- Hệ thống

---

# 3. Mục tiêu

- Thông báo kịp thời cho người dùng.
- Giảm việc phải kiểm tra hồ sơ liên tục.
- Đồng bộ trạng thái giữa các bên.
- Không thay đổi luồng xử lý nghiệp vụ.

---

# 4. Vị trí giao diện

## Sinh viên

Thông báo hiển thị tại:

- Biểu tượng Chuông trên Header.

Ví dụ

```
🔔 (3)
```

Khi nhấn vào biểu tượng chuông sẽ mở danh sách thông báo.

---

## Phòng Đào tạo

Thông báo cũng hiển thị tại biểu tượng Chuông trên Header.

---

# 5. Cấu trúc thông báo

Mỗi thông báo gồm:

- Tiêu đề
- Nội dung
- Thời gian tạo
- Loại thông báo
- Trạng thái đã đọc/chưa đọc

Ví dụ

```
Tiêu đề

Yêu cầu bổ sung minh chứng

------------------------

Nội dung

Hồ sơ CN000012 cần bổ sung minh chứng.

------------------------

Thời gian

15/07/2026 15:20
```

---

# 6. Quy tắc hiển thị

Danh sách hiển thị:

- Mới nhất trước.
- Cũ nhất sau.

Thông báo chưa đọc hiển thị nổi bật.

Thông báo đã đọc hiển thị bình thường.

---

# 7. Quy tắc đọc thông báo

Khi người dùng mở danh sách thông báo:

- Thông báo được đánh dấu là Đã đọc.

Không cần mở từng thông báo.

---

# 8. Điều hướng

Người dùng KHÔNG được phép nhấn vào nội dung thông báo.

Ví dụ:

```
🔔

Hồ sơ CN000001 đã được duyệt

```

Không mở:

- Chi tiết hồ sơ
- PDF
- Timeline

Để xem chi tiết, người dùng phải tự truy cập:

```
Hồ sơ đã gửi

↓

Chọn hồ sơ

↓

Xem chi tiết
```

Mục tiêu:

- Đơn giản giao diện.
- Không phát sinh Deep Link.
- Đồng nhất trải nghiệm người dùng.

---

# 9. Các sự kiện tạo thông báo

## 9.1 Sinh viên gửi hồ sơ

Người nhận

- Sinh viên

Loại

REQUEST_SUBMITTED

Ví dụ

```
Bạn đã gửi hồ sơ thành công.
```

---

## 9.2 Phòng Đào tạo yêu cầu bổ sung minh chứng

Người nhận

- Sinh viên

Loại

REQUEST_ADDITIONAL_DOCUMENTS

Ví dụ

```
Hồ sơ CN000012 cần bổ sung minh chứng.
```

---

## 9.3 Hồ sơ được duyệt

Người nhận

- Sinh viên

Loại

REQUEST_APPROVED

Ví dụ

```
Hồ sơ CN000012 đã được xử lý thành công.
```

---

## 9.4 Hồ sơ bị từ chối

Người nhận

- Sinh viên

Loại

REQUEST_REJECTED

Ví dụ

```
Hồ sơ CN000012 đã bị từ chối.
```

---

## 9.5 Sinh viên bổ sung minh chứng

Người nhận

- Phòng Đào tạo

Loại

REQUEST_SUPPLEMENTED

Ví dụ

```
Sinh viên đã bổ sung minh chứng cho hồ sơ CN000012.
```

---

## 9.6 Sinh viên hủy hồ sơ

Người nhận

- Phòng Đào tạo

Loại

REQUEST_CANCELLED

Ví dụ

```
Sinh viên đã hủy hồ sơ CN000012.
```

---

# 10. Notification Type

| Notification Type | Ý nghĩa |
|-------------------|----------|
| REQUEST_SUBMITTED | Sinh viên gửi hồ sơ |
| REQUEST_APPROVED | Hồ sơ được duyệt |
| REQUEST_REJECTED | Hồ sơ bị từ chối |
| REQUEST_ADDITIONAL_DOCUMENTS | Yêu cầu bổ sung minh chứng |
| REQUEST_SUPPLEMENTED | Sinh viên đã bổ sung minh chứng |
| REQUEST_CANCELLED | Hồ sơ đã bị hủy |

---

# 11. Main Workflow

```text
Workflow khác

↓

Thay đổi trạng thái hồ sơ

↓

Backend Commit Transaction

↓

Notification Service

↓

Tạo Notification

↓

Lưu Database

↓

Hiển thị Chuông

↓

Người dùng mở danh sách

↓

Đánh dấu Đã đọc
```

---

# 12. Database Mapping

## Bảng notifications

Lưu:

- Notification ID
- User ID
- Request ID (Nullable)
- Notification Type
- Title
- Content
- Is Read
- Created At

---

# 13. API Mapping

## Lấy danh sách

GET

```
/api/v1/notifications
```

---

## Đánh dấu đã đọc

PATCH

```
/api/v1/notifications/read
```

---

## Đếm số chưa đọc

GET

```
/api/v1/notifications/unread-count
```

---

# 14. Business Rules

## BR-NOTI-01

Thông báo chỉ được tạo sau khi Transaction nghiệp vụ thành công.

---

## BR-NOTI-02

Thông báo chỉ gửi đến người liên quan.

---

## BR-NOTI-03

Thông báo không được phép chỉnh sửa sau khi tạo.

---

## BR-NOTI-04

Người dùng chỉ xem được thông báo của chính mình.

---

## BR-NOTI-05

Thông báo không cho phép mở trực tiếp Chi tiết hồ sơ.

---

## BR-NOTI-06

Mỗi thay đổi trạng thái chỉ tạo một thông báo duy nhất.

---

# 15. Security

Backend luôn kiểm tra:

- JWT Authentication.
- User ID.
- Quyền truy cập Notification.

---

# 16. Logging

Ghi nhận:

- Notification ID
- User ID
- Notification Type
- Request ID
- Created At

---

# 17. Performance

Mục tiêu:

- Tạo Notification dưới 500ms.
- Hiển thị danh sách dưới 2 giây.
- Đếm thông báo chưa đọc dưới 500ms.

---

# 18. Workflow Summary

```text
Workflow nghiệp vụ

↓

Backend cập nhật trạng thái

↓

Commit Transaction

↓

Notification Service

↓

Tạo Notification

↓

Lưu Database

↓

Header hiển thị Badge

↓

Người dùng mở Chuông

↓

Đánh dấu Đã đọc

↓

Người dùng tự vào Hồ sơ đã gửi để xem chi tiết
```

---

# 19. Kiến trúc tích hợp

```text
submit-procedure
                │
                │
approve-request
                │
                │
reject-request
                │
                │
request-additional-documents
                │
                │
supplement-request
                │
                │
cancel-request
                │
                ▼
      Notification Service
                │
                ▼
        Notifications Table
                │
                ▼
       Header Notification Bell
```
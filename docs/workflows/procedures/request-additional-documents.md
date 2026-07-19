# Workflow: Yêu cầu bổ sung minh chứng

---

# 1. Mục đích

Workflow này mô tả quy trình Phòng Đào tạo yêu cầu sinh viên bổ sung minh chứng khi hồ sơ chưa đầy đủ hoặc cần cung cấp thêm tài liệu để tiếp tục xử lý.

Mục tiêu của Workflow:

- Cho phép Phòng Đào tạo yêu cầu bổ sung minh chứng.
- Gửi yêu cầu bổ sung đến sinh viên.
- Cập nhật trạng thái yêu cầu thủ tục.
- Cho phép sinh viên tiếp tục bổ sung minh chứng trên cùng một yêu cầu.
- Không tạo yêu cầu thủ tục mới.

Workflow này không kết thúc quy trình xử lý mà chỉ tạm dừng để chờ sinh viên bổ sung.

---

# 2. Actors

- Phòng Đào tạo

---

# 3. Trigger

Phòng Đào tạo nhấn nút **"Yêu cầu bổ sung minh chứng"** tại màn hình **Chi tiết yêu cầu thủ tục**.

---

# 4. Preconditions

- Phòng Đào tạo đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.
- Yêu cầu thủ tục tồn tại.
- Trạng thái hiện tại là **Đang xử lý**.

---

# 5. Postconditions

- Trạng thái yêu cầu được cập nhật thành **Chờ bổ sung minh chứng**.
- Nội dung yêu cầu bổ sung được lưu.
- Sinh viên nhận được thông báo.
- Sinh viên có thể bổ sung minh chứng trên chính yêu cầu này.

---

# 6. Main Workflow

## STEP 1

Phòng Đào tạo mở màn hình **Chi tiết yêu cầu thủ tục**.

---

## STEP 2

Phòng Đào tạo kiểm tra:

- Mẫu đơn.
- Kết quả AI Agent.
- Danh sách minh chứng.
- Timeline.

---

## STEP 3

Phòng Đào tạo nhấn nút **"Yêu cầu bổ sung minh chứng"**.

---

## STEP 4

Hệ thống hiển thị hộp thoại yêu cầu bổ sung.

Bao gồm:

- Nội dung yêu cầu bổ sung.
- Danh sách minh chứng cần bổ sung.
- Ghi chú.

---

## STEP 5

Phòng Đào tạo nhập nội dung.

Ví dụ:

> Vui lòng bổ sung bảng điểm học kỳ gần nhất.

> Vui lòng bổ sung Quyết định miễn nghĩa vụ quân sự.

> Vui lòng nộp bản scan có đầy đủ chữ ký.

---

## STEP 6

Phòng Đào tạo nhấn **"Gửi yêu cầu"**.

---

## STEP 7

Frontend gửi:

- Request ID.
- Nội dung yêu cầu.
- Danh sách minh chứng cần bổ sung.

đến Backend.

---

## STEP 8

Backend xác thực:

- JWT Authentication.
- Vai trò Phòng Đào tạo.

---

## STEP 9

Backend kiểm tra trạng thái hiện tại.

Chỉ cho phép khi:

- Đang xử lý.

---

## STEP 10

Backend cập nhật:

- Trạng thái = Chờ bổ sung minh chứng.

---

## STEP 11

Backend lưu yêu cầu bổ sung.

Bao gồm:

- Nội dung yêu cầu.
- Danh sách minh chứng cần bổ sung.
- Người yêu cầu.
- Thời gian yêu cầu.

---

## STEP 12

Backend cập nhật Timeline.

Ví dụ:

```text
Đã gửi yêu cầu

↓

Chờ tiếp nhận

↓

Đang xử lý

↓

Chờ bổ sung minh chứng
```

---

## STEP 13

Backend tạo thông báo cho sinh viên.

Ví dụ:

> Phòng Đào tạo yêu cầu bạn bổ sung minh chứng cho yêu cầu thủ tục.

---

## STEP 14

Backend ghi Audit Log.

---

## STEP 15

Frontend hiển thị:

> Đã gửi yêu cầu bổ sung minh chứng.

Workflow kết thúc.

---

# 7. Sau Workflow này

Khi sinh viên đăng nhập:

- Mở Hồ sơ đã gửi.
- Chọn yêu cầu thủ tục.
- Xem nội dung yêu cầu bổ sung.
- Bổ sung minh chứng.
- Gửi lại.

Sau khi gửi lại:

Hệ thống cập nhật trạng thái thành:

**Chờ tiếp nhận**

để Phòng Đào tạo tiếp tục xử lý.

---

# 8. Alternative Flow

## AF-01

Phòng Đào tạo nhấn **"Hủy"**.

Hệ thống đóng hộp thoại.

Workflow kết thúc.

---

# 9. Exception Flow

## EX-01

Phiên đăng nhập hết hạn.

Hệ thống chuyển về màn hình Đăng nhập.

---

## EX-02

Không tìm thấy yêu cầu.

Thông báo:

> Không tìm thấy yêu cầu thủ tục.

---

## EX-03

Yêu cầu không ở trạng thái Đang xử lý.

Thông báo:

> Không thể yêu cầu bổ sung minh chứng ở trạng thái hiện tại.

---

## EX-04

Nội dung yêu cầu bổ sung để trống.

Thông báo:

> Vui lòng nhập nội dung yêu cầu bổ sung.

---

## EX-05

Lỗi cập nhật dữ liệu.

Thông báo:

> Không thể gửi yêu cầu bổ sung. Vui lòng thử lại sau.

---

# 10. Business Rules

## BR-RAD-01

Chỉ người dùng có vai trò Phòng Đào tạo được phép yêu cầu bổ sung.

---

## BR-RAD-02

Chỉ yêu cầu ở trạng thái **Đang xử lý** mới được phép yêu cầu bổ sung.

---

## BR-RAD-03

Bắt buộc nhập nội dung yêu cầu bổ sung.

---

## BR-RAD-04

Yêu cầu bổ sung không tạo yêu cầu thủ tục mới.

---

## BR-RAD-05

Sau khi sinh viên bổ sung và gửi lại, trạng thái tự động chuyển thành:

**Chờ tiếp nhận**

---

## BR-RAD-06

Toàn bộ lịch sử yêu cầu bổ sung phải được lưu trong Timeline.

---

# 11. Giao diện

Hiển thị nút:

**Yêu cầu bổ sung minh chứng**

Chỉ hiển thị khi trạng thái là:

- Đang xử lý

Popup gồm:

- Textarea nội dung yêu cầu.
- Danh sách minh chứng cần bổ sung (tùy chọn).
- Gửi yêu cầu.
- Hủy.

---

# 12. API Mapping

Workflow sử dụng:

POST /api/v1/admin/procedure-requests/{requestId}/request-additional-documents

---

# 13. Database Mapping

Đọc:

- procedure_requests

Cập nhật:

- procedure_requests.status

Ghi:

- procedure_request_additional_documents
- procedure_request_timelines
- notifications
- audit_logs

---

# 14. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Vai trò Phòng Đào tạo.
- Quyền xử lý.
- Trạng thái hiện tại.

---

# 15. Logging

Ghi nhận:

- User ID
- Request ID
- Action: Request Additional Documents
- Content
- Timestamp

---

# 16. Performance

Mục tiêu:

- Thời gian xử lý dưới 2 giây.
- Toàn bộ cập nhật được thực hiện trong một Transaction.

---

# 17. Workflow Summary

```text
Phòng Đào tạo

↓

Mở Chi tiết yêu cầu

↓

Kiểm tra hồ sơ

↓

Nhấn "Yêu cầu bổ sung minh chứng"

↓

Nhập nội dung

↓

Gửi yêu cầu

↓

Backend xác thực

↓

Kiểm tra trạng thái

↓

Cập nhật = Chờ bổ sung minh chứng

↓

Lưu nội dung yêu cầu

↓

Ghi Timeline

↓

Tạo thông báo

↓

Frontend hiển thị thành công

↓

Workflow kết thúc

↓

Sinh viên bổ sung minh chứng

↓

Gửi lại yêu cầu

↓

Trạng thái = Chờ tiếp nhận

↓

Phòng Đào tạo tiếp tục xử lý
```

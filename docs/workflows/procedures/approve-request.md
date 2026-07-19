# Workflow: Duyệt yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình Phòng Đào tạo duyệt một yêu cầu thủ tục sau khi đã kiểm tra đầy đủ thông tin, mẫu đơn và các minh chứng do sinh viên cung cấp.

Mục tiêu của Workflow:

- Cho phép Phòng Đào tạo xác nhận yêu cầu hợp lệ.
- Cập nhật trạng thái yêu cầu thành **Đã hoàn thành**.
- Ghi nhận lịch sử xử lý của yêu cầu.
- Thông báo kết quả cho sinh viên.

Workflow này là bước kết thúc quá trình xử lý một yêu cầu thủ tục.

---

# 2. Actors

- Phòng Đào tạo

---

# 3. Trigger

Phòng Đào tạo nhấn nút **"Duyệt yêu cầu"** tại màn hình **Chi tiết yêu cầu thủ tục**.

---

# 4. Preconditions

- Phòng Đào tạo đã đăng nhập.
- Phiên đăng nhập còn hiệu lực.
- Yêu cầu thủ tục tồn tại.
- Trạng thái hiện tại của yêu cầu là **Đang xử lý**.

---

# 5. Postconditions

- Trạng thái yêu cầu được cập nhật thành **Đã hoàn thành**.
- Timeline xử lý được cập nhật.
- Hệ thống ghi nhận người xử lý và thời gian hoàn thành.
- Sinh viên có thể xem kết quả xử lý.

---

# 6. Main Workflow

## STEP 1

Phòng Đào tạo mở màn hình **Chi tiết yêu cầu thủ tục**.

---

## STEP 2

Phòng Đào tạo kiểm tra:

- Thông tin sinh viên.
- Mẫu đơn.
- Kết quả AI Agent.
- Danh sách minh chứng.
- Timeline xử lý.

---

## STEP 3

Phòng Đào tạo nhấn nút **"Duyệt yêu cầu"**.

---

## STEP 4

Hệ thống hiển thị hộp thoại xác nhận.

Ví dụ:

> Bạn có chắc chắn muốn duyệt yêu cầu thủ tục này không?

Lựa chọn:

- Đồng ý
- Hủy

---

## STEP 5

Phòng Đào tạo chọn **"Đồng ý"**.

---

## STEP 6

Frontend gửi Request ID đến Backend.

---

## STEP 7

Backend xác thực:

- JWT Authentication.
- Vai trò Phòng Đào tạo.

---

## STEP 8

Backend kiểm tra trạng thái hiện tại của yêu cầu.

Chỉ cho phép duyệt khi trạng thái là:

- Đang xử lý

---

## STEP 9

Backend cập nhật:

- Trạng thái = Đã hoàn thành.
- Người xử lý.
- Thời gian hoàn thành.

---

## STEP 10

Backend cập nhật Timeline.

Ví dụ:

```text
Đã gửi yêu cầu

↓

Chờ tiếp nhận

↓

Đang xử lý

↓

Đã hoàn thành
```

---

## STEP 11

Backend ghi Audit Log.

---

## STEP 12

Backend tạo thông báo cho sinh viên.

Ví dụ:

> Yêu cầu thủ tục của bạn đã được Phòng Đào tạo xử lý hoàn thành.

---

## STEP 13

Frontend hiển thị:

> Duyệt yêu cầu thành công.

Workflow kết thúc.

---

# 7. Alternative Flow

## AF-01

Phòng Đào tạo chọn **"Hủy"** tại hộp thoại xác nhận.

Hệ thống đóng hộp thoại.

Quay lại màn hình Chi tiết yêu cầu.

Workflow kết thúc.

---

# 8. Exception Flow

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

> Không thể duyệt yêu cầu ở trạng thái hiện tại.

---

## EX-04

Lỗi cập nhật dữ liệu.

Thông báo:

> Không thể duyệt yêu cầu. Vui lòng thử lại sau.

---

# 9. Business Rules

## BR-AR-01

Chỉ người dùng có vai trò Phòng Đào tạo được phép duyệt.

---

## BR-AR-02

Chỉ yêu cầu ở trạng thái **Đang xử lý** mới được phép duyệt.

---

## BR-AR-03

Sau khi duyệt thành công, trạng thái chuyển thành **Đã hoàn thành**.

---

## BR-AR-04

Sau khi hoàn thành, yêu cầu không được phép chỉnh sửa hoặc xử lý lại.

---

## BR-AR-05

Hệ thống phải lưu:

- Người xử lý.
- Thời gian xử lý.
- Timeline.

---

# 10. Giao diện

Hiển thị nút:

**Duyệt yêu cầu**

Chỉ hiển thị khi trạng thái là:

- Đang xử lý.

---

# 11. API Mapping

Workflow sử dụng:

POST /api/v1/admin/procedure-requests/{requestId}/approve

---

# 12. Database Mapping

Đọc:

- procedure_requests

Cập nhật:

- procedure_requests.status
- procedure_requests.completed_at
- procedure_requests.completed_by

Ghi:

- procedure_request_timelines
- notifications
- audit_logs

---

# 13. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Vai trò Phòng Đào tạo.
- Quyền xử lý.
- Trạng thái hiện tại của yêu cầu.

---

# 14. Logging

Ghi nhận:

- User ID
- Request ID
- Action: Approve Procedure Request
- Previous Status
- New Status
- Timestamp

---

# 15. Performance

Mục tiêu:

- Thời gian xử lý dưới 2 giây.
- Toàn bộ cập nhật được thực hiện trong một Transaction.

---

# 16. Workflow Summary

```text
Phòng Đào tạo

↓

Mở Chi tiết yêu cầu

↓

Kiểm tra hồ sơ

↓

Nhấn Duyệt yêu cầu

↓

Xác nhận

↓

Backend xác thực

↓

Kiểm tra trạng thái

↓

Cập nhật = Đã hoàn thành

↓

Ghi Timeline

↓

Ghi Audit Log

↓

Tạo thông báo

↓

Frontend hiển thị thành công

↓

Workflow kết thúc
```
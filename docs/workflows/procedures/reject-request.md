# Workflow: Từ chối yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình Phòng Đào tạo từ chối một yêu cầu thủ tục khi hồ sơ không đáp ứng quy định hoặc không đủ điều kiện để tiếp tục xử lý.

Mục tiêu của Workflow:

- Cho phép Phòng Đào tạo từ chối yêu cầu thủ tục.
- Yêu cầu nhập lý do từ chối.
- Cập nhật trạng thái yêu cầu thành **Đã từ chối**.
- Ghi nhận lịch sử xử lý.
- Thông báo kết quả cho sinh viên.

Workflow này là một trạng thái kết thúc của yêu cầu thủ tục.

---

# 2. Actors

- Phòng Đào tạo

---

# 3. Trigger

Phòng Đào tạo nhấn nút **"Từ chối yêu cầu"** tại màn hình **Chi tiết yêu cầu thủ tục**.

---

# 4. Preconditions

- Phòng Đào tạo đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.
- Yêu cầu thủ tục tồn tại.
- Trạng thái hiện tại là **Đang xử lý**.

---

# 5. Postconditions

- Trạng thái yêu cầu được cập nhật thành **Đã từ chối**.
- Lý do từ chối được lưu.
- Timeline được cập nhật.
- Sinh viên có thể xem lý do từ chối.

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
- Minh chứng.
- Timeline.

---

## STEP 3

Phòng Đào tạo nhấn nút **"Từ chối yêu cầu"**.

---

## STEP 4

Hệ thống hiển thị hộp thoại từ chối.

Bao gồm:

- Ô nhập **Lý do từ chối**.
- Nút **Xác nhận**.
- Nút **Hủy**.

---

## STEP 5

Phòng Đào tạo nhập lý do từ chối.

Ví dụ:

- Không đáp ứng điều kiện chuyển ngành.
- Minh chứng không hợp lệ.
- Hồ sơ không đúng quy định.

---

## STEP 6

Phòng Đào tạo nhấn **"Xác nhận"**.

---

## STEP 7

Frontend gửi:

- Request ID.
- Lý do từ chối.

đến Backend.

---

## STEP 8

Backend xác thực:

- JWT Authentication.
- Vai trò Phòng Đào tạo.

---

## STEP 9

Backend kiểm tra trạng thái hiện tại.

Chỉ cho phép từ chối khi trạng thái là:

- Đang xử lý.

---

## STEP 10

Backend cập nhật:

- Trạng thái = Đã từ chối.
- Lý do từ chối.
- Người xử lý.
- Thời gian xử lý.

---

## STEP 11

Backend cập nhật Timeline.

Ví dụ:

```text
Đã gửi yêu cầu

↓

Chờ tiếp nhận

↓

Đang xử lý

↓

Đã từ chối
```

---

## STEP 12

Backend ghi Audit Log.

---

## STEP 13

Backend tạo thông báo cho sinh viên.

Ví dụ:

> Yêu cầu thủ tục của bạn đã bị từ chối.

---

## STEP 14

Frontend hiển thị:

> Từ chối yêu cầu thành công.

Workflow kết thúc.

---

# 7. Alternative Flow

## AF-01

Phòng Đào tạo nhấn **"Hủy"**.

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

> Không thể từ chối yêu cầu ở trạng thái hiện tại.

---

## EX-04

Lý do từ chối để trống.

Thông báo:

> Vui lòng nhập lý do từ chối.

Quay lại bước 4.

---

## EX-05

Lỗi cập nhật dữ liệu.

Thông báo:

> Không thể từ chối yêu cầu. Vui lòng thử lại sau.

---

# 9. Business Rules

## BR-RR-01

Chỉ người dùng có vai trò Phòng Đào tạo được phép từ chối.

---

## BR-RR-02

Chỉ yêu cầu ở trạng thái **Đang xử lý** mới được phép từ chối.

---

## BR-RR-03

Bắt buộc nhập lý do từ chối.

---

## BR-RR-04

Sau khi từ chối, yêu cầu chuyển sang trạng thái **Đã từ chối**.

---

## BR-RR-05

Lý do từ chối phải được lưu và hiển thị cho sinh viên.

---

## BR-RR-06

Sau khi từ chối, yêu cầu không được phép xử lý lại.

---

# 10. Giao diện

Hiển thị nút:

**Từ chối yêu cầu**

Chỉ hiển thị khi trạng thái là:

- Đang xử lý.

Popup gồm:

- Textarea nhập lý do.
- Xác nhận.
- Hủy.

---

# 11. API Mapping

Workflow sử dụng:

POST /api/v1/admin/procedure-requests/{requestId}/reject

---

# 12. Database Mapping

Đọc:

- procedure_requests

Cập nhật:

- procedure_requests.status
- procedure_requests.reject_reason
- procedure_requests.completed_by
- procedure_requests.completed_at

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
- Trạng thái hiện tại.

---

# 14. Logging

Ghi nhận:

- User ID
- Request ID
- Action: Reject Procedure Request
- Reject Reason
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

Nhấn "Từ chối yêu cầu"

↓

Nhập lý do

↓

Xác nhận

↓

Backend xác thực

↓

Kiểm tra trạng thái

↓

Cập nhật = Đã từ chối

↓

Lưu lý do từ chối

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

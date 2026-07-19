# Workflow: Hủy yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình sinh viên hủy một yêu cầu thủ tục đã gửi khi Phòng Đào tạo chưa tiếp nhận xử lý.

Workflow được kích hoạt từ màn hình **Chi tiết yêu cầu thủ tục**.

Mục tiêu của Workflow:

- Cho phép sinh viên hủy yêu cầu khi không còn nhu cầu thực hiện.
- Cập nhật trạng thái yêu cầu thành **Đã hủy**.
- Ghi nhận lịch sử thay đổi trạng thái.
- Không làm mất dữ liệu của yêu cầu thủ tục.

Workflow này không xóa yêu cầu thủ tục khỏi hệ thống.

---

# 2. Actors

- Sinh viên

---

# 3. Trigger

Sinh viên nhấn nút **"Hủy yêu cầu"** tại màn hình **Chi tiết yêu cầu thủ tục**.

---

# 4. Preconditions

- Sinh viên đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.
- Yêu cầu thủ tục tồn tại trong hệ thống.
- Yêu cầu thủ tục thuộc quyền sở hữu của sinh viên.
- Trạng thái hiện tại của yêu cầu là **Chờ tiếp nhận**.

---

# 5. Postconditions

- Trạng thái yêu cầu được cập nhật thành **Đã hủy**.
- Timeline xử lý được cập nhật.
- Yêu cầu thủ tục vẫn được lưu trong hệ thống.
- Sinh viên có thể tạo yêu cầu thủ tục mới.

---

# 6. Main Workflow

## STEP 1

Sinh viên mở màn hình **Chi tiết yêu cầu thủ tục**.

---

## STEP 2

Sinh viên nhấn nút **"Hủy yêu cầu"**.

---

## STEP 3

Hệ thống hiển thị hộp thoại xác nhận.

Ví dụ:

> Bạn có chắc chắn muốn hủy yêu cầu thủ tục này không?

Các lựa chọn:

- Đồng ý
- Hủy

---

## STEP 4

Sinh viên chọn **"Đồng ý"**.

---

## STEP 5

Frontend gửi Request ID đến Backend.

---

## STEP 6

Backend xác thực phiên đăng nhập.

Bao gồm:

- JWT Authentication.
- Student ID.

---

## STEP 7

Backend kiểm tra quyền sở hữu yêu cầu thủ tục.

Chỉ cho phép chủ sở hữu thực hiện thao tác hủy.

---

## STEP 8

Backend kiểm tra trạng thái hiện tại của yêu cầu.

Chỉ cho phép hủy khi trạng thái là:

- Chờ tiếp nhận

---

## STEP 9

Backend cập nhật trạng thái yêu cầu thành:

**Đã hủy**

Không xóa dữ liệu của yêu cầu.

---

## STEP 10

Backend ghi nhận lịch sử thay đổi trạng thái vào Timeline.

Ví dụ:

```text
Đã gửi yêu cầu

↓

Chờ tiếp nhận

↓

Đã hủy
```

---

## STEP 11

Backend ghi Log hệ thống.

---

## STEP 12

Backend trả kết quả thành công.

---

## STEP 13

Frontend hiển thị thông báo.

> Hủy yêu cầu thủ tục thành công.

Đồng thời cập nhật trạng thái mới trên giao diện.

Workflow kết thúc.

---

# 7. Alternative Flow

## AF-01

Sinh viên chọn **"Hủy"** tại hộp thoại xác nhận.

Hệ thống đóng hộp thoại.

Quay lại màn hình Chi tiết yêu cầu thủ tục.

Workflow kết thúc.

---

# 8. Exception Flow

## EX-01

Phiên đăng nhập hết hạn.

Hệ thống chuyển về màn hình Đăng nhập.

---

## EX-02

Không tìm thấy yêu cầu thủ tục.

Hệ thống hiển thị:

> Không tìm thấy yêu cầu thủ tục.

Workflow kết thúc.

---

## EX-03

Sinh viên không phải chủ sở hữu yêu cầu.

Hệ thống hiển thị:

> Bạn không có quyền thực hiện thao tác này.

Workflow kết thúc.

---

## EX-04

Yêu cầu đã được Phòng Đào tạo tiếp nhận hoặc đang xử lý.

Hệ thống hiển thị:

> Không thể hủy yêu cầu vì Phòng Đào tạo đã tiếp nhận xử lý.

Workflow kết thúc.

---

## EX-05

Yêu cầu đã hoàn thành, đã từ chối hoặc đã hủy.

Hệ thống hiển thị:

> Yêu cầu này không thể hủy.

Workflow kết thúc.

---

## EX-06

Lỗi hệ thống.

Hệ thống hiển thị:

> Không thể hủy yêu cầu. Vui lòng thử lại sau.

Workflow kết thúc.

---

# 9. Business Rules

## BR-CR-01

Sinh viên chỉ được hủy các yêu cầu thủ tục do chính mình gửi.

---

## BR-CR-02

Chỉ được phép hủy yêu cầu khi trạng thái hiện tại là **Chờ tiếp nhận**.

---

## BR-CR-03

Sau khi Phòng Đào tạo tiếp nhận xử lý, sinh viên không được phép hủy yêu cầu.

---

## BR-CR-04

Hủy yêu cầu chỉ cập nhật trạng thái sang **Đã hủy**.

Không được xóa dữ liệu khỏi hệ thống.

---

## BR-CR-05

Sau khi hủy yêu cầu, hệ thống phải ghi nhận Timeline xử lý.

---

## BR-CR-06

Sau khi hủy yêu cầu, sinh viên được phép tạo một yêu cầu thủ tục mới.

---

## BR-CR-07

Yêu cầu đã hủy không được phép khôi phục.

Nếu muốn tiếp tục thực hiện thủ tục, sinh viên phải tạo một yêu cầu mới.

---

# 10. Giao diện

Nút **"Hủy yêu cầu"** chỉ hiển thị khi:

- Trạng thái = **Chờ tiếp nhận**

Các trạng thái sau sẽ không hiển thị nút hủy:

- Đang xử lý
- Đã hoàn thành
- Đã từ chối
- Đã hủy

---

# 11. Timeline

Sau khi hủy thành công, Timeline được cập nhật.

Ví dụ:

```text
Đã gửi yêu cầu

↓

Chờ tiếp nhận

↓

Đã hủy
```

---

# 12. API Mapping

Workflow sử dụng:

POST /api/v1/procedure-requests/{requestId}/cancel

---

# 13. Database Mapping

Workflow đọc dữ liệu từ:

- procedure_requests

Workflow cập nhật:

- procedure_requests.status
- procedure_requests.updated_at

Workflow ghi dữ liệu vào:

- procedure_request_timelines
- audit_logs

---

# 14. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Student ID.
- Quyền sở hữu yêu cầu thủ tục.
- Trạng thái hiện tại của yêu cầu.

Không cho phép người dùng hủy yêu cầu của người khác.

---

# 15. Logging

Ghi nhận:

- Student ID
- Request ID
- Action: Cancel Procedure Request
- Previous Status
- New Status
- Timestamp
- Result

---

# 16. Performance

Mục tiêu:

- Thời gian xử lý dưới 2 giây.
- Cập nhật trạng thái và Timeline theo giao dịch (Transaction) để đảm bảo tính toàn vẹn dữ liệu.

---

# 17. Workflow Summary

```text
Sinh viên

↓

Mở Chi tiết yêu cầu thủ tục

↓

Nhấn "Hủy yêu cầu"

↓

Xác nhận hủy

↓

Frontend gửi Request ID

↓

Backend xác thực

↓

Kiểm tra quyền sở hữu

↓

Kiểm tra trạng thái

↓

Cập nhật trạng thái = Đã hủy

↓

Ghi Timeline

↓

Ghi Log

↓

Trả kết quả

↓

Frontend cập nhật giao diện

↓

Workflow kết thúc
```
# Workflow: Xem chi tiết yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình sinh viên xem thông tin chi tiết của một yêu cầu thủ tục đã gửi.

Workflow được kích hoạt khi sinh viên chọn một yêu cầu thủ tục trong màn hình **"Hồ sơ đã gửi"**.

Mục tiêu của Workflow:

- Hiển thị đầy đủ thông tin của yêu cầu thủ tục.
- Hiển thị trạng thái xử lý hiện tại.
- Hiển thị tiến độ xử lý dưới dạng Timeline.
- Hiển thị mẫu đơn đã gửi.
- Hiển thị các file minh chứng đã nộp.

Workflow này chỉ có chức năng tra cứu thông tin và không làm thay đổi dữ liệu của hệ thống.

---

# 2. Actors

- Sinh viên

---

# 3. Trigger

Sinh viên chọn một yêu cầu thủ tục trong danh sách tại màn hình **"Hồ sơ đã gửi"**.

---

# 4. Preconditions

- Sinh viên đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.
- Yêu cầu thủ tục tồn tại trong hệ thống.
- Yêu cầu thủ tục thuộc quyền sở hữu của sinh viên hiện tại.

---

# 5. Postconditions

Thông tin chi tiết của yêu cầu thủ tục được hiển thị đầy đủ.

Sinh viên có thể:

- Xem thông tin yêu cầu.
- Xem mẫu đơn đã gửi.
- Xem các file minh chứng.
- Theo dõi trạng thái và tiến độ xử lý hiện tại.

---

# 6. Main Workflow

## STEP 1

Sinh viên truy cập màn hình **"Hồ sơ đã gửi"**.

---

## STEP 2

Sinh viên chọn một yêu cầu thủ tục trong danh sách.

---

## STEP 3

Frontend gửi Request ID đến Backend.

---

## STEP 4

Backend xác thực phiên đăng nhập của sinh viên.

Nếu phiên đăng nhập không hợp lệ thì kết thúc Workflow.

---

## STEP 5

Backend kiểm tra quyền truy cập.

Chỉ cho phép sinh viên xem các yêu cầu thủ tục do chính mình gửi.

Nếu không có quyền truy cập thì trả về lỗi 403.

---

## STEP 6

Backend truy xuất thông tin chi tiết của yêu cầu thủ tục.

Bao gồm:

- Mã yêu cầu
- Loại thủ tục
- Ngày tạo
- Ngày gửi
- Trạng thái hiện tại
- Thời gian cập nhật gần nhất

---

## STEP 7

Backend truy xuất mẫu đơn của yêu cầu thủ tục.

Hiển thị:

- File PDF
- File Word

---

## STEP 8

Backend truy xuất danh sách các file minh chứng đã nộp.

Hiển thị:

- Tên file
- Loại file
- Thời gian tải lên

---

## STEP 9

Backend truy xuất tiến độ xử lý của yêu cầu thủ tục.

Hiển thị dưới dạng Timeline.

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

Trạng thái hiện tại được đánh dấu nổi bật.

---

## STEP 10

Frontend hiển thị toàn bộ thông tin lên màn hình.

Bao gồm:

### Thông tin chung

- Mã yêu cầu
- Loại thủ tục
- Ngày gửi
- Trạng thái hiện tại

### Tiến độ xử lý

Timeline xử lý của yêu cầu thủ tục.

### Mẫu đơn

- PDF
- Word

### Minh chứng

Danh sách các file minh chứng đã nộp.

---

## STEP 11

Sinh viên xem thông tin và kết thúc Workflow.

---

# 7. Alternative Flow

## AF-01

Sinh viên quay lại màn hình **"Hồ sơ đã gửi"**.

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

Quay lại danh sách hồ sơ.

---

## EX-03

Sinh viên không có quyền xem yêu cầu thủ tục.

Hệ thống hiển thị:

> Bạn không có quyền truy cập yêu cầu thủ tục này.

Workflow kết thúc.

---

## EX-04

Không thể tải dữ liệu.

Hệ thống hiển thị:

> Không thể tải thông tin yêu cầu thủ tục. Vui lòng thử lại sau.

Quay lại danh sách hồ sơ.

---

# 9. Business Rules

## BR-RD-01

Sinh viên chỉ được phép xem các yêu cầu thủ tục do chính mình gửi.

---

## BR-RD-02

Thông tin hiển thị chỉ có quyền đọc (Read Only).

---

## BR-RD-03

Tiến độ xử lý phải luôn đồng bộ với trạng thái hiện tại của hệ thống.

---

## BR-RD-04

Mẫu đơn hiển thị là phiên bản cuối cùng đã được gửi đến Phòng Đào tạo.

---

## BR-RD-05

Danh sách minh chứng hiển thị đúng các file đã được gửi cùng yêu cầu thủ tục.

---

# 10. Giao diện

Trang chi tiết bao gồm các khu vực sau:

## Thông tin yêu cầu

- Mã yêu cầu
- Loại thủ tục
- Ngày gửi
- Trạng thái hiện tại

---

## Tiến độ xử lý

Hiển thị Timeline của yêu cầu thủ tục.

---

## Mẫu đơn

- Xem PDF
- Tải PDF
- Tải Word

---

## Minh chứng

Danh sách các file minh chứng đã gửi.

---

# 11. API Mapping

Workflow sử dụng:

GET /api/v1/procedure-requests/{requestId}

---

# 12. Database Mapping

Workflow đọc dữ liệu từ:

- procedure_requests
- procedure_request_files
- procedure_request_timelines
- procedure_templates

Workflow không ghi dữ liệu.

---

# 13. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Student ID.
- Quyền sở hữu yêu cầu thủ tục.

Không cho phép sinh viên xem yêu cầu thủ tục của người khác.

---

# 14. Logging

Ghi nhận:

- Student ID
- Request ID
- Timestamp
- Action: View Procedure Request Detail
- Result

---

# 15. Performance

Mục tiêu:

- Thời gian hiển thị thông tin dưới 2 giây.
- Thời gian tải Timeline dưới 2 giây.
- Chỉ tải thông tin cần thiết của yêu cầu thủ tục.

---

# 16. Workflow Summary

```text
Sinh viên

↓

Mở "Hồ sơ đã gửi"

↓

Chọn một yêu cầu thủ tục

↓

Frontend gửi Request ID

↓

Backend xác thực

↓

Kiểm tra quyền truy cập

↓

Lấy thông tin yêu cầu

↓

Lấy Timeline xử lý

↓

Lấy mẫu đơn

↓

Lấy danh sách minh chứng

↓

Frontend hiển thị

↓

Sinh viên theo dõi yêu cầu thủ tục
```
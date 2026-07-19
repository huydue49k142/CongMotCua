# Workflow: Xem danh sách yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình sinh viên xem danh sách các yêu cầu thủ tục đã gửi.

Workflow được kích hoạt khi sinh viên chọn mục **"Hồ sơ đã gửi"** trên thanh Sidebar.

Mục tiêu của Workflow:

- Hiển thị toàn bộ các yêu cầu thủ tục của sinh viên.
- Hiển thị thông tin tóm tắt của từng yêu cầu.
- Hiển thị trạng thái xử lý hiện tại của từng yêu cầu.
- Cho phép sinh viên chọn một yêu cầu để xem thông tin chi tiết.

Workflow này chỉ có chức năng tra cứu thông tin và không làm thay đổi dữ liệu của hệ thống.

---

# 2. Actors

- Sinh viên

---

# 3. Trigger

Sinh viên chọn menu **"Hồ sơ đã gửi"** trên thanh Sidebar.

---

# 4. Preconditions

- Sinh viên đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.

---

# 5. Postconditions

Danh sách các yêu cầu thủ tục của sinh viên được hiển thị.

Sinh viên có thể chọn một yêu cầu thủ tục để xem chi tiết.

---

# 6. Main Workflow

## STEP 1

Sinh viên chọn menu **"Hồ sơ đã gửi"**.

---

## STEP 2

Frontend gửi yêu cầu lấy danh sách yêu cầu thủ tục của sinh viên.

---

## STEP 3

Backend xác thực phiên đăng nhập.

Bao gồm:

- Kiểm tra JWT.
- Kiểm tra trạng thái tài khoản.
- Xác định Student ID.

Nếu phiên đăng nhập không hợp lệ thì kết thúc Workflow.

---

## STEP 4

Backend truy xuất toàn bộ yêu cầu thủ tục của sinh viên hiện tại.

Chỉ lấy các yêu cầu thuộc Student ID đang đăng nhập.

---

## STEP 5

Backend lấy thông tin tóm tắt của từng yêu cầu.

Bao gồm:

- Mã yêu cầu
- Loại thủ tục
- Ngày gửi
- Trạng thái hiện tại
- Thời gian cập nhật gần nhất

---

## STEP 6

Backend sắp xếp danh sách theo:

- Ngày gửi mới nhất.
- Nếu cùng ngày thì ưu tiên thời gian cập nhật gần nhất.

---

## STEP 7

Backend trả dữ liệu cho Frontend.

---

## STEP 8

Frontend hiển thị danh sách các yêu cầu thủ tục.

Mỗi yêu cầu hiển thị:

- Mã yêu cầu
- Loại thủ tục
- Ngày gửi
- Trạng thái hiện tại
- Thời gian cập nhật gần nhất

---

## STEP 9

Sinh viên chọn một yêu cầu thủ tục.

Hệ thống chuyển sang Workflow:

**request-detail.md**

---

# 7. Alternative Flow

## AF-01

Sinh viên quay lại Trang chủ.

Workflow kết thúc.

---

# 8. Exception Flow

## EX-01

Phiên đăng nhập hết hạn.

Hệ thống chuyển về màn hình Đăng nhập.

---

## EX-02

Sinh viên chưa có yêu cầu thủ tục nào.

Hệ thống hiển thị:

> Bạn chưa có yêu cầu thủ tục nào đã gửi.

Workflow kết thúc.

---

## EX-03

Không thể truy xuất dữ liệu.

Hệ thống hiển thị:

> Không thể tải danh sách yêu cầu thủ tục. Vui lòng thử lại sau.

Workflow kết thúc.

---

# 9. Business Rules

## BR-RL-01

Sinh viên chỉ được phép xem các yêu cầu thủ tục do chính mình gửi.

---

## BR-RL-02

Danh sách chỉ hiển thị các yêu cầu chưa bị xóa logic (Soft Delete).

---

## BR-RL-03

Danh sách mặc định được sắp xếp theo thời gian gửi giảm dần.

---

## BR-RL-04

Thông tin hiển thị chỉ có quyền đọc (Read Only).

---

## BR-RL-05

Mỗi yêu cầu thủ tục chỉ có duy nhất một trạng thái hiện tại.

---

# 10. Giao diện

Mỗi dòng trong danh sách bao gồm:

- Mã yêu cầu
- Loại thủ tục
- Ngày gửi
- Trạng thái hiện tại
- Thời gian cập nhật gần nhất

Sinh viên có thể nhấn vào bất kỳ yêu cầu nào để xem thông tin chi tiết.

---

# 11. Trạng thái yêu cầu thủ tục

Hệ thống hỗ trợ các trạng thái sau:

| Trạng thái | Ý nghĩa |
|------------|----------|
| Chờ xác nhận sinh viên | AI Agent đã tạo hồ sơ và đang chờ sinh viên xác nhận trước khi gửi |
| Chờ tiếp nhận | Hồ sơ đã được gửi thành công và đang chờ Phòng Đào tạo tiếp nhận |
| Đang xử lý | Phòng Đào tạo đang xử lý yêu cầu |
| Đã hoàn thành | Yêu cầu đã được xử lý hoàn tất |
| Đã từ chối | Phòng Đào tạo từ chối xử lý yêu cầu |
| Đã hủy | Sinh viên đã hủy yêu cầu trước khi Phòng Đào tạo tiếp nhận |

---

# 12. API Mapping

Workflow sử dụng:

GET /api/v1/procedure-requests

---

# 13. Database Mapping

Workflow đọc dữ liệu từ:

- procedure_requests
- procedure_types

Workflow không ghi dữ liệu.

---

# 14. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Student ID.

Chỉ trả về các yêu cầu thủ tục thuộc sinh viên đang đăng nhập.

---

# 15. Logging

Ghi nhận:

- Student ID
- Timestamp
- Action: View Procedure Request List
- Result

---

# 16. Performance

Mục tiêu:

- Thời gian phản hồi dưới 2 giây.
- Chỉ tải dữ liệu tóm tắt của yêu cầu thủ tục.
- Không tải PDF, Word hoặc file minh chứng tại màn hình này.

---

# 17. Workflow Summary

```text
Sinh viên

↓

Chọn "Hồ sơ đã gửi"

↓

Frontend gửi yêu cầu

↓

Backend xác thực

↓

Truy xuất danh sách yêu cầu thủ tục

↓

Sắp xếp dữ liệu

↓

Trả kết quả

↓

Frontend hiển thị danh sách

↓

Sinh viên chọn một yêu cầu

↓

Workflow: request-detail.md
```
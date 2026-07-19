# Workflow: Xem danh sách yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình Phòng Đào tạo xem danh sách các yêu cầu thủ tục do sinh viên gửi đến hệ thống.

Mục tiêu của Workflow:

- Hiển thị toàn bộ yêu cầu thủ tục đang được quản lý.
- Hiển thị trạng thái xử lý hiện tại của từng yêu cầu.
- Cho phép Phòng Đào tạo lựa chọn một yêu cầu để xem thông tin chi tiết và thực hiện xử lý.

Workflow này chỉ có chức năng tra cứu thông tin và không làm thay đổi dữ liệu của hệ thống.

---

# 2. Actors

- Phòng Đào tạo

---

# 3. Trigger

Phòng Đào tạo chọn menu **"Quản lý yêu cầu thủ tục"** trên thanh Sidebar.

---

# 4. Preconditions

- Phòng Đào tạo đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.

---

# 5. Postconditions

Danh sách các yêu cầu thủ tục được hiển thị.

Phòng Đào tạo có thể chọn một yêu cầu để xem chi tiết và thực hiện các nghiệp vụ xử lý.

---

# 6. Main Workflow

## STEP 1

Phòng Đào tạo chọn menu **"Quản lý yêu cầu thủ tục"**.

---

## STEP 2

Frontend gửi yêu cầu lấy danh sách yêu cầu thủ tục.

---

## STEP 3

Backend xác thực phiên đăng nhập.

Bao gồm:

- JWT Authentication.
- Vai trò người dùng.
- Quyền truy cập.

Nếu phiên đăng nhập không hợp lệ thì kết thúc Workflow.

---

## STEP 4

Backend truy xuất danh sách yêu cầu thủ tục.

Mỗi yêu cầu bao gồm:

- Mã yêu cầu
- Mã sinh viên
- Họ và tên sinh viên
- Loại thủ tục
- Ngày gửi
- Trạng thái hiện tại
- Thời gian cập nhật gần nhất

---

## STEP 5

Backend sắp xếp danh sách.

Thứ tự mặc định:

- Ưu tiên các yêu cầu chưa xử lý.
- Trong cùng trạng thái, sắp xếp theo thời gian gửi tăng dần (gửi trước xử lý trước).

---

## STEP 6

Backend trả dữ liệu cho Frontend.

---

## STEP 7

Frontend hiển thị danh sách yêu cầu thủ tục.

Mỗi dòng bao gồm:

- Mã yêu cầu
- Mã sinh viên
- Họ và tên
- Loại thủ tục
- Ngày gửi
- Trạng thái
- Thời gian cập nhật

---

## STEP 8

Phòng Đào tạo chọn một yêu cầu thủ tục.

Hệ thống chuyển sang Workflow:

**request-detail.md**

---

# 7. Alternative Flow

## AF-01

Phòng Đào tạo thay đổi bộ lọc.

Hệ thống tải lại danh sách theo điều kiện lọc.

---

## AF-02

Phòng Đào tạo tìm kiếm theo:

- Mã yêu cầu
- Mã sinh viên
- Họ tên sinh viên

Hệ thống hiển thị kết quả phù hợp.

---

# 8. Exception Flow

## EX-01

Phiên đăng nhập hết hạn.

Hệ thống chuyển về màn hình Đăng nhập.

---

## EX-02

Không có yêu cầu thủ tục nào.

Hệ thống hiển thị:

> Hiện chưa có yêu cầu thủ tục nào.

Workflow kết thúc.

---

## EX-03

Không thể tải dữ liệu.

Hệ thống hiển thị:

> Không thể tải danh sách yêu cầu thủ tục. Vui lòng thử lại sau.

Workflow kết thúc.

---

# 9. Business Rules

## BR-RL-01

Chỉ người dùng có vai trò **Phòng Đào tạo** mới được truy cập màn hình này.

---

## BR-RL-02

Danh sách hiển thị tất cả các yêu cầu thủ tục chưa bị xóa logic.

---

## BR-RL-03

Danh sách mặc định ưu tiên các yêu cầu chưa được xử lý.

---

## BR-RL-04

Thông tin hiển thị chỉ có quyền đọc.

Việc xử lý được thực hiện trong Workflow khác.

---

## BR-RL-05

Mỗi yêu cầu chỉ có một trạng thái hiện tại.

---

# 10. Giao diện

Danh sách hiển thị các cột:

- Mã yêu cầu
- Mã sinh viên
- Họ và tên sinh viên
- Loại thủ tục
- Ngày gửi
- Trạng thái
- Thời gian cập nhật

Hỗ trợ:

- Tìm kiếm
- Lọc
- Sắp xếp

---

# 11. Bộ lọc

Hệ thống hỗ trợ lọc theo:

## Trạng thái

- Chờ tiếp nhận
- Chờ bổ sung minh chứng
- Đang xử lý
- Đã hoàn thành
- Đã từ chối
- Đã hủy

---

## Loại thủ tục

- Chuyển ngành
- Bảo lưu
- Học tiếp
- Thôi học

---

## Khoảng thời gian

- Từ ngày
- Đến ngày

---

# 12. API Mapping

Workflow sử dụng:

GET /api/v1/admin/procedure-requests

---

# 13. Database Mapping

Workflow đọc dữ liệu từ:

- procedure_requests
- students
- procedure_types

Workflow không ghi dữ liệu.

---

# 14. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Vai trò Phòng Đào tạo.
- Quyền truy cập chức năng.

---

# 15. Logging

Ghi nhận:

- User ID
- Action: View Procedure Request List
- Timestamp
- Result

---

# 16. Performance

Mục tiêu:

- Thời gian phản hồi dưới 2 giây.
- Hỗ trợ phân trang (Pagination).
- Chỉ tải dữ liệu tóm tắt.
- Không tải PDF và file minh chứng ở màn hình này.

---

# 17. Workflow Summary

```text
Phòng Đào tạo

↓

Chọn "Quản lý yêu cầu thủ tục"

↓

Frontend gửi yêu cầu

↓

Backend xác thực

↓

Truy xuất danh sách yêu cầu

↓

Sắp xếp dữ liệu

↓

Trả kết quả

↓

Frontend hiển thị danh sách

↓

Phòng Đào tạo chọn một yêu cầu

↓

Workflow: request-detail.md
```

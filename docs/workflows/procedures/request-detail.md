# Workflow: Xem chi tiết yêu cầu thủ tục

---

# 1. Mục đích

Workflow này mô tả quy trình Phòng Đào tạo xem toàn bộ thông tin chi tiết của một yêu cầu thủ tục do sinh viên gửi.

Mục tiêu của Workflow:

- Hiển thị đầy đủ thông tin của yêu cầu thủ tục.
- Hiển thị kết quả kiểm tra của AI Agent.
- Hiển thị mẫu đơn đã được hệ thống sinh tự động.
- Hiển thị các tệp minh chứng sinh viên đã nộp.
- Hiển thị lịch sử xử lý và tiến độ của yêu cầu.
- Cho phép Phòng Đào tạo lựa chọn xử lý yêu cầu bằng các chức năng:
  - Duyệt yêu cầu.
  - Từ chối yêu cầu.
  - Yêu cầu bổ sung minh chứng.

Workflow này chỉ có chức năng xem dữ liệu và không thay đổi trạng thái của yêu cầu.

---

# 2. Actors

- Phòng Đào tạo

---

# 3. Trigger

Phòng Đào tạo chọn một yêu cầu thủ tục từ danh sách yêu cầu.

---

# 4. Preconditions

- Phòng Đào tạo đã đăng nhập thành công.
- Phiên đăng nhập còn hiệu lực.
- Yêu cầu thủ tục tồn tại trong hệ thống.

---

# 5. Postconditions

Thông tin chi tiết của yêu cầu thủ tục được hiển thị.

Phòng Đào tạo có thể lựa chọn thực hiện một trong các Workflow xử lý tiếp theo.

---

# 6. Main Workflow

## STEP 1

Phòng Đào tạo chọn một yêu cầu thủ tục.

---

## STEP 2

Frontend gửi Request ID đến Backend.

---

## STEP 3

Backend xác thực:

- JWT Authentication.
- Vai trò người dùng.
- Quyền truy cập.

---

## STEP 4

Backend truy xuất toàn bộ dữ liệu của yêu cầu thủ tục.

Bao gồm:

- Thông tin sinh viên.
- Thông tin yêu cầu.
- Kết quả AI Agent.
- Mẫu đơn.
- Danh sách minh chứng.
- Timeline xử lý.

---

## STEP 5

Backend trả dữ liệu cho Frontend.

---

## STEP 6

Frontend hiển thị thông tin sinh viên.

Bao gồm:

- Mã sinh viên
- Họ và tên
- Lớp
- Khoa
- Khóa học

---

## STEP 7

Frontend hiển thị thông tin yêu cầu.

Bao gồm:

- Mã yêu cầu
- Loại thủ tục
- Ngày tạo
- Ngày gửi
- Trạng thái hiện tại

---

## STEP 8

Frontend hiển thị kết quả kiểm tra của AI Agent.

Bao gồm:

- Danh sách Business Rules đã kiểm tra.
- Kết quả từng điều kiện.
- Ghi chú của AI Agent (nếu có).

---

## STEP 9

Frontend hiển thị mẫu đơn thủ tục.

Cho phép:

- Xem Preview PDF.
- Tải PDF.
- Tải Word.

---

## STEP 10

Frontend hiển thị danh sách minh chứng.

Mỗi minh chứng bao gồm:

- Tên tệp.
- Loại tệp.
- Ngày tải lên.
- Preview.
- Tải xuống.

---

## STEP 11

Frontend hiển thị Timeline xử lý.

Ví dụ:

- Đã tạo yêu cầu.
- Chờ xác nhận sinh viên.
- Chờ tiếp nhận.
- Đang xử lý.
- Chờ bổ sung minh chứng.
- Đã hoàn thành.
- Đã từ chối.
- Đã hủy.

---

## STEP 12

Frontend hiển thị các chức năng xử lý.

Bao gồm:

- Duyệt yêu cầu.
- Từ chối yêu cầu.
- Yêu cầu bổ sung minh chứng.

Workflow kết thúc.

---

# 7. Alternative Flow

## AF-01

Phòng Đào tạo chọn một tệp minh chứng.

Hệ thống mở Preview của tệp.

---

## AF-02

Phòng Đào tạo tải xuống:

- PDF.
- Word.
- Minh chứng.

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

Không thể tải dữ liệu.

Hệ thống hiển thị:

> Không thể tải thông tin yêu cầu thủ tục. Vui lòng thử lại sau.

Workflow kết thúc.

---

# 9. Business Rules

## BR-RD-01

Chỉ người dùng có vai trò Phòng Đào tạo được phép truy cập.

---

## BR-RD-02

Toàn bộ dữ liệu trên màn hình chỉ có quyền đọc.

---

## BR-RD-03

Mẫu đơn hiển thị luôn là phiên bản cuối cùng được sinh bởi hệ thống.

---

## BR-RD-04

Các tệp minh chứng chỉ được xem và tải xuống.

Không được chỉnh sửa.

---

## BR-RD-05

Timeline phản ánh toàn bộ lịch sử xử lý của yêu cầu.

---

# 10. Giao diện

Màn hình bao gồm:

## Thông tin sinh viên

- Mã sinh viên
- Họ tên
- Lớp
- Khoa
- Khóa

---

## Thông tin yêu cầu

- Mã yêu cầu
- Loại thủ tục
- Ngày tạo
- Ngày gửi
- Trạng thái

---

## Kết quả AI Agent

- Danh sách điều kiện đã kiểm tra
- Kết quả từng điều kiện
- Ghi chú

---

## Mẫu đơn

- Preview PDF
- Download PDF
- Download Word

---

## Minh chứng

- Danh sách tệp
- Preview
- Download

---

## Timeline

Toàn bộ tiến trình xử lý.

---

## Các nút chức năng

- Duyệt yêu cầu
- Từ chối yêu cầu
- Yêu cầu bổ sung minh chứng

---

# 11. API Mapping

Workflow sử dụng:

GET /api/v1/admin/procedure-requests/{requestId}

---

# 12. Database Mapping

Workflow đọc dữ liệu từ:

- procedure_requests
- procedure_request_timelines
- procedure_request_documents
- procedure_request_ai_results
- students
- procedure_types

Workflow không ghi dữ liệu.

---

# 13. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Vai trò Phòng Đào tạo.
- Quyền truy cập.

---

# 14. Logging

Ghi nhận:

- User ID
- Request ID
- Action: View Procedure Request Detail
- Timestamp
- Result

---

# 15. Performance

Mục tiêu:

- Thời gian tải dưới 3 giây.
- PDF chỉ tải khi người dùng mở Preview hoặc Download.
- Minh chứng chỉ tải khi người dùng yêu cầu.

---

# 16. Workflow Summary

```text
Phòng Đào tạo

↓

Chọn yêu cầu thủ tục

↓

Frontend gửi Request ID

↓

Backend xác thực

↓

Truy xuất dữ liệu

↓

Thông tin sinh viên

↓

Thông tin yêu cầu

↓

Kết quả AI Agent

↓

Mẫu đơn

↓

Minh chứng

↓

Timeline

↓

Hiển thị các chức năng xử lý

↓

Workflow kết thúc
```
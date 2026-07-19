# Workflow: Bổ sung minh chứng theo yêu cầu

---

# 1. Mục đích

Workflow này mô tả quy trình sinh viên bổ sung minh chứng sau khi nhận được yêu cầu từ Phòng Đào tạo.

Khi Phòng Đào tạo kiểm tra hồ sơ và nhận thấy hồ sơ chưa đầy đủ hoặc cần bổ sung thêm tài liệu, hệ thống sẽ chuyển yêu cầu sang trạng thái **Chờ bổ sung minh chứng**.

Sinh viên sẽ truy cập vào hồ sơ đã gửi, xem nội dung yêu cầu bổ sung, tải lên các minh chứng còn thiếu và gửi lại hồ sơ để Phòng Đào tạo tiếp tục xử lý.

Workflow này không tạo yêu cầu thủ tục mới mà cập nhật trên chính yêu cầu hiện có.

---

# 2. Actors

- Sinh viên

---

# 3. Trigger

Sinh viên mở một hồ sơ có trạng thái:

**Chờ bổ sung minh chứng**

---

# 4. Preconditions

- Sinh viên đã đăng nhập.
- Hồ sơ thuộc quyền sở hữu của sinh viên.
- Hồ sơ tồn tại.
- Trạng thái hiện tại là:

```
Chờ bổ sung minh chứng
```

- Phòng Đào tạo đã gửi ít nhất một yêu cầu bổ sung.

---

# 5. Postconditions

- Minh chứng bổ sung được lưu thành công.
- Phiên bản hồ sơ mới được tạo.
- Trạng thái chuyển thành:

```
Chờ tiếp nhận
```

- Timeline được cập nhật.
- Phòng Đào tạo nhận được thông báo có hồ sơ bổ sung.

---

# 6. Main Workflow

## STEP 1

Sinh viên mở menu:

**Hồ sơ đã gửi**

---

## STEP 2

Hệ thống hiển thị danh sách các yêu cầu thủ tục.

---

## STEP 3

Sinh viên chọn một hồ sơ có trạng thái:

```
Chờ bổ sung minh chứng
```

---

## STEP 4

Hệ thống hiển thị màn hình Chi tiết yêu cầu.

Bao gồm:

- Thông tin hồ sơ.
- Mẫu đơn PDF.
- Mẫu đơn Word.
- Timeline xử lý.
- Danh sách minh chứng đã nộp.
- Nội dung yêu cầu bổ sung của Phòng Đào tạo.

---

## STEP 5

Hệ thống hiển thị danh sách minh chứng cần bổ sung.

Ví dụ:

- CCCD
- Bảng điểm
- Giấy xác nhận

---

## STEP 6

Sinh viên nhấn biểu tượng Upload.

---

## STEP 7

Sinh viên chọn các tệp từ thiết bị.

Hệ thống hỗ trợ:

- PDF
- JPG
- JPEG
- PNG

---

## STEP 8

Hệ thống tải tệp lên máy chủ.

---

## STEP 9

AI Agent OCR thực hiện kiểm tra sơ bộ.

Bao gồm:

- Đúng loại tệp.
- Đúng định dạng.
- Đúng cấu trúc tên tệp.
- Đọc được nội dung văn bản.

AI Agent không đánh giá tính hợp lệ của nội dung minh chứng.

---

## STEP 10

Nếu phát hiện thiếu minh chứng hoặc tệp không hợp lệ, AI Agent hiển thị các lỗi còn lại.

Ví dụ:

- Thiếu CCCD.
- Sai định dạng.
- Không đọc được nội dung.

Sinh viên tiếp tục bổ sung.

---

## STEP 11

Khi tất cả minh chứng đều hợp lệ, AI Agent thông báo:

> Bạn đã bổ sung đầy đủ minh chứng. Vui lòng xác nhận để gửi lại hồ sơ.

---

## STEP 12

Sinh viên nhấn nút:

**Gửi lại hồ sơ**

---

## STEP 13

Frontend gửi:

- Request ID.
- Danh sách tệp bổ sung.

đến Backend.

---

## STEP 14

Backend xác thực:

- JWT Authentication.
- Quyền sở hữu hồ sơ.

---

## STEP 15

Backend tạo một phiên bản hồ sơ mới (Request Version).

Các minh chứng bổ sung được lưu vào phiên bản mới.

Phiên bản cũ vẫn được giữ nguyên.

---

## STEP 16

Backend cập nhật trạng thái:

```
Chờ tiếp nhận
```

---

## STEP 17

Backend cập nhật Timeline.

Ví dụ:

```
Đã gửi yêu cầu

↓

Chờ tiếp nhận

↓

Đang xử lý

↓

Chờ bổ sung minh chứng

↓

Đã bổ sung minh chứng

↓

Chờ tiếp nhận
```

---

## STEP 18

Backend ghi Audit Log.

---

## STEP 19

Backend tạo thông báo cho Phòng Đào tạo.

Ví dụ:

> Sinh viên đã bổ sung minh chứng cho hồ sơ.

---

## STEP 20

Frontend hiển thị:

> Hồ sơ đã được gửi lại thành công.

Workflow kết thúc.

---

# 7. Alternative Flow

## AF-01

Sinh viên đóng màn hình.

Toàn bộ dữ liệu đã tải lên vẫn được lưu dưới dạng bản nháp cho đến khi gửi lại hoặc hủy thao tác.

---

# 8. Exception Flow

## EX-01

Phiên đăng nhập hết hạn.

Hệ thống chuyển về màn hình Đăng nhập.

---

## EX-02

Hồ sơ không tồn tại.

Thông báo:

> Không tìm thấy hồ sơ.

---

## EX-03

Hồ sơ không ở trạng thái:

```
Chờ bổ sung minh chứng
```

Thông báo:

> Hồ sơ hiện không thể bổ sung minh chứng.

---

## EX-04

Tệp không đúng định dạng.

Thông báo:

> Minh chứng không đúng định dạng.

---

## EX-05

OCR không đọc được tệp.

Thông báo:

> Không thể đọc nội dung minh chứng. Vui lòng tải lại.

---

## EX-06

Lỗi tải tệp.

Thông báo:

> Không thể tải minh chứng lên hệ thống.

---

## EX-07

Lỗi gửi hồ sơ.

Thông báo:

> Không thể gửi lại hồ sơ. Vui lòng thử lại sau.

---

# 9. Business Rules

## BR-SR-01

Chỉ được bổ sung khi trạng thái hồ sơ là:

```
Chờ bổ sung minh chứng
```

---

## BR-SR-02

Không tạo yêu cầu thủ tục mới.

---

## BR-SR-03

Mỗi lần bổ sung sẽ tạo một **Request Version** mới.

---

## BR-SR-04

Toàn bộ các phiên bản trước phải được lưu để phục vụ đối chiếu và kiểm tra.

---

## BR-SR-05

Sau khi gửi lại thành công, trạng thái chuyển thành:

```
Chờ tiếp nhận
```

---

## BR-SR-06

AI Agent chỉ kiểm tra:

- Số lượng minh chứng.
- Loại tệp.
- Cấu trúc tên tệp.
- Khả năng đọc văn bản bằng OCR.

Không đánh giá nội dung hoặc tính pháp lý của minh chứng.

---

## BR-SR-07

Chỉ sinh viên sở hữu hồ sơ mới được phép bổ sung minh chứng.

---

# 10. Giao diện

Màn hình Chi tiết yêu cầu hiển thị:

- Thông tin hồ sơ.
- PDF.
- Word.
- Timeline.
- Danh sách minh chứng đã nộp.
- Nội dung yêu cầu bổ sung.
- Danh sách minh chứng cần bổ sung.
- Nút Upload.
- Danh sách tệp vừa tải.
- Trạng thái kiểm tra OCR.
- Nút **Gửi lại hồ sơ**.

---

# 11. API Mapping

Workflow sử dụng:

POST /api/v1/procedure-requests/{requestId}/supplement

---

# 12. Database Mapping

Đọc:

- procedure_requests
- procedure_request_versions
- procedure_request_files

Ghi:

- procedure_request_versions
- procedure_request_files
- procedure_request_timelines
- notifications
- audit_logs

Cập nhật:

- procedure_requests.status

---

# 13. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Quyền sở hữu hồ sơ.
- Trạng thái hồ sơ.
- Phiên đăng nhập.

---

# 14. Logging

Ghi nhận:

- User ID
- Request ID
- Version Number
- Uploaded Files
- Action: Supplement Request
- Timestamp

---

# 15. Performance

Mục tiêu:

- Upload nhiều tệp đồng thời.
- Kiểm tra OCR ngay sau khi tải lên.
- Thời gian gửi lại hồ sơ dưới 3 giây (không tính thời gian tải tệp).

---

# 16. Workflow Summary

```text
Sinh viên

↓

Hồ sơ đã gửi

↓

Chọn hồ sơ

↓

Chi tiết hồ sơ

↓

Hiển thị yêu cầu bổ sung

↓

Upload minh chứng

↓

AI Agent OCR kiểm tra

↓

Đủ minh chứng

↓

Gửi lại hồ sơ

↓

Tạo Request Version mới

↓

Cập nhật trạng thái

↓

Chờ tiếp nhận

↓

Thông báo Phòng Đào tạo

↓

Workflow kết thúc
```
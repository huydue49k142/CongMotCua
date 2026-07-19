# Workflow: Tra cứu thông tin thủ tục học vụ

## Thông tin chung

| Thuộc tính | Giá trị |
|------------|----------|
| Workflow ID | WF-PROCEDURE-LOOKUP-001 |
| Use Case ID | UC-2 |
| Tên Use Case | Tra cứu thông tin thủ tục học vụ |
| Độ ưu tiên | High |
| Actor | Sinh viên |

---

# Mục đích

Cho phép sinh viên tra cứu thông tin chi tiết của các thủ tục học vụ nhằm hiểu rõ điều kiện thực hiện, thành phần hồ sơ, quy trình xử lý, thời gian giải quyết và các lưu ý trước khi thực hiện gửi yêu cầu.

---

# Actor

## Primary Actor

- Sinh viên

## Supporting Actor

- Hệ thống

---

# Điều kiện tiên quyết (Preconditions)

- Sinh viên đã đăng nhập thành công.
- Danh mục thủ tục học vụ đã được quản trị viên cấu hình.
- Các thủ tục đang ở trạng thái có hiệu lực.

---

# Điều kiện sau khi hoàn thành (Postconditions)

Nếu thành công:

- Thông tin chi tiết của thủ tục học vụ được hiển thị đầy đủ.
- Sinh viên có thể tiếp tục tra cứu thủ tục khác hoặc thực hiện các chức năng tiếp theo.

Nếu thất bại:

- Hệ thống hiển thị thông báo lỗi phù hợp.
- Không có dữ liệu nào bị thay đổi.

---

# Luồng nghiệp vụ chính (Main Workflow)

## Bước 1

Sinh viên đăng nhập thành công.

Hệ thống điều hướng đến **Trang chủ Sinh viên**.

---

## Bước 2

Sinh viên chọn chức năng **Xem thông tin thủ tục** trên Sidebar.

---

## Bước 3

Hệ thống hiển thị khu vực Main gồm:

- Tiêu đề:

> Vui lòng chọn một thủ tục

- Danh sách các thủ tục học vụ đang có hiệu lực dưới dạng Card, bao gồm:

  - Chuyển ngành
  - Thôi học
  - Bảo lưu
  - Học tiếp

---

## Bước 4

Sinh viên chọn một Card thủ tục.

---

## Bước 5

Hệ thống truy xuất thông tin của thủ tục đã chọn.

---

## Bước 6

Hệ thống hiển thị đầy đủ thông tin của thủ tục tại khu vực Main, bao gồm:

- Tên thủ tục
- Mô tả
- Điều kiện thực hiện
- Thành phần hồ sơ
- Quy trình xử lý
- Thời gian giải quyết dự kiến
- Các lưu ý liên quan (nếu có)

---

## Bước 7

Sinh viên xem thông tin của thủ tục.

Workflow kết thúc.

---

# Luồng thay thế (Alternative Flow)

## AF-01

Điều kiện

Sinh viên muốn xem thông tin của thủ tục khác.

Kết quả

- Sinh viên chọn lại chức năng **Xem thông tin thủ tục** trên Sidebar.
- Hệ thống hiển thị lại danh sách các thủ tục học vụ.
- Quay lại **Bước 3**.

---

# Luồng ngoại lệ (Exception Flow)

## EX-01

Điều kiện

Hệ thống không tìm thấy thông tin của thủ tục được chọn.

Kết quả

Hiển thị thông báo:

> Thông tin thủ tục hiện chưa được cập nhật.

Workflow kết thúc.

---

## EX-02

Điều kiện

Hệ thống không thể truy xuất dữ liệu.

Kết quả

Hiển thị thông báo:

> Không thể tải thông tin thủ tục. Vui lòng thử lại sau.

Workflow kết thúc.

---

# Business Rules

## BR-PROCEDURE-001

Chỉ hiển thị các thủ tục đang có hiệu lực.

---

## BR-PROCEDURE-002

Mỗi thủ tục phải có tối thiểu một điều kiện thực hiện.

---

# Dữ liệu hiển thị

Mỗi thủ tục phải cung cấp tối thiểu các thông tin sau:

| Thuộc tính | Bắt buộc |
|------------|----------|
| Tên thủ tục | Có |
| Mô tả | Có |
| Điều kiện thực hiện | Có |
| Thành phần hồ sơ | Có |
| Quy trình xử lý | Có |
| Thời gian giải quyết dự kiến | Có |
| Các lưu ý | Không |

---

# Trạng thái Workflow

```text
Student Dashboard
        │
        ▼
Chọn "Xem thông tin thủ tục"
        │
        ▼
Hiển thị danh sách thủ tục
        │
        ▼
Chọn thủ tục
        │
        ▼
Truy xuất thông tin
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Thành công  Thất bại
   │         │
   ▼         ▼
Hiển thị    Thông báo lỗi
thông tin
```

---

# Điều hướng giao diện

Nguồn:

- `/student/dashboard`

Đích:

- `/student/procedures`

Thông tin chi tiết của thủ tục được hiển thị trong khu vực Main của giao diện, không chuyển sang trang mới.

---

# API liên quan

## GET

```http
/api/procedures
```

Mô tả:

Lấy danh sách các thủ tục học vụ đang có hiệu lực.

---

## GET

```http
/api/procedures/{procedureId}
```

Mô tả:

Lấy thông tin chi tiết của một thủ tục học vụ.

---

# Database liên quan

Các bảng sử dụng:

- Procedure
- ProcedureCondition
- ProcedureDocument
- ProcedureStep
- ProcedureNote

---

# Ghi chú dành cho Front-end

- Chỉ hiển thị các thủ tục đang có hiệu lực.
- Danh sách thủ tục được hiển thị dưới dạng Card.
- Khi người dùng chọn Card, chỉ cập nhật nội dung khu vực Main.
- Hiển thị trạng thái Loading trong quá trình tải dữ liệu.
- Nếu không có dữ liệu, hiển thị thông báo tương ứng.
- Không làm mới toàn bộ trang khi chuyển đổi giữa các thủ tục.

---

# Ghi chú dành cho Back-end

- Chỉ trả về các thủ tục có trạng thái **Active**.
- Thông tin trả về phải đầy đủ các nội dung theo quy định.
- Nếu không tìm thấy thủ tục, trả về mã lỗi phù hợp.
- Nếu xảy ra lỗi hệ thống, trả về thông báo lỗi chung để Front-end hiển thị.

---
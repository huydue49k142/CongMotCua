# Workflow: Đăng xuất

## Thông tin chung

| Thuộc tính | Giá trị |
|------------|----------|
| Workflow ID | WF-LOGOUT-001 |
| Use Case ID | UC-1.3 |
| Tên Use Case | Đăng xuất |
| Độ ưu tiên | High |
| Actor | Sinh viên, Phòng Đào tạo |

---

# Mục đích

Cho phép người dùng kết thúc phiên làm việc hiện tại một cách an toàn nhằm bảo vệ thông tin cá nhân và ngăn chặn truy cập trái phép.

Sau khi đăng xuất thành công, hệ thống hủy toàn bộ thông tin xác thực và chuyển người dùng về màn hình Đăng nhập.

---

# Actor

## Primary Actor

- Sinh viên
- Phòng Đào tạo

## Supporting Actor

- Hệ thống xác thực (Authentication Service)

---

# Điều kiện tiên quyết (Preconditions)

- Người dùng đã đăng nhập thành công.
- Phiên làm việc (Session/JWT) còn hiệu lực.

---

# Điều kiện sau khi hoàn thành (Postconditions)

Nếu thành công:

- Phiên làm việc bị hủy.
- Token hoặc Session bị xóa.
- Người dùng được chuyển về màn hình Đăng nhập.
- Người dùng phải đăng nhập lại để tiếp tục sử dụng hệ thống.

Nếu hủy thao tác:

- Phiên làm việc vẫn được giữ nguyên.
- Người dùng tiếp tục sử dụng hệ thống.

---

# Luồng nghiệp vụ chính (Main Workflow)

## Bước 1

Người dùng chọn chức năng **Đăng xuất**.

---

## Bước 2

Hệ thống hiển thị hộp thoại xác nhận.

Thông báo:

> Bạn có chắc chắn muốn đăng xuất không?

---

## Bước 3

Người dùng chọn **Đồng ý**.

---

## Bước 4

Hệ thống thực hiện:

- Hủy phiên làm việc.
- Xóa Session hoặc Access Token.
- Xóa Refresh Token (nếu có).
- Xóa thông tin xác thực được lưu trên trình duyệt.

---

## Bước 5

Hệ thống chuyển người dùng về màn hình **Đăng nhập**.

Workflow kết thúc.

---

# Luồng thay thế (Alternative Flow)

## AF-01

Điều kiện

Người dùng chọn **Hủy** tại hộp thoại xác nhận.

Kết quả

- Đóng hộp thoại xác nhận.
- Giữ nguyên phiên làm việc.
- Quay lại màn hình hiện tại.

Workflow kết thúc.

---

# Luồng ngoại lệ (Exception Flow)

Không có.

---

# Business Rules

## BR-LOGOUT-001

Sau khi đăng xuất, toàn bộ phiên làm việc của người dùng phải bị hủy.

---

## BR-LOGOUT-002

Người dùng không được phép truy cập các chức năng yêu cầu xác thực sau khi đăng xuất nếu chưa đăng nhập lại.

---

# Trạng thái Workflow

```text
Logged In
     │
     ▼
Click Logout
     │
     ▼
Confirmation Dialog
     │
 ┌───┴────────┐
 │            │
 ▼            ▼
Cancel      Confirm
 │            │
 ▼            ▼
Current     Destroy Session
Screen           │
                 ▼
          Remove Authentication
                 │
                 ▼
             Login Page
```

---

# Điều hướng giao diện

Nguồn:

- Bất kỳ màn hình nào sau khi đăng nhập.

Đích:

- `/login`

---

# API liên quan

## POST

```
/api/auth/logout
```

Request

```json
{
    "refreshToken": "..."
}
```

Response

```json
{
    "success": true,
    "message": "Đăng xuất thành công."
}
```

---

# Database liên quan

Các bảng sử dụng:

- User
- Session (nếu sử dụng Session)
- RefreshToken (nếu sử dụng JWT)
- AuditLog (nếu ghi nhận lịch sử đăng nhập/đăng xuất)

---

# Ghi chú dành cho Front-end

- Hiển thị hộp thoại xác nhận trước khi đăng xuất.
- Sau khi đăng xuất thành công:
  - Xóa Access Token.
  - Xóa Refresh Token.
  - Xóa thông tin người dùng lưu trong Local Storage hoặc Session Storage.
  - Điều hướng về màn hình Đăng nhập.
- Không cho phép người dùng quay lại các trang yêu cầu đăng nhập bằng nút Back của trình duyệt nếu phiên đã hết hiệu lực.

---

# Ghi chú dành cho Back-end

- Hủy phiên làm việc hoặc vô hiệu hóa Refresh Token.
- Ghi nhận thời điểm đăng xuất (nếu hệ thống có Audit Log).
- Từ chối mọi yêu cầu sử dụng Access Token hoặc Session đã hết hiệu lực.

---
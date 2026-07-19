# Workflow: Đăng nhập

## Thông tin chung

| Thuộc tính | Giá trị |
|------------|----------|
| Workflow ID | WF-LOGIN-001 |
| Use Case ID | UC-1.1 |
| Tên Use Case | Đăng nhập |
| Độ ưu tiên | High |
| Actor | Sinh viên, Phòng Đào tạo |

---

# Mục đích

Cho phép người dùng đã có tài khoản hợp lệ truy cập vào hệ thống Cổng 1 cửa.

Sau khi xác thực thành công, hệ thống tạo phiên đăng nhập (Session/JWT) và điều hướng người dùng đến giao diện tương ứng với vai trò.

---

# Actor

## Primary Actor

- Sinh viên
- Phòng Đào tạo

## Supporting Actor

- Hệ thống xác thực (Authentication Service)

---

# Điều kiện tiên quyết (Preconditions)

- Người dùng đã có tài khoản.
- Tài khoản đang ở trạng thái hoạt động.
- Người dùng chưa đăng nhập.

---

# Điều kiện sau khi hoàn thành (Postconditions)

Nếu thành công:

- Người dùng được xác thực.
- Phiên đăng nhập được tạo.
- Thông tin người dùng được lưu vào Session hoặc JWT.
- Người dùng được chuyển đến Dashboard theo vai trò.

Nếu thất bại:

- Không tạo phiên đăng nhập.
- Người dùng vẫn ở màn hình Đăng nhập.
- Hiển thị thông báo lỗi.

---

# Dữ liệu đầu vào

| Trường | Kiểu | Bắt buộc |
|---------|------|-----------|
| userCode | String | Có |
| password | Password | Có |

---

# Validation Rules

## userCode

- Không được để trống.
- Phải có đúng 12 ký tự.

## password

- Không được để trống.

---

# Luồng nghiệp vụ chính (Main Workflow)

## Bước 1

Người dùng truy cập Cổng 1 cửa.

---

## Bước 2

Hệ thống hiển thị màn hình Đăng nhập.

---

## Bước 3

Người dùng nhập:

- Mã người dùng
- Mật khẩu

---

## Bước 4

Người dùng nhấn nút **Đăng nhập**.

---

## Bước 5

Hệ thống kiểm tra dữ liệu đầu vào.

Bao gồm:

- userCode không rỗng
- userCode đúng 12 ký tự
- password không rỗng

Nếu dữ liệu không hợp lệ:

→ Hiển thị thông báo lỗi.

→ Quay lại màn hình Đăng nhập.

---

## Bước 6

Hệ thống xác thực tài khoản.

Thực hiện:

- Kiểm tra tài khoản tồn tại.
- Kiểm tra mật khẩu.
- Kiểm tra trạng thái tài khoản.

Nếu hợp lệ:

→ Tạo Session hoặc JWT.

---

## Bước 7

Hệ thống xác định vai trò người dùng.

Ví dụ:

- Student
- Academic Office

---

## Bước 8

Hệ thống điều hướng người dùng đến Dashboard tương ứng.

Workflow kết thúc.

---

# Luồng thay thế (Alternative Flow)

## AF-01

Người dùng chọn **Quên mật khẩu**.

Hệ thống điều hướng sang Workflow:

```
forgot-password.md
```

---

# Luồng ngoại lệ (Exception Flow)

## EX-01

Điều kiện

Mã người dùng để trống.

Kết quả

Hiển thị:

```
Đăng nhập không thành công.
```

Quay lại màn hình Đăng nhập.

---

## EX-02

Điều kiện

Mã người dùng không đủ hoặc vượt quá 12 ký tự.

Kết quả

Hiển thị:

```
Đăng nhập không thành công.
```

---

## EX-03

Điều kiện

Mật khẩu để trống.

Kết quả

Hiển thị:

```
Đăng nhập không thành công.
```

---

## EX-04

Điều kiện

Mật khẩu không đúng.

Kết quả

Hiển thị:

```
Đăng nhập không thành công.
```

---

## EX-05

Điều kiện

Tài khoản không tồn tại hoặc đã bị khóa.

Kết quả

Hiển thị:

```
Đăng nhập không thành công.
```

---

# Business Rules

## BR-LOGIN-001

Mỗi tài khoản có một mã người dùng duy nhất.

---

## BR-LOGIN-002

Chỉ tài khoản đang hoạt động mới được phép đăng nhập.

---

## BR-LOGIN-003

Mã người dùng phải gồm đúng 12 ký tự.

---

# Trạng thái Workflow

```text
Not Logged In
      │
      ▼
Input Credentials
      │
      ▼
Validate Input
      │
      ▼
Authenticate
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
Failed   Success
 │          │
 ▼          ▼
Login Page Dashboard
```

---

# Điều hướng giao diện

Nguồn:

- `/login`

Đích:

Nếu Student

→ `/student/dashboard`

Nếu Academic Office

→ `/office/dashboard`

---

# API liên quan

## POST

```
/api/auth/login
```

Request

```json
{
    "userCode": "",
    "password": ""
}
```

Response (Success)

```json
{
    "accessToken": "...",
    "refreshToken": "...",
    "role": "Student"
}
```

---

# Database liên quan

Bảng sử dụng

- User
- Role
- Session (nếu có)

---

# Ghi chú dành cho Front-end

- Kiểm tra dữ liệu trước khi gọi API.
- Nút Đăng nhập bị vô hiệu khi đang gửi yêu cầu.
- Hiển thị loading trong quá trình xác thực.
- Không lưu mật khẩu trên trình duyệt.

---

# Ghi chú dành cho Back-end

- Hash mật khẩu trước khi so sánh.
- Không trả về thông tin chi tiết nguyên nhân đăng nhập thất bại.
- Ghi log các lần đăng nhập thất bại.
- Hỗ trợ JWT hoặc Session Authentication.

---
# Workflow: Quên mật khẩu

## Thông tin chung

| Thuộc tính | Giá trị |
|------------|----------|
| Workflow ID | WF-FORGOT-PASSWORD-001 |
| Use Case ID | UC-1.2 |
| Tên Use Case | Quên mật khẩu |
| Độ ưu tiên | High |
| Actor | Sinh viên, Phòng Đào tạo |

---

# Mục đích

Cho phép người dùng thiết lập lại mật khẩu mới khi quên mật khẩu cũ bằng cách xác minh mã người dùng hợp lệ.

Sau khi cập nhật thành công, người dùng có thể đăng nhập bằng mật khẩu mới.

---

# Actor

## Primary Actor

- Sinh viên
- Phòng Đào tạo

## Supporting Actor

- Hệ thống

---

# Điều kiện tiên quyết (Preconditions)

- Người dùng đang ở màn hình Đăng nhập.
- Người dùng có tài khoản hợp lệ trên hệ thống.
- Tài khoản đang tồn tại.

---

# Điều kiện sau khi hoàn thành (Postconditions)

Nếu thành công:

- Mật khẩu mới được lưu.
- Mật khẩu cũ không còn hiệu lực.
- Người dùng có thể đăng nhập bằng mật khẩu mới.

Nếu thất bại:

- Không thay đổi mật khẩu.
- Người dùng tiếp tục thao tác trên màn hình Quên mật khẩu.

---

# Dữ liệu đầu vào

## Popup Quên mật khẩu

| Trường | Kiểu | Bắt buộc |
|---------|------|----------|
| userCode | String | Có |

---

## Popup Thiết lập mật khẩu mới

| Trường | Kiểu | Bắt buộc |
|---------|------|----------|
| newPassword | Password | Có |
| confirmPassword | Password | Có |

---

# Validation Rules

## userCode

- Không được để trống.
- Phải có đúng 12 ký tự.

## newPassword

- Không được để trống.
- Phải đúng định dạng mật khẩu của hệ thống.

## confirmPassword

- Không được để trống.
- Phải trùng với mật khẩu mới.

---

# Luồng nghiệp vụ chính (Main Workflow)

## Bước 1

Người dùng chọn **Quên mật khẩu** tại màn hình Đăng nhập.

---

## Bước 2

Hệ thống hiển thị popup **Quên mật khẩu**.

---

## Bước 3

Người dùng nhập mã người dùng.

---

## Bước 4

Người dùng nhấn **Xác minh tài khoản**.

---

## Bước 5

Hệ thống kiểm tra:

- Mã người dùng đã nhập.
- Định dạng mã người dùng.
- Tài khoản có tồn tại hay không.

Nếu hợp lệ:

→ Chuyển sang bước tiếp theo.

---

## Bước 6

Hệ thống hiển thị popup **Thiết lập mật khẩu mới**.

---

## Bước 7

Người dùng nhập:

- Mật khẩu mới.
- Xác nhận mật khẩu.

---

## Bước 8

Người dùng nhấn **Lưu mật khẩu**.

---

## Bước 9

Hệ thống kiểm tra:

- Định dạng mật khẩu.
- Xác nhận mật khẩu.
- Hai mật khẩu phải giống nhau.

Nếu hợp lệ:

→ Cập nhật mật khẩu.

---

## Bước 10

Hệ thống hiển thị thông báo:

**Đổi mật khẩu thành công.**

Workflow kết thúc.

---

# Luồng thay thế (Alternative Flow)

## AF-01

Tại popup Quên mật khẩu.

Người dùng chọn:

**Quay lại màn hình đăng nhập**

Hệ thống:

- Đóng popup.
- Hiển thị màn hình Đăng nhập.

Workflow kết thúc.

---

## AF-02

Tại popup Thiết lập mật khẩu mới.

Người dùng chọn:

**Quay lại màn hình đăng nhập**

Hệ thống:

- Đóng popup.
- Hiển thị màn hình Đăng nhập.

Workflow kết thúc.

---

# Luồng ngoại lệ (Exception Flow)

## EX-01

Điều kiện

Người dùng chưa nhập mã người dùng.

Kết quả

Hiển thị:

> Yêu cầu nhập mã người dùng.

Quay lại popup Quên mật khẩu.

---

## EX-02

Điều kiện

Mã người dùng không hợp lệ.

Kết quả

Hiển thị:

> Mã người dùng không hợp lệ.

Quay lại popup Quên mật khẩu.

---

## EX-03

Điều kiện

Mật khẩu mới để trống.

Kết quả

Hiển thị:

> Yêu cầu nhập mật khẩu mới.

---

## EX-04

Điều kiện

Mật khẩu mới không đúng định dạng.

Kết quả

Hiển thị:

> Mật khẩu mới không hợp lệ. Vui lòng nhập lại.

---

## EX-05

Điều kiện

Chưa nhập xác nhận mật khẩu.

Kết quả

Hiển thị:

> Yêu cầu nhập xác nhận mật khẩu.

---

## EX-06

Điều kiện

Xác nhận mật khẩu không trùng với mật khẩu mới.

Kết quả

Hiển thị:

> Mật khẩu mới không hợp lệ. Vui lòng nhập lại.

---

# Business Rules

## BR-FORGOT-PASSWORD-001

Mã người dùng phải gồm đúng 12 ký tự.

---

# Trạng thái Workflow

```text
Login Page
      │
      ▼
Forgot Password Popup
      │
      ▼
Validate User Code
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
Invalid   Valid
 │          │
 ▼          ▼
Forgot Popup
      │
      ▼
New Password Popup
      │
      ▼
Validate Password
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
Invalid   Valid
 │          │
 ▼          ▼
New Password Popup
      │
      ▼
Password Updated
      │
      ▼
Login Page
```

---

# Điều hướng giao diện

Nguồn:

- `/login`

Popup:

- Forgot Password
- New Password

Đích:

- `/login`

---

# API liên quan

## POST

```
/api/auth/verify-user
```

Request

```json
{
    "userCode": ""
}
```

---

## POST

```
/api/auth/reset-password
```

Request

```json
{
    "userCode": "",
    "newPassword": "",
    "confirmPassword": ""
}
```

---

# Database liên quan

Các bảng sử dụng:

- User
- PasswordHistory (nếu có)
- AuditLog (nếu có)

---

# Ghi chú dành cho Front-end

- Hiển thị popup thay vì chuyển sang trang mới.
- Kiểm tra dữ liệu trước khi gọi API.
- Hai ô mật khẩu hỗ trợ hiển thị/ẩn mật khẩu.
- Hiển thị thông báo thành công sau khi cập nhật.
- Sau khi người dùng đóng thông báo thành công, điều hướng về màn hình Đăng nhập.

---

# Ghi chú dành cho Back-end

- Mật khẩu phải được mã hóa trước khi lưu.
- Không lưu mật khẩu dưới dạng văn bản thuần (Plain Text).
- Ghi log thời điểm thay đổi mật khẩu.

---
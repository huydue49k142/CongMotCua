# Database Design Specification

## Mục tiêu

Thiết kế lại toàn bộ Database của hệ thống "Cổng Một Cửa - Thủ tục học vụ" dựa trên ERD hiện tại và các yêu cầu nghiệp vụ đã thống nhất.

Mục tiêu của việc thiết kế Database:

- Chuẩn hóa dữ liệu.
- Dễ mở rộng trong tương lai.
- Phù hợp với Django ORM.
- Phù hợp với PostgreSQL.
- Đảm bảo toàn vẹn dữ liệu.
- Hỗ trợ AI Agent, Workflow n8n và quy trình xử lý hồ sơ.

---

# Công nghệ

Backend:

- Django
- Django ORM
- PostgreSQL

Không sử dụng NoSQL.

---

# Nguyên tắc thiết kế

## 1. Chuẩn hóa

Ưu tiên chuẩn hóa tới Third Normal Form (3NF).

Không lưu dữ liệu trùng lặp.

---

## 2. Khóa chính

Mỗi bảng đều phải có Primary Key.

Ưu tiên:

- UUID

hoặc

- BigAutoField

Không sử dụng mã hiển thị (ví dụ REQ001) làm Primary Key.

---

## 3. Khóa ngoại

Sử dụng Foreign Key đầy đủ.

Không lưu các ID dưới dạng Text.

---

## 4. Cascade

Thiết kế Cascade hợp lý.

Ví dụ:

Yêu cầu

↓

Minh chứng

↓

AI Conversation

↓

AI Message

Khi yêu cầu bị xóa thì các dữ liệu phụ thuộc cũng phải được xóa theo.

---

## 5. Timestamp

Mỗi bảng nên có

- created_at
- updated_at

nếu phù hợp.

---

# Danh sách bảng

Database hiện tại bao gồm các nhóm sau.

## Authentication

- TaiKhoan

---

## Student

- SinhVien
- Lop
- Nganh

---

## Request

- YeuCau

- ChuyenNganh

- NgungHoc

- TiepTucHoc

- ThoiHoc

---

## Documents

- MinhChung

- SinhTaiLieuTuDong

---

## AI

- AIConversation

- AIMessage

---

## Workflow

- LichSuXuLy

---

## Notification

- ThongBao

---

# Mô tả từng bảng

## TaiKhoan

Quản lý tài khoản đăng nhập.

Bao gồm:

- Sinh viên
- Phòng đào tạo

Vai trò xác định quyền hệ thống.

---

## SinhVien

Lưu toàn bộ thông tin sinh viên.

Không lưu thông tin hồ sơ.

---

## Lop

Thông tin lớp.

---

## Nganh

Thông tin ngành đào tạo.

---

## YeuCau

Đây là bảng trung tâm của hệ thống.

Mỗi bản ghi tương ứng với một hồ sơ thủ tục.

Bảng này quản lý:

- loại thủ tục
- trạng thái
- ngày gửi
- ngày tiếp nhận
- ngày hoàn thành

Các bảng nghiệp vụ đều tham chiếu tới bảng này.

---

## ChuyenNganh

Lưu dữ liệu riêng của thủ tục Chuyển ngành.

---

## NgungHoc

Lưu dữ liệu riêng của thủ tục Ngừng học (Bảo lưu).

---

## TiepTucHoc

Lưu dữ liệu riêng của thủ tục Tiếp tục học.

---

## ThoiHoc

Lưu dữ liệu riêng của thủ tục Thôi học.

---

## MinhChung

Một hồ sơ có thể có nhiều minh chứng.

Mỗi minh chứng bao gồm:

- loại minh chứng
- tên file
- đường dẫn
- loại file
- kích thước
- lần bổ sung
- ngày tải lên

Không lưu nội dung file trong Database.

---

## SinhTaiLieuTuDong

Lưu tài liệu được Django sinh tự động.

Bao gồm:

- PDF
- Word

Một hồ sơ chỉ có một bản cuối cùng.

Không lưu version.

---

## LichSuXuLy

Lưu Timeline xử lý hồ sơ.

Ví dụ:

- Chờ tiếp nhận

- Đã tiếp nhận

- Yêu cầu bổ sung

- Đang xử lý

- Đã duyệt

- Từ chối

- Đã hủy

Timeline này sẽ được hiển thị cho sinh viên tại chức năng Theo dõi hồ sơ.

---

## AIConversation

Lưu trạng thái của AI Agent trong quá trình xử lý một hồ sơ.

Đây KHÔNG phải lịch sử chat.

Các thông tin cần lưu gồm:

- trạng thái workflow

- Waiting Upload

- Waiting Confirm

- Context

AI sử dụng bảng này để tiếp tục xử lý nếu người dùng Refresh trình duyệt.

Sau khi hồ sơ hoàn thành hoặc bị hủy, Conversation sẽ bị xóa.

---

## AIMessage

Lưu toàn bộ hội thoại giữa sinh viên và AI Agent.

Không áp dụng cho Chatbot góc màn hình.

Chatbot popup không lưu lịch sử.

Sau khi hồ sơ hoàn thành hoặc người dùng đăng xuất, toàn bộ hội thoại sẽ bị xóa.

---

## ThongBao

Thông báo chỉ sử dụng cho chuông Notification trên Header.

Thông báo chỉ bao gồm:

- nội dung

- đã đọc

- ngày tạo

- yêu cầu liên quan

Sinh viên chỉ đọc được thông báo.

Không được click trực tiếp vào thông báo.

Muốn xem chi tiết phải vào:

Sidebar

↓

Hồ sơ đã gửi

↓

Xem chi tiết hồ sơ.

---

# Quy tắc nghiệp vụ

## Một sinh viên

Một thời điểm chỉ được có tối đa một hồ sơ chưa hoàn thành.

Không được gửi đồng thời nhiều thủ tục.

---

## Một yêu cầu

Chỉ thuộc đúng một sinh viên.

---

## Một yêu cầu

Chỉ thuộc đúng một loại thủ tục.

---

## Một yêu cầu

Có nhiều minh chứng.

---

## Một yêu cầu

Có nhiều bản ghi lịch sử xử lý.

---

## Một yêu cầu

Có một AI Conversation.

---

## Một AI Conversation

Có nhiều AI Message.

---

## Một yêu cầu

Có nhiều thông báo.

---

# AI Agent

AI Agent được chia thành 4 Agent nhỏ.

- Conversation Agent

- Business Rule Agent

- Document Agent

- OCR Agent

Database phải hỗ trợ đầy đủ workflow này.

---

# Chatbot

Chatbot popup góc dưới bên phải KHÔNG sử dụng Database.

Không lưu lịch sử chat.

Không có Conversation.

Không có Message.

Đóng popup là kết thúc.

---

# OCR

OCR chỉ kiểm tra:

- Có đúng loại minh chứng không.

- Có đúng tên file không.

- Có đúng định dạng PDF/JPG/JPEG/PNG không.

OCR không đánh giá tính hợp lệ của nội dung.

Việc xác minh nội dung do Phòng Đào tạo thực hiện thủ công.

---

# PDF

PDF được Django sinh sau khi:

- Kiểm tra Business Rule thành công.

- Sinh viên bổ sung đầy đủ thông tin.

- Sinh viên upload đủ minh chứng.

Sinh viên xem Preview trước khi gửi.

Database chỉ lưu bản PDF cuối cùng.

---

# Yêu cầu triển khai

Cline cần:

- Đọc toàn bộ Database hiện tại.
- Đánh giá lại toàn bộ quan hệ.
- Chuẩn hóa khóa chính, khóa ngoại.
- Kiểm tra tính hợp lý của các thuộc tính.
- Thiết kế Django Models tối ưu.
- Đề xuất Index cần thiết.
- Đề xuất Unique Constraint.
- Đề xuất Check Constraint.
- Đề xuất Cascade phù hợp.
- Không thay đổi nghiệp vụ đã thống nhất.
- Không thay đổi Workflow AI Agent.
- Không thay đổi quy trình xử lý hồ sơ.
- Không thay đổi kiến trúc Database nếu không thực sự cần thiết.
- Nếu phát hiện vấn đề trong thiết kế hiện tại, phải giải thích rõ lý do trước khi đề xuất thay đổi.
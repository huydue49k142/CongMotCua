# Chapter 8 - Knowledge Base (RAG Data)

## 1. Giới thiệu

Knowledge Base là kho dữ liệu trung tâm của AI Agent.

AI Agent không tự suy diễn các quy định học vụ mà chỉ sử dụng dữ liệu được lưu trong Knowledge Base để:

- Trả lời các câu hỏi của sinh viên.
- Hướng dẫn thực hiện thủ tục.
- Cung cấp mẫu đơn tương ứng.
- Cung cấp file Excel kiểm tra điều kiện (đối với thủ tục Chuyển ngành).
- Hỗ trợ Planner đưa ra quyết định phù hợp trong từng bước của quy trình.

Knowledge Base được xây dựng từ:

- Thông tin do Phòng Đào tạo cung cấp.
- Quy trình nghiệp vụ thực tế của nhà trường.
- Các mẫu đơn chính thức.
- Các biểu mẫu Excel do nhà trường sử dụng.

---

# 2. Cấu trúc thư mục

```
knowledge_base/
│
├── knowledge/
│   └── due_knowledge.json
│
├── forms/
│   ├── don_chuyen_nganh.docx
│   ├── don_bao_luu.docx
│   ├── don_hoc_tiep.docx
│   └── don_thoi_hoc.docx
│
├── excel/
│   └── change_major_score.xlsm
│
└── README.md
```

---

# 3. Mô tả từng thành phần

## 3.1 knowledge/

Chứa dữ liệu tri thức mà AI Agent sử dụng để trả lời sinh viên.

Hiện tại hệ thống sử dụng:

```
due_knowledge.json
```

Trong file này lưu:

- Thông tin trường
- Các thủ tục học vụ
- Điều kiện
- Hồ sơ cần nộp
- Quy trình thực hiện
- Nơi nộp hồ sơ
- Thời hạn
- Chi phí
- FAQ
- Liên kết tài nguyên

Đây là nguồn dữ liệu chính của AI Agent.

---

## 3.2 forms/

Chứa các mẫu đơn chính thức.

Ví dụ:

- Đơn xin chuyển ngành
- Đơn xin bảo lưu
- Đơn xin thôi học
- Đơn xin trở lại học tập

Các file này KHÔNG dùng để trả lời câu hỏi.

Chúng được Tool Generate Form sử dụng để:

- tự động điền thông tin sinh viên;
- tạo bản xem trước (Preview);
- xuất PDF hoàn chỉnh.

---

## 3.3 excel/

Chứa các file Excel do nhà trường cung cấp.

Ví dụ:

```
change_major_score.xlsm
```

Đối với thủ tục Chuyển ngành:

AI Agent sẽ:

- hướng dẫn sinh viên tải file Excel;
- sinh viên tự nhập điểm theo quy định của trường;
- Excel tự tính kết quả;
- AI tiếp tục xử lý sau khi sinh viên xác nhận kết quả.

AI Agent không tự tính điểm thay cho Excel.

---

# 4. Quy tắc sử dụng Knowledge Base

AI Agent phải tuân thủ các nguyên tắc sau:

## Rule 1

Chỉ sử dụng dữ liệu có trong Knowledge Base.

Không tự suy diễn.

---

## Rule 2

Nếu Knowledge Base chưa có thông tin

↓

AI phải thông báo:

"Tôi hiện chưa có dữ liệu chính thức để trả lời câu hỏi này. Bạn vui lòng liên hệ Phòng Đào tạo."

---

## Rule 3

Không thay đổi nội dung dữ liệu.

Knowledge Base chỉ được cập nhật bởi quản trị viên.

---

## Rule 4

Các mẫu đơn phải giữ nguyên định dạng.

AI chỉ được phép điền thông tin.

Không được thay đổi bố cục.

---

## Rule 5

Các file Excel không được chỉnh sửa.

AI chỉ cung cấp chức năng tải xuống.

---

# 5. Luồng sử dụng Knowledge Base

```
Sinh viên

      │

      ▼

AI Agent

      │

      ▼

Planner

      │

      ▼

Knowledge Loader

      │

      ▼

due_knowledge.json

      │

      ▼

Planner

      │

      ▼

Response Generator

      │

      ▼

Phản hồi sinh viên
```

---

# 6. Luồng tạo đơn

```
Sinh viên

      │

      ▼

AI Agent

      │

      ▼

Generate Form Tool

      │

      ▼

forms/*.docx

      │

      ▼

Điền thông tin sinh viên

      │

      ▼

Preview

      │

      ▼

Xuất PDF
```

---

# 7. Luồng tải Excel

```
Sinh viên

      │

      ▼

AI Agent

      │

      ▼

Download Tool

      │

      ▼

change_major_score.xlsm

      │

      ▼

Sinh viên tự kiểm tra điều kiện

      │

      ▼

AI tiếp tục xử lý
```

---

# 8. Vai trò trong AI Agent

Knowledge Base không phải là bộ não của AI Agent.

Vai trò của Knowledge Base là cung cấp dữ liệu cho các thành phần khác.

```
Planner
        │
        ▼
Knowledge Loader
        │
        ▼
Knowledge Base
        │
        ▼
Response Generator
```

Knowledge Base chỉ lưu trữ dữ liệu.

Planner quyết định sử dụng dữ liệu nào.

Response Generator tạo câu trả lời cho sinh viên.

Generate Form Tool sử dụng các mẫu đơn để tạo biểu mẫu hoàn chỉnh.

---

# 9. Khả năng mở rộng

Trong tương lai có thể bổ sung:

- Thêm các thủ tục học vụ khác.
- Thêm FAQ.
- Thêm tài liệu PDF nếu nhà trường ban hành.
- Thêm các mẫu đơn mới.
- Thêm nhiều file Excel kiểm tra điều kiện.
- Tích hợp Vector Database nếu khối lượng dữ liệu tăng lớn.

Kiến trúc hiện tại vẫn giữ nguyên và chỉ cần mở rộng dữ liệu.

---

# 10. Kết luận

Knowledge Base là nguồn dữ liệu chính phục vụ AI Agent.

Toàn bộ thông tin dùng để tư vấn, hướng dẫn và hỗ trợ sinh viên đều được lấy từ Knowledge Base thay vì để mô hình AI tự suy diễn.

Thiết kế này giúp hệ thống:

- dễ bảo trì;
- dễ cập nhật;
- đảm bảo tính nhất quán;
- giảm nguy cơ AI trả lời sai quy định của nhà trường.
# Workflow: Trao đổi với AI Chatbot

---

# 1. Mục đích

Workflow này mô tả quy trình sinh viên tương tác với AI Chatbot để được giải đáp các câu hỏi liên quan đến:

- Thủ tục học vụ.
- Quy định đào tạo.
- Hướng dẫn sử dụng hệ thống.
- Các câu hỏi thường gặp (FAQ).

AI Chatbot chỉ có chức năng **hỏi đáp** và **không thực hiện bất kỳ nghiệp vụ hành chính nào**.

---

# 2. Phạm vi

Workflow này chỉ áp dụng cho AI Chatbot hỗ trợ hỏi đáp.

Workflow không bao gồm:

- Thực hiện thủ tục học vụ.
- Kiểm tra điều kiện thủ tục.
- Tạo hồ sơ.
- Sinh PDF hoặc Word.
- OCR minh chứng.
- AI Agent xử lý nghiệp vụ.
- Workflow n8n.

---

# 3. Actors

- Sinh viên

---

# 4. Trigger

Sinh viên nhấn vào biểu tượng **AI Chatbot** ở góc dưới bên phải màn hình.

---

# 5. Preconditions

- Sinh viên đã đăng nhập thành công.
- AI Chatbot đang hoạt động.
- Dịch vụ AI khả dụng.

---

# 6. Postconditions

- AI Chatbot trả lời câu hỏi của sinh viên.
- Lịch sử hội thoại được lưu trong phiên đăng nhập hiện tại.

---

# 7. Main Workflow

## STEP 1

Sinh viên nhấn vào biểu tượng AI Chatbot.

---

## STEP 2

Hệ thống hiển thị cửa sổ hội thoại (Popup Chat).

---

## STEP 3

AI Chatbot hiển thị lời chào.

Ví dụ:

> Xin chào! Tôi là AI Chatbot hỗ trợ giải đáp các câu hỏi về thủ tục học vụ và hướng dẫn sử dụng hệ thống. Tôi có thể giúp gì cho bạn?

---

## STEP 4

Sinh viên nhập câu hỏi.

Ví dụ:

- Điều kiện chuyển ngành là gì?
- Hồ sơ bảo lưu gồm những giấy tờ nào?
- Tôi cần chuẩn bị gì để thôi học?
- Làm thế nào để sử dụng hệ thống?

---

## STEP 5

Sinh viên nhấn nút **Gửi**.

---

## STEP 6

Hệ thống gửi câu hỏi đến AI Chatbot.

---

## STEP 7

AI Chatbot phân tích nội dung câu hỏi.

---

## STEP 8

AI Chatbot truy xuất nguồn tri thức (Knowledge Base/RAG) để tìm thông tin phù hợp.

---

## STEP 9

AI Chatbot tạo câu trả lời.

---

## STEP 10

Hệ thống hiển thị câu trả lời trong cửa sổ hội thoại.

---

## STEP 11

Sinh viên tiếp tục đặt câu hỏi hoặc đóng cửa sổ Chatbot.

Workflow kết thúc.

---

# 8. Alternative Flow

## AF-01

Sinh viên đóng cửa sổ Chatbot.

Popup Chat được đóng.

Workflow kết thúc.

---

## AF-02

Sinh viên tiếp tục nhập câu hỏi mới.

Workflow quay lại **STEP 4**.

---

# 9. Exception Flow

## EX-01

Không thể gửi câu hỏi đến AI Chatbot.

Hệ thống hiển thị thông báo:

> Gửi câu hỏi không thành công. Vui lòng thử lại sau.

Workflow kết thúc.

---

## EX-02

AI Chatbot không tìm thấy thông tin phù hợp.

Hệ thống hiển thị:

> Xin lỗi, tôi chưa có thông tin về nội dung này. Vui lòng liên hệ Phòng Đào tạo để được hỗ trợ.

Workflow kết thúc.

---

## EX-03

Dịch vụ AI tạm thời không khả dụng.

Hệ thống hiển thị:

> AI Chatbot hiện không khả dụng. Vui lòng thử lại sau.

Workflow kết thúc.

---

# 10. Business Rules

## BR4-1

AI Chatbot chỉ có chức năng trả lời câu hỏi.

---

## BR4-2

AI Chatbot không được thực hiện bất kỳ nghiệp vụ hành chính nào.

---

## BR4-3

AI Chatbot không được tạo hoặc chỉnh sửa dữ liệu của hệ thống.

---

## BR4-4

Nếu không có thông tin phù hợp, AI Chatbot phải thông báo và hướng dẫn sinh viên liên hệ Phòng Đào tạo.

---

## BR4-5

Lịch sử hội thoại chỉ được lưu trong phiên đăng nhập hiện tại.

Sau khi sinh viên đăng xuất, toàn bộ lịch sử hội thoại sẽ được xóa.

---

# 11. Nguồn dữ liệu

AI Chatbot sử dụng các nguồn dữ liệu sau:

- Quy định đào tạo.
- Thông tin các thủ tục học vụ.
- Tài liệu hướng dẫn sử dụng hệ thống.
- Bộ câu hỏi thường gặp (FAQ).
- Các tài liệu được quản trị viên cấu hình cho AI Chatbot.

---

# 12. API Mapping

Workflow sử dụng:

POST /api/v1/chatbot/message

GET /api/v1/chatbot/history

---

# 13. Database Mapping

Workflow đọc dữ liệu từ:

- chatbot_knowledge_base
- chatbot_documents
- chatbot_faq

Workflow ghi dữ liệu vào:

- chatbot_conversations
- chatbot_messages

---

# 14. Security

Backend luôn kiểm tra:

- JWT Authentication.
- Quyền truy cập của sinh viên.

AI Chatbot chỉ phục vụ người dùng đã đăng nhập.

---

# 15. Logging

Ghi nhận:

- Student ID.
- Timestamp.
- Question.
- Response Status.
- Processing Time.

Không ghi log các thông tin nhạy cảm hoặc dữ liệu cá nhân ngoài phạm vi cần thiết.

---

# 16. Performance

Mục tiêu:

- Thời gian phản hồi dưới 5 giây.
- Hỗ trợ hội thoại liên tục trong cùng một phiên đăng nhập.
- Đảm bảo khả năng phục vụ nhiều người dùng đồng thời.

---

# 17. Workflow Summary

```text
Sinh viên

↓

Nhấn biểu tượng AI Chatbot

↓

Popup Chat mở

↓

Nhập câu hỏi

↓

Nhấn Gửi

↓

Backend

↓

AI Chatbot

↓

Knowledge Base / RAG

↓

Sinh câu trả lời

↓

Hiển thị phản hồi

↓

Tiếp tục hỏi hoặc đóng Chatbot
```
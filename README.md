# Project: CongMotCua - Cổng Một Cửa

Ứng dụng AI Agent và Tự động hóa quy trình hành chính tại Phòng Đào tạo.

## 📁 Cấu trúc thư mục

### Backend (Django REST Framework)
- `backend/core/`: Cấu hình chính của dự án.
- `backend/apps/`: Chứa các module chức năng (Users, Procedures, Requests, OCR, AI).
- `backend/services/`: **Service Layer** - Chứa toàn bộ Business Logic (tuân thủ Clean Architecture).
- `backend/api/`: Định nghĩa các API Endpoints.

### Frontend (Next.js)
- `frontend/app/`: App Router với phân chia nhóm `(auth)`, `(student)`, `(staff)`.
- `frontend/components/`: UI Components phân cấp từ base (`ui`) đến đặc thù nghiệp vụ.
- `frontend/services/`: API Client kết nối tới Backend.

### Automation & Docs
- `n8n/`: Chứa các workflow automation JSON.
- `docs/`: Tài liệu kỹ thuật, ERD và API Specification.

## 🛠 Tech Stack
- **Backend**: Django, DRF, Supabase PostgreSQL.
- **Frontend**: Next.js, Tailwind CSS, TypeScript.
- **Automation**: n8n.
- **AI/OCR**: AI Agent & OCR Service.
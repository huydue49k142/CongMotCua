FROM python:3.11-slim

# Cài đặt các thư viện hệ thống cần thiết cho Tesseract OCR và PostgreSQL
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-vie \
    poppler-utils \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Đặt thư mục làm việc
WORKDIR /app

# Copy requirement và cài đặt thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code vào Docker
COPY . .

# Expose cổng 8000
EXPOSE 8000

# Chạy lệnh gom file tĩnh, migrate database và khởi chạy Gunicorn Server
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:8000"]

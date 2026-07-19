import uuid
from django.db import models
from apps.requests.models import Request

class Evidence(models.Model):
    """Model MinhChung"""
    id = models.BigAutoField(primary_key=True)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="evidences", verbose_name="Yêu cầu")
    file = models.FileField(upload_to='evidences/%Y/%m/%d/', verbose_name="Tệp tin")
    file_type = models.CharField(max_length=100, verbose_name="Loại minh chứng")
    upload_batch = models.PositiveIntegerField(default=1, verbose_name="Lần bổ sung")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Minh chứng cho {self.request.id}"

    class Meta:
        verbose_name = "Minh chứng"
        verbose_name_plural = "Các minh chứng"

class GeneratedDocument(models.Model):
    """Model SinhTaiLieuTuDong"""
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="generated_document")
    pdf_file = models.FileField(upload_to='generated_docs/%Y/%m/%d/', verbose_name="Tệp PDF")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Tài liệu cho {self.request.id}"

    class Meta:
        verbose_name = "Tài liệu tự động"
        verbose_name_plural = "Các tài liệu tự động"
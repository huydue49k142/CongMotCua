from django.db import models
from django.conf import settings
from apps.requests.models import Request

class Notification(models.Model):
    """Model ThongBao"""
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications", verbose_name="Người nhận")
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="notifications", verbose_name="Yêu cầu liên quan")
    content = models.TextField(verbose_name="Nội dung")
    is_read = models.BooleanField(default=False, db_index=True, verbose_name="Đã đọc")
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Thông báo cho {self.user.username}"

    class Meta:
        verbose_name = "Thông báo"
        verbose_name_plural = "Các thông báo"
        ordering = ['-created_at']
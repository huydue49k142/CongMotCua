import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', _('Sinh viên')
        TRAINING_OFFICE = 'TRAINING_OFFICE', _('Cán bộ Phòng Đào tạo')

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Đang hoạt động')
        INACTIVE = 'INACTIVE', _('Ngưng hoạt động')

    # User ID must be exactly 12 digits (AUTH-002)
    user_code = models.CharField(
        max_length=12, 
        unique=True, 
        validators=[RegexValidator(r'^\d{12}$', 'User ID phải bao gồm đúng 12 chữ số.')],
        verbose_name=_('Mã người dùng')
    )
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name=_('Vai trò')
    )
    
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name=_('Trạng thái')
    )
    
    # Use UUID for Primary Key as per database.md
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Ngày tạo'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Ngày cập nhật'))

    class Meta:
        verbose_name = _('Người dùng')
        verbose_name_plural = _('Người dùng')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.user_code})"
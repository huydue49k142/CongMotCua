import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Sinh viên"
        STAFF = "STAFF", "Phòng đào tạo"
        ADMIN = "ADMIN", "Quản trị viên"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.STUDENT)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = "Tài khoản"
        verbose_name_plural = "Tài khoản"
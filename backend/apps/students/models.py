import uuid
from django.conf import settings
from django.db import models

class Major(models.Model):
    """Model Nganh"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Tên ngành")
    major_id = models.CharField(max_length=100, unique=True, verbose_name="Mã ngành")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Class(models.Model):
    """Model Lop"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Tên lớp")
    class_id = models.CharField(max_length=100, unique=True, verbose_name="Mã lớp")
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="classes", verbose_name="Ngành")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    """Model SinhVien"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name="student_profile")
    student_id = models.CharField(max_length=100, unique=True, verbose_name="Mã số sinh viên")
    full_name = models.CharField(max_length=255, verbose_name="Họ và tên")
    date_of_birth = models.DateField(verbose_name="Ngày sinh")
    student_class = models.ForeignKey(Class, on_delete=models.PROTECT, related_name="students", verbose_name="Lớp")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name
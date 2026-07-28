import uuid
from django.conf import settings
from django.db import models
from apps.common.models import BaseModel

class Major(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Tên ngành")
    major_id = models.CharField(max_length=100, unique=True, verbose_name="Mã ngành")
    faculty_name = models.CharField(max_length=255, blank=True, default="", verbose_name="Tên khoa")
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Ngành"
        verbose_name_plural = "Ngành"
        

class Class(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Tên lớp")
    class_id = models.CharField(max_length=100, unique=True, verbose_name="Mã lớp")
    major = models.ForeignKey(Major, on_delete=models.PROTECT, related_name="classes", verbose_name="Ngành")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Lớp"
        verbose_name_plural = "Lớp"

class Student(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name="student_profile")
    student_id = models.CharField(max_length=100, unique=True, verbose_name="Mã số sinh viên")
    full_name = models.CharField(max_length=255, verbose_name="Họ và tên")
    date_of_birth = models.DateField(verbose_name="Ngày sinh")
    student_class = models.ForeignKey(Class, on_delete=models.PROTECT, related_name="students", verbose_name="Lớp")
    phone = models.CharField(max_length=20, blank=True, default="", verbose_name="Số điện thoại")
    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "Sinh viên"
        verbose_name_plural = "Sinh viên"
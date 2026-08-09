from django.urls import path
from .views import StudentProfileAPIView, MajorListAPIView

urlpatterns = [
    path('majors/', MajorListAPIView.as_view(), name='major-list'),
    path('<str:student_id>/profile/', StudentProfileAPIView.as_view(), name='student-profile'),
]
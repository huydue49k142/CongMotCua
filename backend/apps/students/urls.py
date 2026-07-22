from django.urls import path
from .views import StudentProfileAPIView

urlpatterns = [
    path('<str:student_id>/profile/', StudentProfileAPIView.as_view(), name='student-profile'),
]
from django.urls import path
from .views import OCRVerificationView

app_name = 'ocr_integration'

urlpatterns = [
    path('verify/', OCRVerificationView.as_view(), name='verify-document'),
]
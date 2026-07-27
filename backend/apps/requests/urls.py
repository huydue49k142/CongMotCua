from django.urls import path
from .views import DraftRequestAPIView, RequestListAPIView

urlpatterns = [
    path('', RequestListAPIView.as_view(), name='request-list'),
    path('draft/', DraftRequestAPIView.as_view(), name='create-draft-request'),
]
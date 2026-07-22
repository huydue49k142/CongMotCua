from django.urls import path
from .views import DraftRequestAPIView

urlpatterns = [
    path('draft/', DraftRequestAPIView.as_view(), name='create-draft-request'),
]
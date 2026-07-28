from django.urls import path
from .views import (
    DraftRequestAPIView, RequestListAPIView, StaffRequestListAPIView, StaffDashboardStatsAPIView,
    RequestDetailAPIView, StaffRequestDetailAPIView, StaffRequestActionAPIView, StudentResubmitAPIView
)

urlpatterns = [
    path('staff/', StaffRequestListAPIView.as_view(), name='staff-request-list'),
    path('staff/stats/', StaffDashboardStatsAPIView.as_view(), name='staff-request-stats'),
    path('staff/<uuid:pk>/', StaffRequestDetailAPIView.as_view(), name='staff-request-detail'),
    path('staff/<uuid:pk>/action/', StaffRequestActionAPIView.as_view(), name='staff-request-action'),
    
    path('', RequestListAPIView.as_view(), name='request-list'),
    path('<uuid:pk>/', RequestDetailAPIView.as_view(), name='request-detail'),
    path('<uuid:pk>/resubmit/', StudentResubmitAPIView.as_view(), name='student-request-resubmit'),
    
    path('draft/', DraftRequestAPIView.as_view(), name='create-draft-request'),
]
from django.urls import path
from .views import (
    DraftRequestAPIView,
    RequestListAPIView,
    StaffRequestListAPIView,
    StaffDashboardStatsAPIView,
    RequestDetailAPIView,
    StaffRequestDetailAPIView,
    StaffRequestActionAPIView,
    StudentResubmitAPIView,
    ProcedureDraftAPIView,
    ProcedureDraftDocumentAPIView,
    ProcedureDraftDocumentDetailAPIView,
    ProcedureDraftDocumentFileAPIView,
)

urlpatterns = [
    path('staff/', StaffRequestListAPIView.as_view(), name='staff-request-list'),
    path('staff/stats/', StaffDashboardStatsAPIView.as_view(), name='staff-request-stats'),
    path('staff/<uuid:pk>/', StaffRequestDetailAPIView.as_view(), name='staff-request-detail'),
    path('staff/<uuid:pk>/action/', StaffRequestActionAPIView.as_view(), name='staff-request-action'),
    # API file bản nháp mới. Đặt trước route draft tổng quát.
    path(
        "drafts/<str:request_type>/documents/",
        ProcedureDraftDocumentAPIView.as_view(),
        name="procedure-draft-documents",
    ),
    path(
        "drafts/<str:request_type>/documents/<uuid:document_id>/",
        ProcedureDraftDocumentDetailAPIView.as_view(),
        name="procedure-draft-document-detail",
    ),
    path(
        "drafts/<str:request_type>/documents/<uuid:document_id>/file/",
        ProcedureDraftDocumentFileAPIView.as_view(),
        name="procedure-draft-document-file",
    ),

    # Route lưu tiến trình cũ được giữ nguyên.
    path(
        "drafts/<str:request_type>/",
        ProcedureDraftAPIView.as_view(),
        name="procedure-draft",
    ),
    path('', RequestListAPIView.as_view(), name='request-list'),
    path('<uuid:pk>/', RequestDetailAPIView.as_view(), name='request-detail'),
    path('<uuid:pk>/resubmit/', StudentResubmitAPIView.as_view(), name='student-request-resubmit'),
    path('draft/', DraftRequestAPIView.as_view(), name='create-draft-request'),
]
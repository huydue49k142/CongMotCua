from django.urls import path

from apps.documents.views import (
    DownloadDropoutFormAPIView,
    DownloadRetentionFormAPIView,
    DownloadResumeFormAPIView,
    DownloadMajorChangeFormAPIView,
    CheckRetentionEligibilityAPIView,
)

from .views import PreviewMajorChangeFormAPIView


app_name = "documents"


urlpatterns = [
    path(
        "dropout/download/",
        DownloadDropoutFormAPIView.as_view(),
        name="download-dropout-form",
    ),

    path(
        "retention/download/",
        DownloadRetentionFormAPIView.as_view(),
        name="download-retention-form",
    ),

    # THÊM CÁI NÀY
    path(
        "retention/check-eligibility/",
        CheckRetentionEligibilityAPIView.as_view(),
        name="retention-check-eligibility",
    ),

    path(
        "resume/download/",
        DownloadResumeFormAPIView.as_view(),
        name="download-resume-form",
    ),

    path(
        "major-change/download/",
        DownloadMajorChangeFormAPIView.as_view(),
        name="download-major-change-form",
    ),

    path(
        "major-change/preview/",
        PreviewMajorChangeFormAPIView.as_view(),
        name="major-change-preview",
    ),
]
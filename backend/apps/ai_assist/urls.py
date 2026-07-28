from django.urls import path
from . import views

app_name = 'ai_assist'

urlpatterns = [
    path('start', views.StartProcedure.as_view(), name='thoi_hoc_start'),
    path('confirm-start', views.ConfirmStart.as_view(), name='thoi_hoc_confirm_start'),
    path('submit-form', views.SubmitForm.as_view(), name='thoi_hoc_submit_form'),
    path('confirm-terms', views.ConfirmTerms.as_view(), name='thoi_hoc_confirm_terms'),
    path('download-docx', views.DownloadDocx.as_view(), name='thoi_hoc_download_docx'),
    path('confirm-download', views.ConfirmDownload.as_view(), name='thoi_hoc_confirm_download'),
    path('upload-verify', views.UploadVerify.as_view(), name='thoi_hoc_upload_verify'),
    path('review', views.Review.as_view(), name='thoi_hoc_review'),
    path('submit', views.SubmitApplication.as_view(), name='thoi_hoc_submit'),
    path('scan-retention/', views.ScanRetentionDocumentAPI.as_view(), name='scan-retention'),
    path('scan-dropout/', views.ScanDropoutDocumentAPI.as_view(), name='scan-dropout'),
    path('scan-major-change/', views.ScanMajorChangeDocumentAPI.as_view(), name='scan-major-change'),
    path('scan-resume/', views.ScanResumeDocumentAPI.as_view(), name='scan-resume'),
    path('submit-resume/', views.SubmitResumeApplication.as_view(), name='submit-resume'),
    path('submit-retention/', views.SubmitRetentionApplication.as_view(), name='submit-retention'),
    path('draft/retention/save/', views.SaveRetentionDraftAPIView.as_view(), name='save-retention-draft'),
    path('draft/retention/get/', views.GetRetentionDraftAPIView.as_view(), name='get-retention-draft'),
    path('draft/dropout/save/', views.SaveDropoutDraftAPIView.as_view(), name='save-dropout-draft'),
    path('draft/dropout/get/', views.GetDropoutDraftAPIView.as_view(), name='get-dropout-draft'),
    path('submit-dropout/', views.SubmitDropoutApplication.as_view(), name='submit-dropout'),
]

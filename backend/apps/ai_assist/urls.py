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
]

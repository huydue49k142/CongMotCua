from django.db import models
from apps.common.models import BaseModel

class OCRJob(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    # Assuming you have a Request model to link to
    # request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='ocr_jobs')
    
    uploaded_file = models.FileField(upload_to='ocr_uploads/')
    expected_title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    def __str__(self):
        return f"OCR Job for {self.uploaded_file.name} ({self.get_status_display()})"

class OCRResult(BaseModel):
    job = models.OneToOneField(OCRJob, on_delete=models.CASCADE, related_name='result')
    
    is_match = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0, help_text="Similarity score from 0.0 to 1.0")
    
    extracted_text = models.TextField(blank=True, help_text="Full text extracted from the document")
    extracted_title = models.CharField(max_length=500, blank=True)
    
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"Result for Job {self.job.id} - Match: {self.is_match}"
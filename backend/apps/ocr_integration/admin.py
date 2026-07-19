from django.contrib import admin
from .models import OCRJob, OCRResult

@admin.register(OCRJob)
class OCRJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'uploaded_file', 'expected_title', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('expected_title', 'uploaded_file')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(OCRResult)
class OCRResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'is_match', 'confidence', 'extracted_title', 'created_at')
    list_filter = ('is_match', 'created_at')
    search_fields = ('extracted_title',)
    readonly_fields = ('id', 'job', 'created_at', 'updated_at')
    raw_id_fields = ('job',)
from rest_framework import serializers
from .models import OCRJob, OCRResult

class OCRJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRJob
        fields = ('id', 'uploaded_file', 'expected_title', 'status', 'created_at')
        read_only_fields = ('status', 'id', 'created_at')

class OCRResultSerializer(serializers.ModelSerializer):
    job = OCRJobSerializer(read_only=True)
    
    class Meta:
        model = OCRResult
        fields = (
            'id', 
            'job', 
            'is_match', 
            'confidence', 
            'extracted_title', 
            'expected_title', # From related job
            'error_message',
        )
    
    expected_title = serializers.CharField(source='job.expected_title', read_only=True)

class OCRVerificationRequestSerializer(serializers.Serializer):
    uploaded_file = serializers.FileField(write_only=True)
    expected_title = serializers.CharField(max_length=255, write_only=True)
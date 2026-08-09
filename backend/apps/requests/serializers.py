from django.urls import reverse
from rest_framework import serializers
from .models import Request, Student

from .models import RequestHistory, RequestDocument, ProcedureDraft, ProcedureDraftDocument

class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['id', 'student', 'request_type', 'status', 'created_at', 'updated_at']

class StaffRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = Request
        fields = ['id', 'student_name', 'student_code', 'request_type', 'status', 'submitted_at', 'created_at', 'updated_at']

from .models import RequestHistory, RequestDocument

class RequestHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True, default="Hệ thống")
    
    class Meta:
        model = RequestHistory
        fields = ['id', 'status', 'actor_name', 'notes', 'timestamp']

class RequestDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestDocument
        fields = ['id', 'file', 'file_name', 'document_type', 'document_key', 'uploaded_at']

class DetailedRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_id', read_only=True)
    history = RequestHistorySerializer(many=True, read_only=True)
    documents = RequestDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Request
        fields = [
            'id', 'student_name', 'student_code', 'request_type', 
            'status', 'submitted_at', 'completed_at', 'created_at', 
            'updated_at', 'history', 'documents', 'supplement_requirements'
        ]

class DraftRequestSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=100)
    request_type = serializers.ChoiceField(choices=Request.RequestType.choices)

    def validate_student_id(self, value):
        if not Student.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Student with this ID does not exist.")
        return value

    def create(self, validated_data):
        student = Student.objects.get(student_id=validated_data['student_id'])
        
        # Check for existing active request
        active_request = Request.objects.filter(
            student=student
        ).exclude(
            status__in=[Request.Status.APPROVED, Request.Status.REJECTED, Request.Status.CANCELLED]
        ).first()

        if active_request:
            raise serializers.ValidationError(
                f"Student already has an active request (ID: {active_request.id}, Status: {active_request.get_status_display()})."
            )

        request = Request.objects.create(
            student=student,
            request_type=validated_data['request_type'],
            status=Request.Status.DRAFT
        )
        return request


class ProcedureDraftSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ProcedureDraft

        fields = [
            "id",
            "request_type",
            "is_started",
            "current_step",
            "draft_data",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class ProcedureDraftDocumentSerializer(
    serializers.ModelSerializer
):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProcedureDraftDocument
        fields = [
            "id",
            "document_key",
            "original_name",
            "content_type",
            "file_size",
            "file_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        relative_url = reverse(
            "procedure-draft-document-file",
            kwargs={
                "request_type": obj.draft.request_type,
                "document_id": obj.id,
            },
        )

        request = self.context.get("request")

        if request is not None:
            return request.build_absolute_uri(
                relative_url
            )

        return relative_url
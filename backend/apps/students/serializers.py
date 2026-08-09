from rest_framework import serializers
from .models import Student, Class, Major
from ..users.serializers import UserSerializer

class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = ['name', 'major_id', 'admission_threshold']

class ClassSerializer(serializers.ModelSerializer):
    major = MajorSerializer()
    class Meta:
        model = Class
        fields = ['name', 'class_id', 'major']

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    student_class = ClassSerializer()
    
    # Placeholder fields for data from other apps (TBD)
    gpa = serializers.SerializerMethodField()
    total_credits = serializers.SerializerMethodField()
    discipline_status = serializers.SerializerMethodField()
    study_duration_in_semesters = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'user',
            'student_id',
            'full_name',
            'date_of_birth',
            'student_class',
            'gpa',
            'total_credits',
            'discipline_status',
            'study_duration_in_semesters',
            'admission_score',
            'admission_combo',
            'created_at',
            'updated_at'
        ]

    def get_gpa(self, obj):
        # TODO: Implement logic to get GPA from academic records app
        return 3.25 # Placeholder value

    def get_total_credits(self, obj):
        # TODO: Implement logic to get credits from academic records app
        return 120 # Placeholder value
        
    def get_discipline_status(self, obj):
        # TODO: Implement logic to get discipline status from discipline app
        return "Không có" # Placeholder value

    def get_study_duration_in_semesters(self, obj):
        # TODO: Implement logic to calculate study duration
        return 4 # Placeholder value
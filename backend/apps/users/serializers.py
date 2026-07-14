from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'user_code', 'role', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'user_code', 'role', 'status']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class AuthSerializer(serializers.Serializer):
    # Allow login with either username or user_code
    identifier = serializers.CharField(max_length=150, help_text="Username or User Code (12 digits)")
    password = serializers.CharField(write_only=True)
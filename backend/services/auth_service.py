from django.contrib.auth import authenticate, logout
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User
from django.db.models import Q

class AuthService:
    @staticmethod
    def authenticate_user(identifier, password):
        """
        Authenticates a user.
        Implements AUTH-003: Only active accounts allowed.
        Strictly enforces username format: 2311215142xx
        """
        # Find user by username or email
        try:
            user = User.objects.get(Q(username=identifier) | Q(email=identifier))
        except User.DoesNotExist:
            raise ValidationError("Tên đăng nhập không chính xác.")
        except User.MultipleObjectsExist:
            raise ValidationError("Có nhiều hơn một tài khoản khớp với thông tin này.")

        # Verify password
        if not user.check_password(password):
            raise ValidationError("Mật khẩu không chính xác.")
        
        # Check status (AUTH-003)
        if not user.is_active:
            raise ValidationError("Tài khoản của bạn hiện không hoạt động. Vui lòng liên hệ quản trị viên.")
            
        refresh = RefreshToken.for_user(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'full_name': f"{user.last_name} {user.first_name}".strip(),
                'role': user.role
            }
        }

    @staticmethod
    def logout_user(refresh_token):
        """
        Logs out a user by blacklisting the refresh token.
        Implements AUTH-005: Logout must invalidate the current session.
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            raise ValidationError("Token không hợp lệ hoặc đã hết hạn.")
        
        return True

    @staticmethod
    def verify_username(username):
        """Verifies if a user exists."""
        return User.objects.filter(username=username).exists()

    @staticmethod
    def reset_password(username, new_password):
        """Resets user password."""
        try:
            user = User.objects.get(username=username)
            user.set_password(new_password)
            user.save()
            return True
        except User.DoesNotExist:
            raise ValidationError("Người dùng không tồn tại.")

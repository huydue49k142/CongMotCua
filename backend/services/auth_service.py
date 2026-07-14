from django.contrib.auth import authenticate, logout
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User
from django.db.models import Q

class AuthService:
    @staticmethod
    def authenticate_user(identifier, password):
        """
        Authenticates a user using either username or user_code.
        Implements AUTH-003: Only active accounts are allowed to log in.
        """
        # Find user by username or user_code
        try:
            user = User.objects.get(Q(username=identifier) | Q(user_code=identifier))
        except User.DoesNotExist:
            raise ValidationError("Tên đăng nhập hoặc mã người dùng không chính xác.")
        except User.MultipleObjectsExist:
            raise ValidationError("Có nhiều hơn một tài khoản khớp với thông tin này.")

        # Verify password
        if not user.check_password(password):
            raise ValidationError("Mật khẩu không chính xác.")
        
        # Check status (AUTH-003)
        if user.status != User.Status.ACTIVE:
            raise ValidationError("Tài khoản của bạn hiện không hoạt động. Vui lòng liên hệ quản trị viên.")
            
        refresh = RefreshToken.for_user(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'user_code': user.user_code,
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
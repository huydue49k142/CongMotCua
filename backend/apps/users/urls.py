from django.urls import path
from .views import LoginView, LogoutView, UserProfileView, VerifyUsernameView, ResetPasswordView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('verify-username/', VerifyUsernameView.as_view(), name='verify-username'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]

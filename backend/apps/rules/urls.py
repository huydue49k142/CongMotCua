from django.urls import path
from .views import CheckBusinessRuleAPIView

urlpatterns = [
    path('check/', CheckBusinessRuleAPIView.as_view(), name='check-business-rule'),
]
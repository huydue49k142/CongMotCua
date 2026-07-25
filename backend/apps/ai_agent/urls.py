from django.urls import path
from .views import AgentChatView, AgentStateView, AgentCancelView

urlpatterns = [
    path('chat/', AgentChatView.as_view(), name='agent-chat'),
    path('state/', AgentStateView.as_view(), name='agent-state'),
    path('cancel/', AgentCancelView.as_view(), name='agent-cancel'),
]
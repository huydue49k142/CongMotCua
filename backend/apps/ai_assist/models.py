from django.db import models
from apps.requests.models import Request
from apps.common.models import BaseModel

class AIConversation(BaseModel):
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="ai_conversation")
    context = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "AI Conversation"
        verbose_name_plural = "AI Conversations"

class AIMessage(models.Model):
    class Role(models.TextChoices):
        USER = "USER", "Người dùng"
        ASSISTANT = "ASSISTANT", "Trợ lý AI"

    id = models.BigAutoField(primary_key=True)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "AI Message"
        verbose_name_plural = "AI Messages"
        ordering = ['timestamp']
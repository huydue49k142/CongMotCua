from django.db import models
from apps.requests.models import Request

class AIConversation(models.Model):
    """Model AIConversation"""
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="ai_conversation")
    workflow_status = models.CharField(max_length=100, verbose_name="Trạng thái workflow")
    context = models.JSONField(default=dict, verbose_name="Context")
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AI Conversation for Request {self.request_id}"

    class Meta:
        verbose_name = "AI Conversation"
        verbose_name_plural = "AI Conversations"

class AIMessage(models.Model):
    """Model AIMessage"""
    id = models.BigAutoField(primary_key=True)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name="messages", verbose_name="Hội thoại")
    sender = models.CharField(max_length=50, verbose_name="Người gửi") # 'USER' or 'AI'
    content = models.TextField(verbose_name="Nội dung")
    
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"

    class Meta:
        verbose_name = "AI Message"
        verbose_name_plural = "AI Messages"
        ordering = ['timestamp']
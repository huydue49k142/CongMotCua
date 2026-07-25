"""
Intent Classifier - Detects user intent from messages.

Based on: prompts/intent_classifier.md
"""
import re
from enum import Enum
from typing import Optional


class Intent(str, Enum):
    """Supported intents that the AI Agent can handle."""
    CHANGE_MAJOR = 'CHANGE_MAJOR'
    DROP_OUT = 'DROP_OUT'
    SUSPEND = 'SUSPEND'
    RESUME = 'RESUME'
    
    # Support intents
    CANCEL = 'CANCEL'
    HELP = 'HELP'
    STATUS = 'STATUS'
    
    # Unknown / Out of scope
    UNKNOWN = 'UNKNOWN'
    OUT_OF_SCOPE = 'OUT_OF_SCOPE'


class IntentClassifier:
    """
    Classifies user messages into intents using keyword/pattern matching.
    
    In production, this could be replaced with an ML model or LLM-based classifier.
    For now, we use a rule-based approach that covers the key academic procedures.
    """
    
    # Keyword patterns for each workflow type
    INTENT_PATTERNS = {
        Intent.CHANGE_MAJOR: [
            r'chuyển (ngành|khoa|trường)',
            r'đổi (ngành|chuyên ngành)',
            r'chuyển sang (ngành|khoa)',
            r'xin chuyển',
            r'đăng ký chuyển',
            r'muốn chuyển ngành',
            r'chuyển ngành học',
            r'change (major|faculty)',
            r'transfer',
        ],
        Intent.DROP_OUT: [
            r'thôi (học|trường)',
            r'rút hồ sơ',
            r'xin thôi',
            r'bỏ học',
            r'drop (out|school)',
            r'quit school',
        ],
        Intent.SUSPEND: [
            r'bảo lưu',
            r'tạm (nghỉ|dừng)',
            r'nghỉ (một|1) học kỳ',
            r'tạm ngưng',
            r'suspend',
            r'take (a )?break',
        ],
        Intent.RESUME: [
            r'học tiếp',
            r'xin (học|vào) (lại|tiếp)',
            r'quay (lại|trở) (lớp|học|trường)',
            r'nhập học (lại|tiếp)',
            r'resume',
            r're-?enroll',
        ],
        Intent.CANCEL: [
            r'h?ủy',
            r'cancel',
            r'dừng (lại|quy trình)',
            r'không (muốn|thích) (nữa|tiếp)',
            r'thoát',
            r'kết thúc',
        ],
        Intent.HELP: [
            r'giúp',
            r'hỗ trợ',
            r'help',
            r'hướng dẫn',
            r'có thể',
            r'how (to|can|do)',
            r'what can you',
        ],
        Intent.STATUS: [
            r'trạng thái',
            r'đến đâu',
            r'tiến (độ|trình)',
            r'status',
            r'progress',
            r'đang (làm|ở)',
        ],
    }
    
    # Out-of-scope patterns - non-academic topics
    OUT_OF_SCOPE_PATTERNS = [
        r'thời tiết',
        r'tin tức',
        r'bóng đá',
        r'weather',
        r'news',
        r'sport',
        r'food',
        r'cook',
        r'game',
        r'movie',
        r'travel',
        r'music',
        r'chính trị',
        r'kinh tế',
        r'health|sức khỏe',
    ]
    
    def __init__(self, confidence_threshold: float = 0.5):
        self.confidence_threshold = confidence_threshold
    
    def classify(self, message: str) -> dict:
        """
        Classify a user message into an intent.
        
        Returns:
        {
            'intent': Intent,
            'confidence': float,
            'matched_pattern': str or None
        }
        """
        message_lower = message.lower().strip()
        
        # Check for out-of-scope first
        for pattern in self.OUT_OF_SCOPE_PATTERNS:
            if re.search(pattern, message_lower):
                return {
                    'intent': Intent.OUT_OF_SCOPE,
                    'confidence': 0.9,
                    'matched_pattern': pattern,
                }
        
        best_intent = Intent.UNKNOWN
        best_confidence = 0.0
        best_pattern = None
        
        # Check each intent's patterns
        for intent, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    # Simple confidence heuristic
                    match_len = len(re.search(pattern, message_lower).group())
                    confidence = min(1.0, match_len / len(message) + 0.3) if message else 0.3
                    
                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_intent = intent
                        best_pattern = pattern
        
        return {
            'intent': best_intent,
            'confidence': best_confidence,
            'matched_pattern': best_pattern,
        }
    
    def is_workflow_intent(self, intent: Intent) -> bool:
        """Check if the intent starts a new workflow."""
        return intent in (
            Intent.CHANGE_MAJOR,
            Intent.DROP_OUT,
            Intent.SUSPEND,
            Intent.RESUME,
        )
    
    def is_support_intent(self, intent: Intent) -> bool:
        """Check if the intent is a support action (cancel, help, status)."""
        return intent in (Intent.CANCEL, Intent.HELP, Intent.STATUS)
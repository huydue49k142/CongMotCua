"""
Response Generator - Generates user-facing responses.

Based on: prompts/response_generator.md, prompts/states/*.md
Generates appropriate responses based on current state and user actions.
"""
from typing import Optional, Dict, Any
from .models.session import WorkflowMemory


class ResponseGenerator:
    """
    Generates responses for the AI Agent.
    
    Each state has a specific response template.
    The generator ensures responses are:
    - Lịch sự (polite)
    - Ngắn gọn (concise)
    - Rõ ràng (clear)
    - Từng bước (step by step)
    - Một bước → Một yêu cầu (one step at a time)
    """
    
    # State response templates based on prompts/states/*.md
    STATE_TEMPLATES = {
        'WAIT_UPLOAD_DOCUMENT': (
            'Vui lòng tải lên:\n'
            '• Giấy báo trúng tuyển\n'
            '• Giấy chứng nhận tốt nghiệp THPT'
        ),
        'VERIFY_INFORMATION': (
            'Hệ thống đã đọc thông tin từ tài liệu của bạn.\n'
            'Vui lòng kiểm tra và xác nhận.'
        ),
        'WAIT_TARGET_MAJOR': (
            'Bạn muốn chuyển sang ngành nào?'
        ),
        'WAIT_EXCEL_DOWNLOAD': (
            'Vui lòng tải file Excel kiểm tra điều kiện chuyển ngành.\n'
            'Việc kiểm tra điều kiện được thực hiện theo quy trình chính thức của Nhà trường.'
        ),
        'WAIT_ELIGIBILITY_CONFIRM': (
            'Bạn vui lòng xác nhận:\n'
            '• "Tôi đủ điều kiện"\n'
            '• "Tôi không đủ điều kiện"'
        ),
        'WAIT_EXAM_METHOD': (
            'Vui lòng chọn phương thức xét tuyển:\n'
            '• THPT\n'
            '• Học bạ\n'
            '• ĐGNL\n'
            '• Tuyển thẳng'
        ),
        'WAIT_SCORE_INPUT': (
            'Vui lòng nhập điểm theo định dạng:\n'
            '"Toán: 8.5, Lý: 7.0, Hóa: 9.0"'
        ),
        'GENERATE_FORM': (
            'Đang tạo đơn chuyển ngành...'
        ),
        'PREVIEW_FORM': (
            'Đơn chuyển ngành đã được tạo.\n'
            'Vui lòng kiểm tra trước khi nộp.'
        ),
        'DONE': (
            'Hồ sơ chuyển ngành của bạn đã được tiếp nhận.\n'
            'Cảm ơn bạn đã sử dụng dịch vụ!'
        ),
    }
    
    # System prompt style guidelines
    STYLE_RULES = {
        'polite': True,
        'concise': True,
        'one_question_at_a_time': True,
        'no_lan_man': True,
    }
    
    def generate(self, memory: WorkflowMemory, decision: dict, 
                 tool_result: Optional[Dict] = None) -> str:
        """
        Generate a response based on current state and planner decision.
        
        Args:
            memory: Current workflow memory
            decision: Planner's decision object
            tool_result: Result from tool execution (if any)
        
        Returns:
            Response string to show to user
        """
        # If planner provided a custom response, use it
        if decision.get('response'):
            return decision['response']
        
        # Otherwise, use template for current state
        state_template = self.STATE_TEMPLATES.get(memory.current_state)
        if state_template:
            return state_template
        
        # Fallback
        return 'Vui lòng làm theo hướng dẫn.'
    
    def generate_error(self, error_message: str) -> str:
        """Generate a polite error response."""
        return (
            'Xin lỗi, hệ thống đang gặp sự cố.\n\n'
            f'{error_message}\n\n'
            'Vui lòng thử lại hoặc liên hệ Phòng Đào tạo để được hỗ trợ.'
        )
    
    def generate_out_of_scope(self) -> str:
        """Generate response for out-of-scope questions."""
        return (
            'Xin lỗi, tôi chỉ hỗ trợ các thủ tục học vụ.\n\n'
            'Các nghiệp vụ tôi có thể hỗ trợ:\n'
            '• Chuyển ngành\n'
            '• Bảo lưu\n'
            '• Xin học tiếp\n'
            '• Thôi học\n\n'
            'Vui lòng liên hệ Phòng Đào tạo để được hỗ trợ thêm.'
        )
    
    def generate_welcome(self) -> str:
        """Generate welcome message when starting a conversation."""
        return (
            'Chào bạn! Tôi là trợ lý ảo của Phòng Đào tạo.\n\n'
            'Tôi có thể hỗ trợ bạn các thủ tục sau:\n'
            '• Chuyển ngành\n'
            '• Bảo lưu\n'
            '• Xin học tiếp\n'
            '• Thôi học\n\n'
            'Bạn cần hỗ trợ thủ tục nào?'
        )
    
    def generate_status(self, memory: WorkflowMemory) -> str:
        """Generate current workflow status message."""
        state_descriptions = {
            'START': 'Chưa bắt đầu',
            'WAIT_UPLOAD_DOCUMENT': 'Đang chờ tải tài liệu',
            'WAIT_OCR': 'Đang đọc tài liệu',
            'VERIFY_INFORMATION': 'Đang chờ xác nhận thông tin',
            'WAIT_TARGET_MAJOR': 'Đang chờ nhập ngành muốn chuyển',
            'PREVIEW_DOCUMENT': 'Đang xem trước tài liệu',
            'WAIT_EXCEL_DOWNLOAD': 'Đang chờ tải Excel kiểm tra',
            'WAIT_ELIGIBILITY_CONFIRM': 'Đang chờ xác nhận điều kiện',
            'WAIT_EXAM_METHOD': 'Đang chọn phương thức xét tuyển',
            'WAIT_SCORE_INPUT': 'Đang nhập điểm',
            'GENERATE_FORM': 'Đang tạo đơn',
            'PREVIEW_FORM': 'Đang xem trước đơn',
            'SUBMIT_REQUEST': 'Đang gửi hồ sơ',
            'DONE': 'Hoàn thành',
            'CANCELLED': 'Đã hủy',
            'ERROR': 'Lỗi',
        }
        
        state_text = state_descriptions.get(memory.current_state, memory.current_state)
        
        return (
            f'Trạng thái hiện tại: {state_text}\n'
            f'Quy trình: {memory.workflow_type}\n'
            f'Mã số: {memory.student.get("studentId", "N/A") if memory.student else "N/A"}'
        )
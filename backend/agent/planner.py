"""
Planner - The core decision-making engine of the AI Agent.

Based on: planner/planner.md, planner/decision_tree.md, prompts/decision_prompt.md
The Planner reads current state, memory, and user input to decide the next action.
"""
from typing import Optional, Dict, Any
from .models.session import WorkflowMemory
from .intent_classifier import Intent, IntentClassifier
from .state_machine import StateMachine, WorkflowType


class Planner:
    """
    The Planner is the heart of the AI Agent.
    
    Responsibilities:
    1. Read current state from memory
    2. Read user input
    3. Analyze based on decision tree (decision_tree.md)
    4. Decide next action (ask question, call tool, transition state)
    5. Return a Decision Object
    
    Decision Object:
    {
        "action": str,         # ASK_QUESTION | CALL_TOOL | TRANSITION | END_WORKFLOW | CONFIRM
        "nextState": str,      # State to transition to (or None)
        "tool": str,           # Tool to call (or None)
        "tool_params": dict,   # Parameters for the tool
        "response": str,       # Message to show user
        "memory_updates": dict # Updates to apply to memory
    }
    """
    
    def __init__(self):
        self.intent_classifier = IntentClassifier()
    
    def plan(self, message: str, intent: Intent, memory: WorkflowMemory, 
             tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Main planning method.
        Determines the next action based on current state and user input.
        """
        current_state = memory.current_state
        
        # Handle cancellation anytime
        if intent == Intent.CANCEL:
            return self._handle_cancel(memory)
        
        # Route to state-specific handler
        state_handlers = {
            'START': self._handle_start,
            'WAIT_UPLOAD_DOCUMENT': self._handle_wait_upload,
            'WAIT_OCR': self._handle_wait_ocr,
            'VERIFY_INFORMATION': self._handle_verify,
            'WAIT_TARGET_MAJOR': self._handle_target_major,
            'PREVIEW_DOCUMENT': self._handle_preview_doc,
            'WAIT_EXCEL_DOWNLOAD': self._handle_excel_download,
            'WAIT_ELIGIBILITY_CONFIRM': self._handle_eligibility,
            'WAIT_EXAM_METHOD': self._handle_exam_method,
            'WAIT_SCORE_INPUT': self._handle_score_input,
            'GENERATE_FORM': self._handle_generate_form,
            'PREVIEW_FORM': self._handle_preview_form,
            'SUBMIT_REQUEST': self._handle_submit,
            'DONE': self._handle_done,
            'CANCELLED': self._handle_cancelled,
            'ERROR': self._handle_error,
        }
        
        handler = state_handlers.get(current_state)
        if not handler:
            return self._error_response(f"Unknown state: {current_state}")
        
        return handler(message, memory, tool_result)
    
    def _handle_start(self, message: str, memory: WorkflowMemory, 
                      tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """START state - Initialize workflow and welcome user."""
        return {
            'action': 'TRANSITION',
            'nextState': 'WAIT_UPLOAD_DOCUMENT',
            'tool': None,
            'tool_params': {},
            'response': (
                'Tôi sẽ hỗ trợ bạn thực hiện thủ tục chuyển ngành.\n\n'
                'Bước đầu tiên, vui lòng tải lên:\n'
                '• Giấy báo trúng tuyển\n'
                '• Giấy chứng nhận tốt nghiệp THPT'
            ),
            'memory_updates': {
                'current_state': 'WAIT_UPLOAD_DOCUMENT',
            }
        }
    
    def _handle_wait_upload(self, message: str, memory: WorkflowMemory,
                            tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_UPLOAD_DOCUMENT - Check if documents are uploaded."""
        # Check if user indicates they've uploaded
        upload_keywords = ['upload', 'tải lên', 'đã tải', 'xong', 'file', 'tài liệu']
        has_uploaded = any(kw in message.lower() for kw in upload_keywords)
        
        if has_uploaded:
            return {
                'action': 'CALL_TOOL',
                'nextState': 'WAIT_OCR',
                'tool': 'OCR',
                'tool_params': {
                    'files': memory.documents
                },
                'response': 'Hệ thống đang đọc tài liệu...',
                'memory_updates': {
                    'documents.uploaded': True,
                    'current_state': 'WAIT_OCR',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': (
                    'Vui lòng tải lên 2 tài liệu sau:\n'
                    '• Giấy báo trúng tuyển\n'
                    '• Giấy chứng nhận tốt nghiệp THPT'
                ),
                'memory_updates': {}
            }
    
    def _handle_wait_ocr(self, message: str, memory: WorkflowMemory,
                         tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_OCR - Process OCR result."""
        if tool_result and tool_result.get('success'):
            ocr_data = tool_result.get('data', {})
            return {
                'action': 'TRANSITION',
                'nextState': 'VERIFY_INFORMATION',
                'tool': None,
                'tool_params': {},
                'response': (
                    'Hệ thống đã đọc thành công tài liệu của bạn.\n\n'
                    'Thông tin trích xuất:\n'
                    f'- Họ tên: {ocr_data.get("student", {}).get("fullName", "N/A")}\n'
                    f'- Ngày sinh: {ocr_data.get("student", {}).get("birthDate", "N/A")}\n'
                    f'- CCCD: {ocr_data.get("student", {}).get("citizenId", "N/A")}\n'
                    f'- Phương thức: {ocr_data.get("exam", {}).get("admissionMethod", "N/A")}\n'
                    f'- Tổ hợp: {ocr_data.get("exam", {}).get("subjectGroup", "N/A")}\n'
                    f'- Điểm: {ocr_data.get("exam", {}).get("totalScore", "N/A")}\n\n'
                    'Vui lòng kiểm tra và xác nhận thông tin trên có đúng không?'
                ),
                'memory_updates': {
                    'ocr': ocr_data,
                    'current_state': 'VERIFY_INFORMATION',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': 'WAIT_UPLOAD_DOCUMENT',
                'tool': None,
                'tool_params': {},
                'response': 'Không thể đọc được tài liệu. Vui lòng tải lên lại với chất lượng tốt hơn.',
                'memory_updates': {
                    'current_state': 'WAIT_UPLOAD_DOCUMENT',
                }
            }
    
    def _handle_verify(self, message: str, memory: WorkflowMemory,
                       tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """VERIFY_INFORMATION - Handle information confirmation."""
        confirm_keywords = ['đúng', 'chuẩn', 'ok', 'có', 'xác nhận', 'confirm', 'yes']
        edit_keywords = ['sai', 'không đúng', 'sửa', 'edit', 'chỉnh', 'nhầm']
        
        message_lower = message.lower()
        
        if any(kw in message_lower for kw in confirm_keywords):
            return {
                'action': 'TRANSITION',
                'nextState': 'WAIT_TARGET_MAJOR',
                'tool': None,
                'tool_params': {},
                'response': 'Thông tin đã được xác nhận. Bạn muốn chuyển sang ngành nào?',
                'memory_updates': {
                    'verification.confirmed': True,
                    'verification.confirmTime': __import__('datetime').datetime.now().isoformat(),
                    'current_state': 'WAIT_TARGET_MAJOR',
                }
            }
        elif any(kw in message_lower for kw in edit_keywords):
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': 'Vui lòng cho biết thông tin nào cần chỉnh sửa và nhập thông tin đúng.',
                'memory_updates': {
                    'verification.edited': True,
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': (
                    'Thông tin trên có đúng không?\n'
                    'Trả lời: "Đúng" để xác nhận hoặc "Sai" để chỉnh sửa.'
                ),
                'memory_updates': {}
            }
    
    def _handle_target_major(self, message: str, memory: WorkflowMemory,
                             tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_TARGET_MAJOR - Get target major from student."""
        # Check if message contains a major/field of study name
        # In production, this would validate against a list of available majors
        if len(message.strip()) > 2 and message.strip().lower() not in ['', 'không', 'no']:
            target_major = message.strip()
            
            # Check not same as current major
            if memory.student and memory.student.get('currentMajor'):
                if target_major.lower() == memory.student['currentMajor'].lower():
                    return {
                        'action': 'ASK_QUESTION',
                        'nextState': None,
                        'tool': None,
                        'tool_params': {},
                        'response': f'Ngành "{target_major}" trùng với ngành hiện tại của bạn. Vui lòng chọn ngành khác.',
                        'memory_updates': {}
                    }
            
            return {
                'action': 'TRANSITION',
                'nextState': 'PREVIEW_DOCUMENT',
                'tool': None,
                'tool_params': {},
                'response': f'Đã ghi nhận. Bạn muốn chuyển sang ngành {target_major}.',
                'memory_updates': {
                    'targetMajor': target_major,
                    'current_state': 'PREVIEW_DOCUMENT',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': 'Vui lòng nhập tên ngành bạn muốn chuyển đến.',
                'memory_updates': {}
            }
    
    def _handle_preview_doc(self, message: str, memory: WorkflowMemory,
                            tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """PREVIEW_DOCUMENT - Confirm documents before proceeding to Excel."""
        confirm_keywords = ['đúng', 'ok', 'xác nhận', 'confirm', 'tiếp', 'được', 'yes']
        reupload_keywords = ['không', 'sai', 'upload lại', 'tải lại', 'chọn lại']
        
        message_lower = message.lower()
        
        if any(kw in message_lower for kw in confirm_keywords):
            return {
                'action': 'TRANSITION',
                'nextState': 'WAIT_EXCEL_DOWNLOAD',
                'tool': None,
                'tool_params': {},
                'response': (
                    'Tài liệu đã được xác nhận.\n\n'
                    'Bước tiếp theo: Vui lòng tải file Excel kiểm tra điều kiện chuyển ngành '
                    '(theo quy trình chính thức của Nhà trường).'
                ),
                'memory_updates': {
                    'current_state': 'WAIT_EXCEL_DOWNLOAD',
                }
            }
        elif any(kw in message_lower for kw in reupload_keywords):
            return {
                'action': 'TRANSITION',
                'nextState': 'WAIT_UPLOAD_DOCUMENT',
                'tool': None,
                'tool_params': {},
                'response': 'Vui lòng tải lên lại tài liệu.',
                'memory_updates': {
                    'current_state': 'WAIT_UPLOAD_DOCUMENT',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': 'Tài liệu đã được tải lên. Bạn xác nhận tài liệu này hay muốn tải lại?',
                'memory_updates': {}
            }
    
    def _handle_excel_download(self, message: str, memory: WorkflowMemory,
                               tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_EXCEL_DOWNLOAD - Wait for student to download Excel file."""
        downloaded_keywords = ['đã tải', 'xong', 'downloaded', 'tải rồi', 'được']
        
        if any(kw in message.lower() for kw in downloaded_keywords):
            return {
                'action': 'TRANSITION',
                'nextState': 'WAIT_ELIGIBILITY_CONFIRM',
                'tool': None,
                'tool_params': {},
                'response': (
                    'Sau khi kiểm tra file Excel, bạn vui lòng xác nhận:\n'
                    '"Tôi đủ điều kiện" hoặc "Tôi không đủ điều kiện"'
                ),
                'memory_updates': {
                    'current_state': 'WAIT_ELIGIBILITY_CONFIRM',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': (
                    'Vui lòng tải file Excel kiểm tra điều kiện chuyển ngành.\n'
                    'Sau khi kiểm tra, vui lòng báo lại kết quả.'
                ),
                'memory_updates': {}
            }
    
    def _handle_eligibility(self, message: str, memory: WorkflowMemory,
                           tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_ELIGIBILITY_CONFIRM - Handle eligibility confirmation."""
        eligible_keywords = ['đủ điều kiện', 'được', 'có thể', 'eligible', 'đủ', 'yes']
        not_eligible_keywords = ['không đủ', 'không được', 'không thể', 'not eligible', 'no']
        
        message_lower = message.lower()
        
        if any(kw in message_lower for kw in eligible_keywords):
            return {
                'action': 'CALL_TOOL',
                'nextState': 'WAIT_EXAM_METHOD',
                'tool': 'ConditionChecker',
                'tool_params': {'eligible': True},
                'response': (
                    'Đã ghi nhận bạn đủ điều kiện chuyển ngành.\n\n'
                    'Vui lòng chọn phương thức xét tuyển:\n'
                    '• THPT\n'
                    '• Học bạ\n'
                    '• ĐGNL (Đánh giá năng lực)\n'
                    '• Tuyển thẳng'
                ),
                'memory_updates': {
                    'eligible': True,
                    'current_state': 'WAIT_EXAM_METHOD',
                }
            }
        elif any(kw in message_lower for kw in not_eligible_keywords):
            return {
                'action': 'END_WORKFLOW',
                'nextState': 'CANCELLED',
                'tool': 'ConditionChecker',
                'tool_params': {'eligible': False},
                'response': (
                    'Cảm ơn bạn đã xác nhận.\n\n'
                    'Quy trình chuyển ngành kết thúc. Nếu bạn cần hỗ trợ thêm, '
                    'vui lòng liên hệ Phòng Đào tạo.'
                ),
                'memory_updates': {
                    'eligible': False,
                    'status': 'CANCELLED',
                    'current_state': 'CANCELLED',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': (
                    'Vui lòng xác nhận:\n'
                    '"Tôi đủ điều kiện" hoặc "Tôi không đủ điều kiện"'
                ),
                'memory_updates': {}
            }
    
    def _handle_exam_method(self, message: str, memory: WorkflowMemory,
                           tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_EXAM_METHOD - Handle exam method selection."""
        methods = {
            'thpt': 'THPT',
            'học bạ': 'HOC_BA',
            'đgnl': 'ĐGNL',
            'đánh giá năng lực': 'ĐGNL',
            'tuyển thẳng': 'TUYEN_THANG',
        }
        
        message_lower = message.lower().strip()
        selected_method = None
        
        for keyword, method in methods.items():
            if keyword in message_lower:
                selected_method = method
                break
        
        if selected_method:
            # Generate appropriate score form based on method
            if selected_method == 'THPT':
                response_text = (
                    f'Đã chọn phương thức {selected_method}.\n\n'
                    'Vui lòng nhập điểm:\n'
                    '• Toán\n'
                    '• Lý\n'
                    '• Hóa\n'
                    '• Điểm ưu tiên (nếu có)'
                )
            elif selected_method == 'HOC_BA':
                response_text = (
                    f'Đã chọn phương thức {selected_method}.\n\n'
                    'Vui lòng nhập điểm trung bình các học kỳ.'
                )
            elif selected_method == 'ĐGNL':
                response_text = (
                    f'Đã chọn phương thức {selected_method}.\n\n'
                    'Vui lòng nhập điểm Đánh giá năng lực.'
                )
            else:
                response_text = (
                    f'Đã chọn phương thức {selected_method}.'
                )
            
            return {
                'action': 'TRANSITION',
                'nextState': 'WAIT_SCORE_INPUT',
                'tool': None,
                'tool_params': {},
                'response': response_text,
                'memory_updates': {
                    'examMethod': selected_method,
                    'current_state': 'WAIT_SCORE_INPUT',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': (
                    'Vui lòng chọn phương thức xét tuyển:\n'
                    '• THPT\n'
                    '• Học bạ\n'
                    '• ĐGNL\n'
                    '• Tuyển thẳng'
                ),
                'memory_updates': {}
            }
    
    def _handle_score_input(self, message: str, memory: WorkflowMemory,
                           tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """WAIT_SCORE_INPUT - Handle score input from student."""
        # Try to parse scores from message
        # In production, this would be more sophisticated
        import re
        
        scores = {}
        # Look for patterns like "Toán: 8.5" or "toán 8.5"
        score_patterns = [
            (r'toán\s*[:]?\s*(\d+\.?\d*)', 'toan'),
            (r'lý\s*[:]?\s*(\d+\.?\d*)', 'ly'),
            (r'hóa\s*[:]?\s*(\d+\.?\d*)', 'hoa'),
            (r'ưu tiên\s*[:]?\s*(\d+\.?\d*)', 'uutien'),
            (r'đgnl\s*[:]?\s*(\d+\.?\d*)', 'dgnl'),
            (r'đánh giá năng lực\s*[:]?\s*(\d+\.?\d*)', 'dgnl'),
        ]
        
        for pattern, key in score_patterns:
            match = re.search(pattern, message.lower())
            if match:
                scores[key] = float(match.group(1))
        
        if scores:
            # Merge with existing scores
            existing_scores = dict(memory.scores) if memory.scores else {}
            existing_scores.update(scores)
            
            # Check if we have enough scores based on exam method
            method = memory.examMethod
            if method == 'THPT' and len(existing_scores) >= 3:
                return {
                    'action': 'TRANSITION',
                    'nextState': 'GENERATE_FORM',
                    'tool': None,
                    'tool_params': {},
                    'response': 'Đã nhập đủ điểm. Đang tạo đơn chuyển ngành...',
                    'memory_updates': {
                        'scores': existing_scores,
                        'current_state': 'GENERATE_FORM',
                    }
                }
            elif method in ('HOC_BA', 'ĐGNL') and existing_scores:
                return {
                    'action': 'TRANSITION',
                    'nextState': 'GENERATE_FORM',
                    'tool': None,
                    'tool_params': {},
                    'response': 'Đã nhập đủ điểm. Đang tạo đơn chuyển ngành...',
                    'memory_updates': {
                        'scores': existing_scores,
                        'current_state': 'GENERATE_FORM',
                    }
                }
            else:
                return {
                    'action': 'ASK_QUESTION',
                    'nextState': None,
                    'tool': None,
                    'tool_params': {},
                    'response': 'Vui lòng nhập thêm các môn còn thiếu.',
                    'memory_updates': {
                        'scores': existing_scores,
                    }
                }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': 'Vui lòng nhập điểm theo định dạng: "Toán: 8.5, Lý: 7.0, Hóa: 9.0"',
                'memory_updates': {}
            }
    
    def _handle_generate_form(self, message: str, memory: WorkflowMemory,
                             tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """GENERATE_FORM - Generate the application form."""
        if tool_result and tool_result.get('success'):
            form_data = tool_result.get('data', {})
            return {
                'action': 'TRANSITION',
                'nextState': 'PREVIEW_FORM',
                'tool': None,
                'tool_params': {},
                'response': (
                    'Đơn chuyển ngành đã được tạo thành công.\n\n'
                    'Bạn có thể xem trước đơn. Vui lòng kiểm tra kỹ thông tin trước khi nộp.'
                ),
                'memory_updates': {
                    'generatedForm': form_data,
                    'current_state': 'PREVIEW_FORM',
                }
            }
        else:
            return {
                'action': 'CALL_TOOL',
                'nextState': 'GENERATE_FORM',
                'tool': 'PDFGenerator',
                'tool_params': {
                    'mode': 'PREVIEW',
                    'data': memory.to_dict(),
                },
                'response': 'Đang tạo đơn chuyển ngành...',
                'memory_updates': {}
            }
    
    def _handle_preview_form(self, message: str, memory: WorkflowMemory,
                            tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """PREVIEW_FORM - Handle form preview and confirmation."""
        submit_keywords = ['nộp', 'đồng ý', 'submit', 'gửi', 'ok', 'được']
        edit_keywords = ['sửa', 'edit', 'chỉnh', 'quay lại', 'thay đổi', 'sai']
        
        message_lower = message.lower()
        
        if any(kw in message_lower for kw in submit_keywords):
            return {
                'action': 'CALL_TOOL',
                'nextState': 'SUBMIT_REQUEST',
                'tool': 'Workflow',
                'tool_params': {
                    'data': memory.to_dict(),
                },
                'response': 'Đang gửi hồ sơ...',
                'memory_updates': {
                    'current_state': 'SUBMIT_REQUEST',
                }
            }
        elif any(kw in message_lower for kw in edit_keywords):
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': 'Bạn muốn chỉnh sửa thông tin nào? (Điểm / Phương thức xét tuyển / Ngành)',
                'memory_updates': {}
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': None,
                'tool': None,
                'tool_params': {},
                'response': (
                    'Đơn chuyển ngành đã được tạo.\n\n'
                    'Bạn có thể:\n'
                    '• "Nộp" để gửi hồ sơ\n'
                    '• "Sửa" để chỉnh sửa thông tin'
                ),
                'memory_updates': {}
            }
    
    def _handle_submit(self, message: str, memory: WorkflowMemory,
                      tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """SUBMIT_REQUEST - Handle workflow submission result."""
        if tool_result and tool_result.get('success'):
            submit_data = tool_result.get('data', {})
            return {
                'action': 'TRANSITION',
                'nextState': 'DONE',
                'tool': None,
                'tool_params': {},
                'response': (
                    '✅ Hồ sơ chuyển ngành của bạn đã được tiếp nhận.\n\n'
                    f'Mã hồ sơ: {submit_data.get("requestId", "N/A")}\n'
                    f'Ngày nộp: {submit_data.get("createdTime", "N/A")}\n'
                    f'Trạng thái: Đang chờ tiếp nhận\n\n'
                    'Vui lòng theo dõi thông báo từ Phòng Đào tạo.'
                ),
                'memory_updates': {
                    'submission': submit_data,
                    'submission.submitted': True,
                    'status': 'COMPLETED',
                    'current_state': 'DONE',
                }
            }
        else:
            return {
                'action': 'ASK_QUESTION',
                'nextState': 'SUBMIT_REQUEST',
                'tool': None,
                'tool_params': {},
                'response': 'Không thể gửi hồ sơ. Vui lòng thử lại. Bạn có muốn gửi lại không?',
                'memory_updates': {
                    'current_state': 'SUBMIT_REQUEST',
                }
            }
    
    def _handle_done(self, message: str, memory: WorkflowMemory,
                    tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """DONE - Terminal state."""
        return {
            'action': 'END_WORKFLOW',
            'nextState': 'DONE',
            'tool': None,
            'tool_params': {},
            'response': 'Hồ sơ của bạn đã được gửi thành công. Cảm ơn bạn đã sử dụng dịch vụ!',
            'memory_updates': {}
        }
    
    def _handle_cancel(self, memory: WorkflowMemory) -> Dict[str, Any]:
        """Handle user cancellation."""
        return {
            'action': 'END_WORKFLOW',
            'nextState': 'CANCELLED',
            'tool': None,
            'tool_params': {},
            'response': (
                'Quy trình đã được hủy.\n\n'
                'Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ Phòng Đào tạo.'
            ),
            'memory_updates': {
                'status': 'CANCELLED',
                'current_state': 'CANCELLED',
            }
        }
    
    def _handle_cancelled(self, message: str, memory: WorkflowMemory,
                         tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """CANCELLED - Terminal state."""
        return {
            'action': 'END_WORKFLOW',
            'nextState': 'CANCELLED',
            'tool': None,
            'tool_params': {},
            'response': 'Quy trình đã kết thúc. Cảm ơn bạn!',
            'memory_updates': {}
        }
    
    def _handle_error(self, message: str, memory: WorkflowMemory,
                     tool_result: Optional[Dict] = None) -> Dict[str, Any]:
        """ERROR - Handle error state."""
        return {
            'action': 'END_WORKFLOW',
            'nextState': 'ERROR',
            'tool': None,
            'tool_params': {},
            'response': 'Hệ thống đang gặp sự cố. Vui lòng thử lại hoặc liên hệ Phòng Đào tạo.',
            'memory_updates': {}
        }
    
    def _error_response(self, error_message: str) -> Dict[str, Any]:
        """Generate a standard error response."""
        return {
            'action': 'ERROR',
            'nextState': 'ERROR',
            'tool': None,
            'tool_params': {},
            'response': error_message,
            'memory_updates': {}
        }
"""
Tool Executor - Executes tool calls for the AI Agent.

Based on: tools/tool_specification.md
Each tool is a separate class that performs a specific function.
"""
from typing import Optional, Dict, Any
from datetime import datetime


class ToolResult:
    """Standard result format for all tool executions."""
    def __init__(self, success: bool, data: dict = None, error: str = None):
        self.success = success
        self.data = data or {}
        self.error = error
        self.timestamp = datetime.now()
    
    def to_dict(self) -> dict:
        return {
            'success': self.success,
            'data': self.data,
            'error': self.error,
            'timestamp': self.timestamp.isoformat(),
        }


class StudentServiceTool:
    """
    Student Service Tool - Retrieves student information from the system.
    
    Based on: tools/student_service.md
    - Input: studentId, accessToken
    - Output: Student Information JSON
    """
    
    def execute(self, student_id: str, access_token: str = None) -> ToolResult:
        """
        Get student information.
        In production, this would call the Django backend API.
        """
        # TODO: Replace with actual API call to backend
        # For now, return mock data for testing
        mock_data = {
            'studentId': student_id,
            'fullName': 'Nguyễn Văn A',
            'gender': 'Nam',
            'dateOfBirth': '2004-01-15',
            'citizenId': '079123456789',
            'email': f'{student_id}@student.edu.vn',
            'phoneNumber': '0901234567',
            'faculty': 'Công nghệ thông tin',
            'currentMajor': 'Kỹ thuật phần mềm',
            'course': 'K20',
            'academicStatus': 'Đang học',
        }
        return ToolResult(success=True, data=mock_data)


class OCRTool:
    """
    OCR Tool - Reads documents and extracts structured data.
    
    Based on: tools/ocr_tool.md
    - Input: PDF/JPG/PNG files
    - Output: JSON with student info and exam info
    """
    
    def execute(self, files: dict) -> ToolResult:
        """
        Process uploaded documents through OCR.
        
        Args:
            files: {
                'admissionLetter': file_path_or_url,
                'graduationCertificate': file_path_or_url
            }
        """
        # TODO: Integrate with actual OCR service (Google Vision, Azure, etc.)
        # For now, return mock OCR result
        mock_result = {
            'status': 'SUCCESS',
            'confidence': 96,
            'student': {
                'fullName': 'Nguyễn Văn A',
                'birthDate': '2004-01-15',
                'citizenId': '079123456789',
            },
            'exam': {
                'admissionMethod': 'THPT',
                'subjectGroup': 'A00',
                'totalScore': 27.50,
                'priorityScore': 0.50,
            }
        }
        return ToolResult(success=True, data=mock_result)


class ConditionCheckerTool:
    """
    Condition Checker Tool - Records student's eligibility confirmation.
    
    Based on: tools/condition_checker.md
    - Input: eligibility boolean
    - Output: confirmation result
    """
    
    def execute(self, eligible: bool) -> ToolResult:
        """
        Record student's self-assessment of eligibility.
        Tool does NOT calculate eligibility - it only records the student's choice.
        """
        return ToolResult(success=True, data={
            'eligible': eligible,
            'confirmed': True,
            'confirmTime': datetime.now().isoformat(),
        })


class PDFGeneratorTool:
    """
    PDF Generator Tool - Creates change major application form.
    
    Based on: tools/pdf_generator.md
    Two modes: Preview and Export
    """
    
    def execute(self, mode: str, data: dict) -> ToolResult:
        """
        Generate form in Preview or Export mode.
        
        Args:
            mode: 'PREVIEW' or 'EXPORT'
            data: All required form data
        """
        if mode == 'PREVIEW':
            return ToolResult(success=True, data={
                'status': 'SUCCESS',
                'mode': 'PREVIEW',
                'previewUrl': '/preview/change_major',
            })
        elif mode == 'EXPORT':
            return ToolResult(success=True, data={
                'status': 'SUCCESS',
                'mode': 'EXPORT',
                'fileName': 'change_major.pdf',
                'downloadUrl': '/download/change_major.pdf',
                'generatedTime': datetime.now().isoformat(),
            })
        else:
            return ToolResult(success=False, error=f"Unknown mode: {mode}")


class WorkflowTool:
    """
    Workflow Tool - Submits the request to the backend workflow system (n8n).
    
    Based on: tools/workflow_tool.md
    - Creates Request ID
    - Sends data to n8n
    - Returns workflow status
    """
    
    def execute(self, data: dict) -> ToolResult:
        """
        Submit workflow to n8n.
        
        Args:
            data: Complete workflow data (student, form, scores, etc.)
        """
        # TODO: Integrate with actual n8n webhook
        mock_result = {
            'status': 'SUCCESS',
            'requestId': f"CM{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'workflowStatus': 'CREATED',
            'createdTime': datetime.now().isoformat(),
        }
        return ToolResult(success=True, data=mock_result)


class NotificationTool:
    """
    Notification Tool - Sends notifications to students.
    
    Based on: tools/notification_tool.md
    Types: INFO, SUCCESS, WARNING, ERROR
    """
    
    def execute(self, notification_type: str, title: str, message: str, level: str = 'INFO') -> ToolResult:
        """
        Send a notification to the student.
        """
        return ToolResult(success=True, data={
            'displayed': True,
            'displayTime': datetime.now().isoformat(),
            'type': notification_type,
            'level': level,
        })


class ToolExecutor:
    """
    Main Tool Executor that routes tool calls to the appropriate tool.
    
    Based on: tools/tool_specification.md
    Available tools:
    1. StudentService - Get student info
    2. OCR - Read documents
    3. ConditionChecker - Record eligibility
    4. PDFGenerator - Generate forms
    5. Workflow - Submit to n8n
    6. Notification - Send notifications
    """
    
    def __init__(self):
        self.tools = {
            'StudentService': StudentServiceTool(),
            'OCR': OCRTool(),
            'ConditionChecker': ConditionCheckerTool(),
            'PDFGenerator': PDFGeneratorTool(),
            'Workflow': WorkflowTool(),
            'Notification': NotificationTool(),
        }
    
    def execute(self, tool_name: str, params: dict) -> ToolResult:
        """
        Execute a tool by name with given parameters.
        
        Args:
            tool_name: Name of the tool to execute
            params: Parameters for the tool
        
        Returns:
            ToolResult with success status and data
        """
        tool = self.tools.get(tool_name)
        if not tool:
            return ToolResult(success=False, error=f"Unknown tool: {tool_name}")
        
        try:
            if tool_name == 'StudentService':
                return tool.execute(
                    student_id=params.get('studentId'),
                    access_token=params.get('accessToken')
                )
            elif tool_name == 'OCR':
                return tool.execute(files=params.get('files', {}))
            elif tool_name == 'ConditionChecker':
                return tool.execute(eligible=params.get('eligible', False))
            elif tool_name == 'PDFGenerator':
                return tool.execute(
                    mode=params.get('mode', 'PREVIEW'),
                    data=params.get('data', {})
                )
            elif tool_name == 'Workflow':
                return tool.execute(data=params.get('data', {}))
            elif tool_name == 'Notification':
                return tool.execute(
                    notification_type=params.get('type', 'INFO'),
                    title=params.get('title', ''),
                    message=params.get('message', ''),
                    level=params.get('level', 'INFO')
                )
        except Exception as e:
            return ToolResult(success=False, error=str(e))
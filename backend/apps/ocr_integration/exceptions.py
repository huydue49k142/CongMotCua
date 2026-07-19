class OCRError(Exception):
    """Base exception for OCR related errors."""
    pass

class FileProcessingError(OCRError):
    """Error during file validation or preprocessing."""
    pass

class TextExtractionError(OCRError):
    """Error during the OCR text extraction process."""
    pass
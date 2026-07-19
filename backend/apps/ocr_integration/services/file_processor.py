import os
from PIL import Image
from pdf2image import convert_from_path
from django.core.files.uploadedfile import UploadedFile

from ..exceptions import FileProcessingError

# Configure Poppler path if not in system PATH
# POPPLER_PATH = r"D:\poppler-24.02.0-0\bin"

def process_uploaded_file(file: UploadedFile) -> list[Image.Image]:
    """
    Validates and converts an uploaded file (PDF, JPG, PNG) into a list of PIL Images.
    """
    file_extension = os.path.splitext(file.name)[1].lower()
    
    try:
        if file_extension == '.pdf':
            # return convert_from_path(file.temporary_file_path(), poppler_path=POPPLER_PATH)
            return convert_from_path(file.temporary_file_path())
        elif file_extension in ['.jpg', '.jpeg', '.png']:
            image = Image.open(file)
            image = image.convert('RGB') # Standardize to RGB
            return [image]
        else:
            raise FileProcessingError(f"Unsupported file type: {file_extension}")
    except Exception as e:
        raise FileProcessingError(f"Error processing file {file.name}: {e}")
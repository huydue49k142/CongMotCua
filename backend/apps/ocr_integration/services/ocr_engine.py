import pytesseract
from PIL import Image

from ..exceptions import TextExtractionError

# If tesseract is not in your PATH, include the following line:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_image(image: Image.Image) -> str:
    """
    Extracts text from a single PIL Image using Tesseract.
    """
    try:
        # Using lang='vie' for Vietnamese, 'eng' for English. Or 'vie+eng'.
        text = pytesseract.image_to_string(image, lang='vie+eng')
        return text
    except Exception as e:
        raise TextExtractionError(f"Tesseract OCR failed: {e}")

def find_title_in_text(text: str) -> str | None:
    """
    Finds the most likely title from the extracted text.
    This is a simple heuristic: assumes the first non-empty line is the title.
    """
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return None
    
    # Simple heuristic: title is often one of the first few lines and has more capital letters
    # A more complex approach could involve font size analysis if available from OCR data
    potential_titles = lines[:5] # Check first 5 non-empty lines
    
    # For now, return the first line
    return potential_titles[0] if potential_titles else None
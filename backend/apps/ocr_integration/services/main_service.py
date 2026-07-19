from django.db import transaction
from django.core.files.uploadedfile import UploadedFile

from ..models import OCRJob, OCRResult
from ..exceptions import OCRError
from .file_processor import process_uploaded_file
from .ocr_engine import extract_text_from_image, find_title_in_text
from .title_matcher import are_titles_similar

def verify_document_title(uploaded_file: UploadedFile, expected_title: str) -> OCRResult:
    """
    Main service function to orchestrate the OCR verification process.
    Creates a job and returns the final result.
    """
    
    # 1. Create OCR Job
    job = OCRJob.objects.create(
        uploaded_file=uploaded_file,
        expected_title=expected_title,
        status=OCRJob.Status.PENDING,
    )

    try:
        with transaction.atomic():
            job.status = OCRJob.Status.PROCESSING
            job.save()

            # 2. Process File (PDF/Image to PIL Images)
            images = process_uploaded_file(job.uploaded_file)
            
            # 3. Extract Text (currently only from the first page/image)
            # For multi-page docs, might need to decide on a strategy
            if not images:
                raise OCRError("Could not extract any images from the document.")
            
            full_text = extract_text_from_image(images[0])
            
            # 4. Find Title
            extracted_title = find_title_in_text(full_text)
            if not extracted_title:
                raise OCRError("Could not find a title in the document.")

            # 5. Compare Titles
            is_match, confidence_score = are_titles_similar(
                extracted_title, 
                expected_title,
                threshold=80.0
            )

            # 6. Create and Save Result
            result = OCRResult.objects.create(
                job=job,
                is_match=is_match,
                confidence=confidence_score / 100.0, # Convert to 0.0-1.0 scale
                extracted_text=full_text,
                extracted_title=extracted_title,
            )
            
            job.status = OCRJob.Status.COMPLETED
            job.save()
            
            return result

    except OCRError as e:
        with transaction.atomic():
            job.status = OCRJob.Status.FAILED
            job.save()
            result = OCRResult.objects.create(
                job=job,
                is_match=False,
                error_message=str(e)
            )
            return result
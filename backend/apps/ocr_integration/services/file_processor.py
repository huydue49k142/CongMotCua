import os
from io import BytesIO

from django.core.files.uploadedfile import UploadedFile
from pdf2image import convert_from_bytes
from PIL import Image

from ..exceptions import FileProcessingError

from django.conf import settings
from pdf2image import convert_from_bytes

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


def process_uploaded_file(
    file: UploadedFile,
) -> list[Image.Image]:
    """
    Chuyển PDF hoặc ảnh upload thành danh sách ảnh RGB.
    """

    file_extension = os.path.splitext(
        file.name
    )[1].lower()

    if file_extension not in SUPPORTED_EXTENSIONS:
        raise FileProcessingError(
            f"Không hỗ trợ định dạng: "
            f"{file_extension}"
        )

    try:
        file.seek(0)
        content = file.read()
        file.seek(0)

        if file_extension == ".pdf":
            images = convert_from_bytes(
                content,
                dpi=200,
                poppler_path=settings.POPPLER_PATH,
            )

            return [
                image.convert("RGB")
                for image in images
            ]

        image = Image.open(
            BytesIO(content)
        ).convert("RGB")

        return [image]

    except Exception as error:
        raise FileProcessingError(
            f"Không thể xử lý file "
            f"{file.name}: {error}"
        ) from error
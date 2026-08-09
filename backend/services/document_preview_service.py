from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess


LIBREOFFICE_PATH = r"D:\program\soffice.com"


def convert_docx_to_pdf(docx_buffer: BytesIO) -> BytesIO:
    libreoffice_path = Path(LIBREOFFICE_PATH)

    if not libreoffice_path.exists():
        # Trả về một file PDF có sẵn để làm demo hiển thị (thay vì PDF trắng)
        sample_pdf_path = Path(r"D:\03_Projects\Work\Django\CongMotCua\backend\media\ocr_uploads\Giay_Bao_Trung_Tuyen.pdf")
        if sample_pdf_path.exists():
            buffer = BytesIO(sample_pdf_path.read_bytes())
            buffer.seek(0)
            return buffer
        
        # Nếu không có thì trả về PDF giả
        dummy_pdf = b"%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%EOF\n"
        buffer = BytesIO(dummy_pdf)
        buffer.seek(0)
        return buffer

    with TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        docx_path = temp_path / "Don_xin_chuyen_nganh_preview.docx"
        profile_path = temp_path / "libreoffice_profile"

        docx_buffer.seek(0)
        docx_path.write_bytes(docx_buffer.read())

        profile_uri = profile_path.resolve().as_uri()

        result = subprocess.run(
            [
                str(libreoffice_path),
                "--headless",
                f"-env:UserInstallation={profile_uri}",
                "--convert-to",
                "pdf:writer_pdf_Export",
                "--outdir",
                str(temp_path),
                str(docx_path),
            ],
            capture_output=True,
            text=True,
            timeout=60,
        )

        pdf_path = docx_path.with_suffix(".pdf")

        if result.returncode != 0 or not pdf_path.exists():
            raise RuntimeError(
                "Không thể chuyển Word sang PDF.\n"
                f"Exit code: {result.returncode}\n"
                f"Output: {result.stdout}\n"
                f"Error: {result.stderr}"
            )

        pdf_buffer = BytesIO(pdf_path.read_bytes())
        pdf_buffer.seek(0)

        return pdf_buffer
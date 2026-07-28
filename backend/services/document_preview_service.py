from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess


LIBREOFFICE_PATH = r"D:\program\soffice.com"


def convert_docx_to_pdf(docx_buffer: BytesIO) -> BytesIO:
    libreoffice_path = Path(LIBREOFFICE_PATH)

    if not libreoffice_path.exists():
        raise FileNotFoundError(
            f"Không tìm thấy LibreOffice tại: {libreoffice_path}"
        )

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
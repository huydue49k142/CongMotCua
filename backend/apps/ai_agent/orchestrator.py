"""
AgentOrchestrator - xử lý hội thoại chatbot tra cứu thủ tục học vụ.

Bản đầu tiên: dùng bộ nhớ tạm (in-memory) để lưu session, CHƯA lưu vào DB
(AIConversation/AIMessage). Sau khi chạy ổn, có thể nối thêm lưu DB.

Cách hoạt động (giống bản Node.js đã làm, viết lại bằng Python):
1. Lớp rule-based: câu hỏi khớp rõ 1 thủ tục -> trả thẳng từ dữ liệu, không gọi AI.
2. Lớp cache: câu hỏi độc lập (không có lịch sử) đã hỏi trước đó -> lấy lại kết quả cũ.
3. Lớp Gemini: câu hỏi tự do/phức tạp/nối tiếp -> gọi Gemini, có kèm lịch sử hội thoại.
"""

import json
import os
from pathlib import Path
from typing import Optional

import requests
from django.conf import settings


# ==== Nạp dữ liệu knowledge_base.json (dữ liệu thật DUE) ====
KB_PATH = Path(__file__).resolve().parent.parent / "apps" / "knowledge_base" / "knowledge" / "knowledge_base.json"

with open(KB_PATH, encoding="utf-8") as f:
    KB = json.load(f)

PROCEDURES = {p["id"]: p for p in KB["procedures"]}

TU_KHOA_THU_TUC = {
    "chuyen_nganh": ["chuyển ngành", "đổi ngành"],
    "bao_luu": ["bảo lưu", "nghỉ học tạm thời", "ngừng học", "tạm ngừng"],
    "thoi_hoc": ["thôi học", "bỏ học", "nghỉ học hẳn", "buộc thôi học"],
    "hoc_tiep": ["học tiếp", "trở lại học", "quay lại học", "xin học tiếp"],
}
TU_KHOA_CAN_AI = [
    "nếu", "trường hợp", "còn", "vậy", "sao", "tại sao",
    "khi nào", "bao lâu", "có được không", "như thế nào", "làm sao",
]


def _tim_thu_tuc(text: str) -> Optional[str]:
    t = text.lower()
    for id_, keywords in TU_KHOA_THU_TUC.items():
        if any(k in t for k in keywords):
            return id_
    return None


def _la_don_gian(text: str) -> bool:
    t = text.lower()
    return not any(k in t for k in TU_KHOA_CAN_AI) and len(t) < 40


def _format_thu_tuc(item: dict) -> str:
    ho_so = "\n".join(f"- {h}" for h in item["required_documents"])
    quy_trinh = "\n".join(f"{i+1}. {q}" for i, q in enumerate(item["workflow"]))
    canh_bao = ""
    if item.get("confidence", {}).get("level") == "medium":
        canh_bao = "\n\n⚠️ Thông tin này chưa được xác minh với văn bản quy chế chính thức, bạn nên xác nhận lại với Phòng Đào tạo."
    return (
        f"📋 **{item['title']}**\n\n"
        f"**Điều kiện áp dụng:** {item['conditions']}\n\n"
        f"**Hồ sơ cần nộp:**\n{ho_so}\n\n"
        f"**Quy trình:**\n{quy_trinh}\n\n"
        f"**Nơi nộp:** {item['submission']['location']}\n"
        f"**Thời hạn:** {item['submission']['deadline']}\n"
        f"**Chi phí:** {item['submission']['fee']}"
        f"{canh_bao}"
    )


def _build_system_prompt() -> str:
    contact = KB.get("contact", {})
    lien_he = contact.get("office", "Phòng Đào tạo")
    if contact.get("phone"):
        lien_he += f" (SĐT: {contact['phone']})"

    return (
        f"Bạn là chatbot hỗ trợ sinh viên tra cứu thủ tục học vụ tại {KB['metadata']['school']}.\n\n"
        "QUY TẮC BẮT BUỘC:\n"
        "1. CHỈ trả lời dựa trên dữ liệu JSON dưới đây. TUYỆT ĐỐI không bịa thêm quy định, số liệu, điều kiện không có trong dữ liệu.\n"
        f"2. Nếu câu hỏi ngoài phạm vi dữ liệu hoặc thuộc trường hợp đặc biệt, hướng dẫn liên hệ: {lien_he}. KHÔNG được đoán.\n"
        "3. Với thủ tục có confidence.level = medium, nhắc sinh viên xác nhận lại với Phòng Đào tạo trước khi thực hiện.\n"
        "4. Trả lời ngắn gọn, tiếng Việt, giọng thân thiện.\n"
        "5. Không trả lời câu hỏi ngoài phạm vi thủ tục học vụ (chuyển ngành, bảo lưu, thôi học, học tiếp).\n\n"
        f"DỮ LIỆU THỦ TỤC HỌC VỤ (nguồn: {KB['metadata']['data_source']}, cập nhật {KB['metadata']['last_updated']}):\n"
        f"{json.dumps(KB['procedures'], ensure_ascii=False, indent=2)}"
    )


SYSTEM_PROMPT = _build_system_prompt()


def _goi_gemini(cau_hoi: str, history: list[dict]) -> str:
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.environ.get("GEMINI_API_KEY")
    model = getattr(settings, "GEMINI_MODEL", None) or os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
    if not api_key:
        raise RuntimeError("Thiếu GEMINI_API_KEY trong settings.py hoặc biến môi trường")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    contents = [
        {"role": "model" if h["role"] == "model" else "user", "parts": [{"text": h["text"]}]}
        for h in (history or [])[-6:]
    ]
    contents.append({"role": "user", "parts": [{"text": cau_hoi}]})

    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"maxOutputTokens": 400, "temperature": 0.3},
    }

    res = requests.post(url, json=body, timeout=30)
    res.raise_for_status()
    data = res.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


class AgentOrchestrator:
    """
    Bản đầu tiên: lưu session trong bộ nhớ (mất khi restart server).
    session_id -> {"history": [...], "cache": {...}}
    """

    def __init__(self):
        self._sessions: dict[str, dict] = {}

    def _get_session(self, session_id: str) -> dict:
        if session_id not in self._sessions:
            self._sessions[session_id] = {"history": [], "cache": {}}
        return self._sessions[session_id]

    def process_message(self, user_id: str, message: str, session_id: str) -> dict:
        message = (message or "").strip()
        if not message:
            return {
                "response": "Vui lòng nhập câu hỏi.",
                "state": "IDLE",
                "workflow": "GENERAL_QA",
                "status": "ERROR",
                "intent": None,
                "error": "empty_message",
            }

        session = self._get_session(session_id)
        history = session["history"]

        try:
            # Lớp 1: rule-based (chỉ khi chưa có lịch sử, câu hỏi rõ ràng, đơn giản)
            id_thu_tuc = _tim_thu_tuc(message)
            if id_thu_tuc and _la_don_gian(message) and not history:
                item = PROCEDURES[id_thu_tuc]
                reply = _format_thu_tuc(item)
                return self._finish(session, message, reply, workflow=id_thu_tuc.upper(), intent=id_thu_tuc)

            # Lớp 2: cache (chỉ khi chưa có lịch sử)
            key = message.lower().strip()
            if not history and key in session["cache"]:
                reply = session["cache"][key]
                return self._finish(session, message, reply, workflow="GENERAL_QA", intent=id_thu_tuc, save_history=False)

            # Lớp 3: gọi Gemini thật, có kèm lịch sử
            reply = _goi_gemini(message, history)
            if not history:
                session["cache"][key] = reply
            return self._finish(session, message, reply, workflow="GENERAL_QA", intent=id_thu_tuc)

        except Exception as e:
            return {
                "response": "Có lỗi xảy ra khi xử lý câu hỏi, vui lòng thử lại hoặc liên hệ trực tiếp Phòng Đào tạo.",
                "state": "ERROR",
                "workflow": "GENERAL_QA",
                "status": "ERROR",
                "intent": None,
                "error": str(e),
            }

    def _finish(self, session, user_msg, reply, workflow, intent, save_history=True):
        if save_history:
            session["history"].append({"role": "user", "text": user_msg})
            session["history"].append({"role": "model", "text": reply})
        return {
            "response": reply,
            "state": "ANSWERED",
            "workflow": workflow,
            "status": "IN_PROGRESS",
            "intent": intent,
            "error": None,
        }

    def get_workflow_state(self, session_id: str) -> Optional[dict]:
        session = self._sessions.get(session_id)
        if not session or not session["history"]:
            return None
        return {
            "session_id": session_id,
            "message_count": len(session["history"]),
            "last_messages": session["history"][-4:],
        }

    def cancel_workflow(self, session_id: str) -> dict:
        self._sessions.pop(session_id, None)
        return {"status": "CANCELLED", "session_id": session_id}
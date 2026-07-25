import { NextResponse } from 'next/server';
// Đảm bảo bạn đã chép file knowledge_base.json vào cùng thư mục app/api/chat/
import KB from './knowledge_base.json'; 

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Nếu muốn dùng model lite như code cũ, hãy đổi thành gemini-1.5-flash hoặc gemini-3.1-flash-lite trong .env
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"; 

const LIEN_HE_DU_PHONG = KB.lien_he_du_phong?.includes("CẦN BỔ SUNG")
  ? "Phòng Đào tạo của trường (vui lòng bổ sung số điện thoại/email tại đây)"
  : KB.lien_he_du_phong;

// ==== Bước 1: lọc rule-based bằng từ khoá ====
const TU_KHOA_THU_TUC = {
  chuyen_nganh: ["chuyển ngành", "đổi ngành"],
  bao_luu: ["bảo lưu", "nghỉ học tạm thời", "ngừng học", "tạm ngừng"],
  thoi_hoc: ["thôi học", "bỏ học", "nghỉ học hẳn", "buộc thôi học"],
  hoc_tiep: ["học tiếp", "trở lại học", "quay lại học"]
};

const TU_KHOA_CAN_AI = ["nếu", "trường hợp", "còn", "vậy", "sao", "tại sao", "khi nào", "bao lâu", "có được không", "như thế nào", "làm sao"];

function timThuTucTheoTuKhoa(text: string) {
  const t = text.toLowerCase();
  for (const [id, tuKhoas] of Object.entries(TU_KHOA_THU_TUC)) {
    if (tuKhoas.some(k => t.includes(k))) return id;
  }
  return null;
}

function laCauHoiDonGian(text: string) {
  const t = text.toLowerCase();
  return !TU_KHOA_CAN_AI.some(k => t.includes(k)) && t.length < 40;
}

function formatThuTucDayDu(item: any) {
  return `📋 **${item.ten}**\n\n**Điều kiện áp dụng:** ${item.dieu_kien}\n\n**Hồ sơ cần nộp:**\n${item.ho_so.map((h: string) => "- " + h).join("\n")}\n\n**Quy trình:**\n${item.quy_trinh.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}\n\n**Nơi nộp:** ${item.noi_nop}\n**Thời hạn:** ${item.thoi_han}\n**Chi phí:** ${item.chi_phi}`;
}

// ==== Đếm số lần user đã hỏi thực sự (bỏ qua câu chào mặc định của bot) ====
function demSoLanUserDaHoi(history: any[]) {
  return (history || []).filter((m: any) => m?.role === 'user').length;
}

// ==== Bước 2: cache ====
const cache = new Map();
function cacheKey(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

// ==== System prompt ====
function buildSystemPrompt() {
  return `Bạn là chatbot hỗ trợ sinh viên tra cứu thủ tục học vụ tại ${KB.truong}.

QUY TẮC BẮT BUỘC:
1. CHỈ được trả lời dựa trên dữ liệu JSON cung cấp bên dưới. TUYỆT ĐỐI không tự suy đoán, không bịa thêm quy định, số liệu, hay điều kiện không có trong dữ liệu.
2. Nếu câu hỏi nằm ngoài dữ liệu, hoặc dữ liệu không đề cập rõ, hoặc thuộc trường hợp đặc biệt/ngoại lệ: trả lời rằng bạn chưa có thông tin chính xác cho trường hợp này và hướng dẫn liên hệ trực tiếp: ${LIEN_HE_DU_PHONG}. KHÔNG được đoán.
3. Với các thủ tục có ghi "do_tin_cay": "trung_binh", khi trả lời hãy nhắc sinh viên nên xác nhận lại thông tin với Phòng Đào tạo trước khi thực hiện.
4. Trả lời ngắn gọn, đúng trọng tâm câu hỏi, giọng thân thiện, dùng tiếng Việt.
5. Không trả lời các câu hỏi ngoài phạm vi thủ tục học vụ (chuyển ngành, bảo lưu, thôi học, học tiếp).
6. GIỚI HẠN ĐỘ DÀI: trả lời tối đa 5 dòng nội dung chính. KHÔNG mở đầu bằng lời chào ("Chào bạn...", "Xin chào..."). KHÔNG thêm câu chốt kiểu "Nếu bạn cần hỗ trợ thêm..." trừ khi người dùng hỏi thông tin liên hệ hoặc trường hợp ngoài dữ liệu. Chỉ nêu đúng phần thông tin liên quan trực tiếp đến câu hỏi — nếu người dùng chỉ hỏi 1 khía cạnh (ví dụ chỉ hỏi "nộp ở đâu"), không cần liệt kê lại toàn bộ điều kiện/hồ sơ/quy trình.
7. Không lặp lại tiêu đề thủ tục bằng markdown heading lớn, không dùng emoji nếu không cần thiết.

DỮ LIỆU THỦ TỤC HỌC VỤ (nguồn: ${KB.nguon_du_lieu}, cập nhật ${KB.ngay_cap_nhat}):
${JSON.stringify(KB.thu_tuc, null, 2)}`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

// ==== Gọi Gemini API ====
function xayDungContents(cauHoi: string, history: any[]) {
  const gioiHan = (history || []).slice(-6);
  const contents = gioiHan.map(m => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: m.text }]
  }));
  contents.push({ role: "user", parts: [{ text: cauHoi }] });
  return contents;
}

async function goiGemini(cauHoi: string, history: any[]) {
  if (!GEMINI_API_KEY) {
    throw new Error("Thiếu GEMINI_API_KEY trong file .env");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: xayDungContents(cauHoi, history),
    generationConfig: {
      maxOutputTokens: 300, // giới hạn độ dài trả lời (giảm để ép ngắn gọn hơn)
      temperature: 0.3      // thấp để bám sát dữ liệu
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API lỗi ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API không trả về nội dung hợp lệ");
  return text;
}

// ==== Endpoint chính ====
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cauHoi = (body?.message || "").trim();
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!cauHoi) {
      return NextResponse.json({ error: "Thiếu nội dung câu hỏi" }, { status: 400 });
    }
    if (cauHoi.length > 500) {
      return NextResponse.json({ error: "Câu hỏi quá dài" }, { status: 400 });
    }

    // Chỉ tính các lượt user thực sự đã hỏi, bỏ qua câu chào mặc định của bot
    const soLanUserDaHoi = demSoLanUserDaHoi(history);

    // Lớp 1: câu hỏi đơn giản, khớp rõ 1 thủ tục, là câu hỏi đầu tiên -> trả thẳng, KHÔNG gọi AI
    const idThuTuc = timThuTucTheoTuKhoa(cauHoi);
    if (idThuTuc && laCauHoiDonGian(cauHoi) && soLanUserDaHoi === 0) {
      const item = KB.thu_tuc.find((t: any) => t.id === idThuTuc);
      if (item) {
        return NextResponse.json({ reply: formatThuTucDayDu(item), nguon: "rule_based" });
      }
    }

    // Lớp 2: cache (chỉ áp dụng cho câu hỏi đầu tiên, không có ngữ cảnh hội thoại)
    const key = cacheKey(cauHoi);
    if (soLanUserDaHoi === 0 && cache.has(key)) {
      return NextResponse.json({ reply: cache.get(key), nguon: "cache" });
    }

    // Lớp 3: gọi Gemini
    const traLoi = await goiGemini(cauHoi, history);
    if (soLanUserDaHoi === 0) cache.set(key, traLoi);
    
    return NextResponse.json({ reply: traLoi, nguon: "gemini" });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: `Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ trực tiếp: ${LIEN_HE_DU_PHONG}` },
      { status: 500 }
    );
  }
}
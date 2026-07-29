import { NextResponse } from "next/server";
import KB from "./knowledge_base.json";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-1.5-flash";

const LIEN_HE_DU_PHONG =
  KB.lien_he_du_phong?.includes(
    "CẦN BỔ SUNG"
  )
    ? "Phòng Đào tạo của trường. Vui lòng bổ sung số điện thoại hoặc email liên hệ."
    : KB.lien_he_du_phong;

type ChatHistoryItem = {
  role?: "user" | "model";
  text?: string;
};

type ProcedureItem =
  (typeof KB.thu_tuc)[number];

const TU_KHOA_THU_TUC: Record<
  string,
  string[]
> = {
  chuyen_nganh: [
    "chuyển ngành",
    "chuyen nganh",
    "đổi ngành",
    "doi nganh",
    "học ngành khác",
    "hoc nganh khac",
  ],

  bao_luu: [
    "bảo lưu",
    "bao luu",
    "nghỉ học tạm thời",
    "nghi hoc tam thoi",
    "ngừng học",
    "ngung hoc",
    "tạm ngừng",
    "tam ngung",
    "tạm dừng",
    "tam dung",
    "gia hạn bảo lưu",
    "gia han bao luu",
  ],

  thoi_hoc: [
    "thôi học",
    "thoi hoc",
    "bỏ học",
    "bo hoc",
    "nghỉ học hẳn",
    "nghi hoc han",
    "buộc thôi học",
    "buoc thoi hoc",
  ],

  hoc_tiep: [
    "học tiếp",
    "hoc tiep",
    "trở lại học",
    "tro lai hoc",
    "trở lại học tập",
    "tro lai hoc tap",
    "quay lại học",
    "quay lai hoc",
    "đi học lại",
    "di hoc lai",
  ],
};

const TU_KHOA_CAN_AI = [
  "nếu",
  "neu",
  "trường hợp",
  "truong hop",
  "còn",
  "con",
  "vậy",
  "vay",
  "sao",
  "tại sao",
  "tai sao",
  "khi nào",
  "khi nao",
  "có được không",
  "co duoc khong",
  "như thế nào",
  "nhu the nao",
  "làm sao",
  "lam sao",
];

const TU_KHOA_THOI_GIAN_GIAI_QUYET = [
  "bao lâu",
  "bao lau",
  "mấy ngày",
  "may ngay",
  "bao nhiêu ngày",
  "bao nhieu ngay",
  "thời gian giải quyết",
  "thoi gian giai quyet",
  "thời gian xử lý",
  "thoi gian xu ly",
  "xử lý bao lâu",
  "xu ly bao lau",
  "giải quyết bao lâu",
  "giai quyet bao lau",
  "khi nào xong",
  "khi nao xong",
  "khi nào hoàn thành",
  "khi nao hoan thanh",
  "ngày hoàn thành",
  "ngay hoan thanh",
  "mất bao lâu",
  "mat bao lau",
  "mất mấy ngày",
  "mat may ngay",
  "mất bao nhiêu ngày",
  "mat bao nhieu ngay",
  "hồ sơ xử lý trong bao lâu",
  "ho so xu ly trong bao lau",
];

function chuanHoaVanBan(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/đ/g, "d")
    .trim()
    .replace(/\s+/g, " ");
}

function timThuTucTheoTuKhoa(
  text: string
) {
  const normalizedText =
    chuanHoaVanBan(text);

  for (const [
    id,
    keywords,
  ] of Object.entries(
    TU_KHOA_THU_TUC
  )) {
    const matched =
      keywords.some((keyword) =>
        normalizedText.includes(
          chuanHoaVanBan(keyword)
        )
      );

    if (matched) {
      return id;
    }
  }

  return null;
}

function timThuTucTrongNguCanh(
  question: string,
  history: ChatHistoryItem[]
) {
  const directProcedure =
    timThuTucTheoTuKhoa(question);

  if (directProcedure) {
    return directProcedure;
  }

  const reversedHistory = [
    ...(history || []),
  ].reverse();

  // Ưu tiên tin nhắn người dùng gần nhất.
  for (const message of reversedHistory) {
    if (
      message?.role !== "user" ||
      typeof message?.text !== "string"
    ) {
      continue;
    }

    const procedureId =
      timThuTucTheoTuKhoa(
        message.text
      );

    if (procedureId) {
      return procedureId;
    }
  }

  // Nếu chưa tìm thấy thì kiểm tra cả câu trả lời bot.
  for (const message of reversedHistory) {
    if (
      typeof message?.text !== "string"
    ) {
      continue;
    }

    const procedureId =
      timThuTucTheoTuKhoa(
        message.text
      );

    if (procedureId) {
      return procedureId;
    }
  }

  return null;
}

function laCauHoiDonGian(
  text: string
) {
  const normalizedText =
    chuanHoaVanBan(text);

  const needsAI =
    TU_KHOA_CAN_AI.some((keyword) =>
      normalizedText.includes(
        chuanHoaVanBan(keyword)
      )
    );

  return (
    !needsAI &&
    normalizedText.length < 40
  );
}

function laCauHoiThoiGianGiaiQuyet(
  text: string
) {
  const normalizedText =
    chuanHoaVanBan(text);

  return (
    TU_KHOA_THOI_GIAN_GIAI_QUYET
      .some((keyword) =>
        normalizedText.includes(
          chuanHoaVanBan(keyword)
        )
      )
  );
}

function formatThuTucDayDu(
  item: ProcedureItem
) {
  const conditionLines =
    item.dieu_kien
      .map(
        (condition) =>
          `• ${condition}`
      )
      .join("\n");

  const documentLines =
    item.ho_so
      .map(
        (document) =>
          `• ${document}`
      )
      .join("\n");

  const workflowLines =
    item.quy_trinh
      .map(
        (step, index) =>
          `${index + 1}. ${step}`
      )
      .join("\n");

  const confidenceWarning =
    item.do_tin_cay ===
      "trung_binh"
      ? "\n\n⚠️ *Thông tin này nên được xác nhận lại với Phòng Đào tạo trước khi thực hiện.*"
      : "";

  const processingTime =
    item.thoi_gian_giai_quyet
      ?.hien_thi ||
    "Chưa có thông tin";

  return [
    `📋 **${item.ten}**`,
    "",
    "**Điều kiện áp dụng**",
    conditionLines,
    "",
    "**Hồ sơ cần nộp**",
    documentLines,
    "",
    "**Quy trình thực hiện**",
    workflowLines,
    "",
    "**Nơi nộp**",
    item.noi_nop,
    "",
    "**Thời hạn nộp hồ sơ**",
    item.thoi_han,
    "",
    "**Thời gian giải quyết**",
    processingTime,
    "",
    "**Chi phí**",
    item.chi_phi,
  ].join("\n") +
    confidenceWarning;
}

function formatThoiGianGiaiQuyet(
  item: ProcedureItem
) {
  const processingTime =
    item.thoi_gian_giai_quyet;

  if (!processingTime) {
    return (
      `Dữ liệu hiện chưa có thời gian giải quyết cụ thể ` +
      `cho thủ tục **${item.ten}**.`
    );
  }

  return (
    `Thời gian giải quyết thủ tục **${item.ten}** là ` +
    `**${processingTime.hien_thi}**.`
  );
}

function formatTatCaThoiGianGiaiQuyet() {
  return KB.thu_tuc
    .map((item) => {
      const processingTime =
        item.thoi_gian_giai_quyet
          ?.hien_thi ||
        "Chưa có thông tin";

      return (
        `- **${item.ten}:** ` +
        processingTime
      );
    })
    .join("\n");
}

function demSoLanUserDaHoi(
  history: ChatHistoryItem[]
) {
  return (history || []).filter(
    (message) =>
      message?.role === "user"
  ).length;
}

const cache = new Map<
  string,
  string
>();

function cacheKey(
  text: string
) {
  return chuanHoaVanBan(text);
}

function buildSystemPrompt() {
  return `Bạn là chatbot hỗ trợ sinh viên tra cứu thủ tục học vụ tại ${KB.truong}.

QUY TẮC BẮT BUỘC:
1. CHỈ được trả lời dựa trên dữ liệu JSON cung cấp bên dưới. TUYỆT ĐỐI không tự suy đoán, không bịa thêm quy định, số liệu hoặc điều kiện không có trong dữ liệu.
2. Nếu câu hỏi nằm ngoài dữ liệu, dữ liệu không đề cập rõ hoặc thuộc trường hợp đặc biệt/ngoại lệ: trả lời rằng bạn chưa có thông tin chính xác và hướng dẫn liên hệ trực tiếp: ${LIEN_HE_DU_PHONG}. KHÔNG được đoán.
3. Với thủ tục có "do_tin_cay": "trung_binh", khi trả lời phải nhắc sinh viên xác nhận lại với Phòng Đào tạo.
4. Trả lời ngắn gọn, đúng trọng tâm, thân thiện và dùng tiếng Việt.
5. Không trả lời ngoài phạm vi: chuyển ngành, bảo lưu, thôi học và học tiếp.
6. Trả lời tối đa 5 dòng nội dung chính. Không mở đầu bằng lời chào. Không thêm câu kết dư thừa.
7. Không lặp lại tiêu đề thủ tục bằng markdown heading lớn. Không dùng emoji nếu không cần thiết.
8. Phân biệt rõ:
- "thoi_han" là thời điểm hoặc hạn cuối sinh viên phải nộp hồ sơ.
- "thoi_gian_giai_quyet" là số ngày làm việc nhà trường xử lý hồ sơ kể từ khi nhận đủ hồ sơ.
Khi người dùng hỏi "bao lâu", "mấy ngày", "khi nào xong", "mất bao nhiêu ngày" hoặc câu tương đương, phải trả lời bằng "thoi_gian_giai_quyet", không dùng "thoi_han".
9. Khi câu hỏi tiếp theo không nêu lại tên thủ tục, phải dựa vào lịch sử hội thoại gần nhất để xác định thủ tục đang được hỏi.

DỮ LIỆU THỦ TỤC HỌC VỤ
Nguồn: ${KB.nguon_du_lieu}
Cập nhật: ${KB.ngay_cap_nhat}

${JSON.stringify(
    KB.thu_tuc,
    null,
    2
  )}`;
}

const SYSTEM_PROMPT =
  buildSystemPrompt();

function xayDungContents(
  question: string,
  history: ChatHistoryItem[]
) {
  const recentHistory =
    (history || []).slice(-6);

  const contents =
    recentHistory
      .filter(
        (message) =>
          typeof message?.text ===
          "string"
      )
      .map((message) => ({
        role:
          message.role === "model"
            ? "model"
            : "user",
        parts: [
          {
            text:
              message.text || "",
          },
        ],
      }));

  contents.push({
    role: "user",
    parts: [
      {
        text: question,
      },
    ],
  });

  return contents;
}

async function goiGemini(
  question: string,
  history: ChatHistoryItem[]
) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Thiếu GEMINI_API_KEY trong file .env"
    );
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [
        {
          text: SYSTEM_PROMPT,
        },
      ],
    },

    contents: xayDungContents(
      question,
      history
    ),

    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.3,
    },
  };

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Gemini API lỗi ${response.status}: ${errorText}`
    );
  }

  const data =
    await response.json();

  const text =
    data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text;

  if (!text) {
    throw new Error(
      "Gemini API không trả về nội dung hợp lệ"
    );
  }

  return text;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const question =
      String(
        body?.message || ""
      ).trim();

    const history:
      ChatHistoryItem[] =
      Array.isArray(
        body?.history
      )
        ? body.history
        : [];

    if (!question) {
      return NextResponse.json(
        {
          error:
            "Thiếu nội dung câu hỏi",
        },
        {
          status: 400,
        }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        {
          error:
            "Câu hỏi quá dài",
        },
        {
          status: 400,
        }
      );
    }

    const userQuestionCount =
      demSoLanUserDaHoi(history);

    const procedureId =
      timThuTucTrongNguCanh(
        question,
        history
      );

    // Ưu tiên trả lời thời gian xử lý bằng dữ liệu rule-based.
    if (
      laCauHoiThoiGianGiaiQuyet(
        question
      )
    ) {
      if (procedureId) {
        const item =
          KB.thu_tuc.find(
            (procedure) =>
              procedure.id ===
              procedureId
          );

        if (item) {
          return NextResponse.json({
            reply:
              formatThoiGianGiaiQuyet(
                item
              ),
            nguon:
              "rule_based_processing_time",
          });
        }
      }

      return NextResponse.json({
        reply:
          "**Thời gian giải quyết các thủ tục:**\n" +
          formatTatCaThoiGianGiaiQuyet(),
        nguon:
          "rule_based_all_processing_times",
      });
    }

    // Câu hỏi đầu tiên, đơn giản và khớp rõ thủ tục.
    if (
      procedureId &&
      laCauHoiDonGian(
        question
      ) &&
      userQuestionCount === 0
    ) {
      const item =
        KB.thu_tuc.find(
          (procedure) =>
            procedure.id ===
            procedureId
        );

      if (item) {
        return NextResponse.json({
          reply:
            formatThuTucDayDu(
              item
            ),
          nguon: "rule_based",
        });
      }
    }

    const key =
      cacheKey(question);

    if (
      userQuestionCount === 0 &&
      cache.has(key)
    ) {
      return NextResponse.json({
        reply:
          cache.get(key),
        nguon: "cache",
      });
    }

    const answer =
      await goiGemini(
        question,
        history
      );

    if (
      userQuestionCount === 0
    ) {
      cache.set(
        key,
        answer
      );
    }

    return NextResponse.json({
      reply: answer,
      nguon: "gemini",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          `Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ trực tiếp: ` +
          `${LIEN_HE_DU_PHONG}`,
      },
      {
        status: 500,
      }
    );
  }
}
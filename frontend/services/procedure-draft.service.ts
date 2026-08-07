"use client";

export type ProcedureRequestType =
  | "DROPOUT"
  | "ACADEMIC_LEAVE"
  | "RESUME_STUDIES"
  | "MAJOR_CHANGE";

export type ProcedureDocumentKey =
  | "DROPOUT_SIGNED_APPLICATION"
  | "ACADEMIC_LEAVE_EVIDENCE"
  | "ACADEMIC_LEAVE_SIGNED_APPLICATION"
  | "RESUME_SIGNED_APPLICATION"
  | "MAJOR_CHANGE_ADMISSION_LETTER"
  | "MAJOR_CHANGE_GRADUATION_CERTIFICATE"
  | "MAJOR_CHANGE_SIGNED_APPLICATION";

export type ProcedureDraftDocument = {
  id: string;
  document_key: ProcedureDocumentKey;
  original_name: string;
  content_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
  updated_at: string;
};

export type SavedProcedureDraft<T> = {
  id: string;
  request_type: ProcedureRequestType;
  is_started: boolean;
  current_step: number;
  draft_data: T;
  documents?: ProcedureDraftDocument[];
  uploaded_file_name?: string | null;
  uploaded_file_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SaveProcedureDraftInput<T> = {
  isStarted: boolean;
  currentStep: number;
  draftData: T;
};

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("access")
  );
};

const getApiBase = (): string => {
  const configuredApi = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/$/, "");

  return configuredApi.endsWith("/api")
    ? configuredApi
    : `${configuredApi}/api`;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
    );
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const readErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  const data = await response
    .json()
    .catch(() => null);

  return (
    data?.error ||
    data?.detail ||
    data?.message ||
    fallback
  );
};

export async function loadProcedureDraft<T>(
  requestType: ProcedureRequestType
): Promise<SavedProcedureDraft<T> | null> {
  const response = await fetch(
    `${getApiBase()}/requests/drafts/${requestType}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể tải bản nháp thủ tục."
      )
    );
  }

  const data = await response.json();

  if (!data?.exists || !data?.draft) {
    return null;
  }

  return data.draft as SavedProcedureDraft<T>;
}

export async function saveProcedureDraft<T>(
  requestType: ProcedureRequestType,
  input: SaveProcedureDraftInput<T>
): Promise<SavedProcedureDraft<T>> {
  const response = await fetch(
    `${getApiBase()}/requests/drafts/${requestType}/`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_started: input.isStarted,
        current_step: input.currentStep,
        draft_data: input.draftData,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể lưu bản nháp thủ tục."
      )
    );
  }

  const data = await response.json();

  if (!data?.draft) {
    throw new Error(
      "Backend không trả về dữ liệu bản nháp."
    );
  }

  return data.draft as SavedProcedureDraft<T>;
}

export async function deleteProcedureDraft(
  requestType: ProcedureRequestType
): Promise<void> {
  const response = await fetch(
    `${getApiBase()}/requests/drafts/${requestType}/`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể xóa bản nháp thủ tục."
      )
    );
  }
}

export async function listProcedureDraftDocuments(
  requestType: ProcedureRequestType
): Promise<ProcedureDraftDocument[]> {
  const response = await fetch(
    `${getApiBase()}/requests/drafts/${requestType}/documents/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể tải danh sách tài liệu."
      )
    );
  }

  const data = await response.json();

  return Array.isArray(data?.documents)
    ? data.documents
    : [];
}

export async function uploadProcedureDraftDocument(
  requestType: ProcedureRequestType,
  documentKey: ProcedureDocumentKey,
  file: File
): Promise<ProcedureDraftDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_key", documentKey);

  const response = await fetch(
    `${getApiBase()}/requests/drafts/${requestType}/documents/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể lưu tài liệu bản nháp."
      )
    );
  }

  const data = await response.json();

  if (!data?.document) {
    throw new Error(
      "Backend không trả về thông tin tài liệu."
    );
  }

  return data.document as ProcedureDraftDocument;
}

export async function deleteProcedureDraftDocument(
  requestType: ProcedureRequestType,
  documentId: string
): Promise<void> {
  const response = await fetch(
    `${getApiBase()}/requests/drafts/${requestType}/documents/${documentId}/`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể xóa tài liệu bản nháp."
      )
    );
  }
}

export async function fetchProcedureDraftDocumentBlob(
  document: ProcedureDraftDocument
): Promise<Blob> {
  const response = await fetch(
    document.file_url,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Không thể tải tài liệu."
      )
    );
  }

  return response.blob();
}

export async function fetchProcedureDraftDocumentAsFile(
  document: ProcedureDraftDocument
): Promise<File> {
  const blob = await fetchProcedureDraftDocumentBlob(
    document
  );

  return new File(
    [blob],
    document.original_name,
    {
      type:
        blob.type ||
        document.content_type ||
        "application/octet-stream",
    }
  );
}

export async function openProcedureDraftDocument(
  document: ProcedureDraftDocument
): Promise<void> {
  const previewWindow = window.open(
    "",
    "_blank"
  );

  if (!previewWindow) {
    throw new Error(
      "Trình duyệt đang chặn tab mới. " +
      "Vui lòng cho phép pop-up cho localhost."
    );
  }

  try {
    const blob = await fetchProcedureDraftDocumentBlob(
      document
    );

    const previewUrl =
      window.URL.createObjectURL(blob);

    previewWindow.location.href = previewUrl;

    window.setTimeout(() => {
      window.URL.revokeObjectURL(
        previewUrl
      );
    }, 60_000);
  } catch (error) {
    previewWindow.close();
    throw error;
  }
}
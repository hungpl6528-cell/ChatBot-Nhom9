const API_URL = "http://localhost:8000";

export interface DocumentUploadResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface DocumentMetadata {
  id?: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  return response.json() as Promise<DocumentUploadResponse>;
}

export async function getDocuments(): Promise<DocumentMetadata[]> {
  const response = await fetch(`${API_URL}/documents`);

  return response.json() as Promise<DocumentMetadata[]>;
}

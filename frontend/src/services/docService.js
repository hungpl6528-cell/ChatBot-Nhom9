const API_URL = "http://localhost:8000";

export async function uploadDocument(file) {
const formData = new FormData();

formData.append("file", file);

const response = await fetch(
`${API_URL}/documents/upload`,
{
method: "POST",
body: formData,
}
);

return response.json();
}

export async function getDocuments() {
const response = await fetch(
`${API_URL}/documents`
);

return response.json();
}

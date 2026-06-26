const API_URL = "http://localhost:8000";

export interface SendMessageResponse {
	id?: string;
	reply?: string;
	[key: string]: any;
}

export async function sendMessage(message: string): Promise<SendMessageResponse> {
	const response = await fetch(`${API_URL}/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message,
		}),
	});

	return response.json();
}

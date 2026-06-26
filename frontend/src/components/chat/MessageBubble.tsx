import type { ReactNode } from "react";

interface MessageBubbleProps {
	role: "user" | "assistant" | string;
	content: ReactNode;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: role === "user" ? "flex-end" : "flex-start",
				marginBottom: "15px",
			}}
		>
			<div
				style={{
					backgroundColor: role === "user" ? "#2563eb" : "#374151",
					color: "white",
					padding: "12px",
					borderRadius: "10px",
					maxWidth: "60%",
				}}
			>
				{content}
			</div>
		</div>
	);
}

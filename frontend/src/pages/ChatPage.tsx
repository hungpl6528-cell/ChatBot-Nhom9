import ChatWindow from "../components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div>
      <h1>Chat Sandbox</h1>

      <ChatWindow />

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Nhập câu hỏi..."
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button
          style={{
            padding: "10px 20px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
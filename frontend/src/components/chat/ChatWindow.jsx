import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
const messages = [
{
role: "user",
content: "RAG là gì?",
},
{
role: "assistant",
content: "RAG là Retrieval Augmented Generation.",
},
];

return (
<div
style={{
border: "1px solid #444",
borderRadius: "10px",
padding: "20px",
height: "500px",
}}
>
{messages.map((msg, index) => ( <MessageBubble
       key={index}
       role={msg.role}
       content={msg.content}
     />
))} </div>
);
}

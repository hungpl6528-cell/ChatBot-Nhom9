export default function Button({
  children,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
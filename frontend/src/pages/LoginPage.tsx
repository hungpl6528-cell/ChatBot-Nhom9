export default function LoginPage() {
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Login
      </h2>

      <input
        type="email"
        placeholder="Email"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
        }}
      />

      <button
        style={{
          width: "100%",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}
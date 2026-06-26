export default function RegisterPage() {
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
      }}
    >
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Username"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <input
        type="email"
        placeholder="Email"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <input
        type="password"
        placeholder="Confirm Password"
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
        }}
      >
        Register
      </button>
    </div>
  );
}
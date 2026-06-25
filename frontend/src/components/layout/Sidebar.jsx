import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#1f2937",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>ChatBot Nhóm 9</h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          marginTop: "30px",
        }}
      >
        <li style={{ marginBottom: "15px" }}>
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            🏠 Home
          </Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link
            to="/chat"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            💬 Chat
          </Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link
            to="/documents"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            📄 Documents
          </Link>
        </li>
      </ul>
    </div>
  );
}
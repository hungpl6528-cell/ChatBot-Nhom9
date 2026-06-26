import Sidebar from "./components/layout/Sidebar.tsx";
import Navbar from "./components/layout/Navbar.tsx";

import HomePage from "./pages/HomePage.tsx";
import ChatPage from "./pages/ChatPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";

import { Routes, Route } from "react-router-dom";

function App() {
return (
<div style={{ display: "flex" }}>
<Sidebar />

  <div style={{ flex: 1 }}>
    <Navbar />

    <div style={{ padding: "20px" }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  </div>
</div>

);
}

export default App;
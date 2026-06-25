import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

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
import { Routes, Route } from "react-router";

import LandingPage from "./components/LandingPage.jsx";
// NAVBAR ITEMS
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";

import DiscoverPage from "./components/DiscoverPage.jsx";
import ConnectPage from "./pages/ConnectPage.jsx";
import Chatbot from "./components/chatbot/Chatbot.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import UserPage from "./pages/UserPage.jsx";
import { DynamicMap } from "./components/DynamicMap.jsx";
import SupportDialog from "./components/SupportDialog.jsx";
import ChatWidget from "./components/chatbot/ChatWidget.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportDialog />} />
      </Routes>
      <ChatWidget />
    </>
  );
}

export default App;

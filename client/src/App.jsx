import { Routes, Route } from "react-router";

import LandingPage from "./components/LandingPage.jsx";
// NAVBAR ITEMS
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";

import DiscoverPage from "./components/DiscoverPage.jsx";
import ConnectPage from "./pages/ConnectPage.jsx";
import Chatbot from "./components/chatbot/Chatbot.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/discover" element={<DiscoverPage />}/>
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/chat" element={<Chatbot />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

export default App;
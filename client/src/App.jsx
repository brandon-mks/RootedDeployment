import { Routes, Route } from "react-router";

import LandingPage from "./components/LandingPage.jsx";
import DiscoverPage from "./components/DiscoverPage.jsx";
import Chatbot from "./components/chatbot/Chatbot.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/chat" element={<Chatbot />} />
    </Routes>
  );
}

export default App;

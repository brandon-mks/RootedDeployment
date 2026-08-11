import { Routes, Route } from "react-router";

import LandingPage from "./components/LandingPage.jsx";
import DiscoverPage from "./components/DiscoverPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
    </Routes>
  );
}

export default App;
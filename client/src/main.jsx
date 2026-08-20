import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { APIProvider } from "@vis.gl/react-google-maps";
import "./style.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MapContextProvider } from "./MapContext.jsx";

const theme = createTheme({
  typography: {
    fontFamily: '"Bahnschrift", Arial, sans-serif',
  },
});

createRoot(document.getElementById("root")).render(
  <MapContextProvider>
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </APIProvider>
  </MapContextProvider>,
);

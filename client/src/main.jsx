import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./style.css";
import App from "./App.jsx";

const theme = createTheme({
  typography: {
    fontFamily:
      '"Bahnschrift", Arial, sans-serif',
  },
});

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
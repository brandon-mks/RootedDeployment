import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Header from "../components/Header";
import Footer from "../components/Footer";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate("/user", { replace: true }); // Redirect to dashboard/home after successful login
    } catch (error) {
      setError(error.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Header />

      <main className="page-content auth-container">
        <Paper elevation={0} className="auth-card">
          <div className="auth-header">
            <Typography variant="h3" component="h1" className="auth-title">
              Welcome back
            </Typography>
            <Typography variant="body1" className="auth-subtitle">
              Log in to Rooted to connect with your community.
            </Typography>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
              className="auth-input-field"
              sx={{ mb: 2 }} // Added spacing between elements
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="auth-input-field"
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((previous) => !previous)}
                        edge="end"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Log In"
              )}
            </Button>
          </Box>

          <div className="auth-divider-container">
            <div className="auth-divider-line" />
            <Typography variant="body2" className="auth-footer-text">
              OR
            </Typography>
            <div className="auth-divider-line" />
          </div>

          <Typography variant="body2" className="auth-footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="auth-register-link">
              Create an account
            </Link>
          </Typography>
        </Paper>
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;

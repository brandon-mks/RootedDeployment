import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
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
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate("/login");
    } catch (error) {
      setError(error.message || "Unable to create your account.");
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
              Create an account
            </Typography>
            <Typography variant="body1" className="auth-subtitle">
              Join Rooted and start discovering your community.
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
              sx={{ mb: 2 }} // Added spacing consistency to match login
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="auth-input-field"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              helperText="Must be at least 8 characters."
              className="auth-input-field"
              sx={{ mb: 2 }}
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

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="auth-input-field"
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        edge="end"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
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
                "Create Account"
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
            Already have an account?{" "}
            <Link to="/login" className="auth-register-link">
              Log in
            </Link>
          </Typography>
        </Paper>
      </main>

      <Footer />
    </div>
  );
}

export default RegisterPage;

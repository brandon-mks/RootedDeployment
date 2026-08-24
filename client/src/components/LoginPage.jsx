import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { attemptLogin } = useAuth();
  const navigate = useNavigate();
  const login = (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    attemptLogin({ username, password });
    navigate("/");
  };
  return (
    <div>
      <h3>Please login</h3>
      <form action={login}>
        <label>
          Username:
          <input type="text" name="username" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { useToast } from "../context/ToastContext";
import { loginUser } from "../services/authService";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const expiredMessage = localStorage.getItem("session_expired_message");

    if (expiredMessage) {
      toast.info(expiredMessage);
      localStorage.removeItem("session_expired_message");
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("Authentication context is unavailable");
      }

      const data = await loginUser(email, password);
      await auth.login(data.token);
      toast.success("Welcome back.");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Continue building your streak.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading">
                <span className="btn-spinner" /> Signing in...
              </span>
            ) : (
              "Enter Elevare"
            )}
          </button>
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <Link to="/register" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

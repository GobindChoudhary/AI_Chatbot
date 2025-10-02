import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setLoading(true);
    try {
      // placeholder: attempt login against backend if available
      const res = await fetch(
        import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      // success: you can redirect or store tokens here
      // const data = await res.json();

      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-md mx-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            Log in to your account to continue
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-[var(--muted)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs text-[var(--muted)]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none"
                placeholder="Your password"
                required
              />
            </label>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-medium disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[var(--accent)]">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

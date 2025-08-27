import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log(userName, email, password);
    if (!userName) return setError("Please enter your username.");
    if (!email) return setError("Please enter your email.");
    if (!password) return setError("Please enter a password.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userName, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      console.log("Registration successful");
      navigate("/");
      // optionally redirect or clear form here
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-md mx-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
            Create account
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            Sign up to get started
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-[var(--muted)]">Username</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none"
                placeholder="Your username"
                required
              />
            </label>

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
                placeholder="Create a password"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs text-[var(--muted)]">
                Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none"
                placeholder="Repeat your password"
                required
              />
            </label>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-medium disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <a href="#" className="text-[var(--accent)]">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

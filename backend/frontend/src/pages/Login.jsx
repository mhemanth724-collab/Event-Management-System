
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", formData);

      if (response.data.status) {
        const user = response.data.user;

        // Save JWT token
        localStorage.setItem("token", response.data.token);

        // Save user details
        localStorage.setItem("user", JSON.stringify(user));

        console.log("Logged in User:", user);
        console.log("User Role:", user.role);

        // Admin and User Navigation
        if (user.role?.toLowerCase() === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/events", { replace: true });
        }

      } else {
        setError(response.data.message || "Login failed");
      }

    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        setError(
          error.response.data.message || "Login failed"
        );
      } else {
        setError(
          "Unable to connect to server. Please check Flask backend."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Welcome Back
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login to manage your bookings
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-400 hover:text-violet-300"
            >
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

export default Login;

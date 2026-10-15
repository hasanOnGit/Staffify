import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);

      if (res?.msg === "Login successful.") {
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setError(res?.msg || "Invalid email or password");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <h2 className="text-3xl font-semibold text-gray-800">
        Sign in to Staffify
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Access your greytHR enterprise portal to manage people and processes
      </p>

      {/* Quick Demo Access Buttons */}
      <div className="mt-5 p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
        <p className="text-xs font-semibold text-purple-900 mb-2">
          ⚡ One-Click Test Accounts:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@staffify.com", "Admin@123")}
            className="text-xs py-1.5 px-2 bg-white border border-purple-200 hover:bg-purple-100/50 text-purple-800 rounded-lg font-medium transition text-center shadow-xs"
          >
            👑 Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("manager@staffify.com", "Manager@123")}
            className="text-xs py-1.5 px-2 bg-white border border-purple-200 hover:bg-purple-100/50 text-purple-800 rounded-lg font-medium transition text-center shadow-xs"
          >
            👔 Manager
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("employee@staffify.com", "Employee@123")}
            className="text-xs py-1.5 px-2 bg-white border border-purple-200 hover:bg-purple-100/50 text-purple-800 rounded-lg font-medium transition text-center shadow-xs"
          >
            👤 Employee
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <p className="mt-4 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          ✓ {success}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          ✕ {error}
        </p>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Work Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-purple-600
                       focus:border-purple-600 text-sm transition"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-purple-600
                       focus:border-purple-600 text-sm transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition shadow-sm
            ${
              loading
                ? "bg-purple-400 cursor-not-allowed text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }
            focus:outline-none focus:ring-2 focus:ring-purple-600`}
        >
          {loading ? "Signing in..." : "Sign in to Portal"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-sm text-center text-gray-500">
        New to Staffify?{" "}
        <Link
          to="/register"
          className="text-purple-600 font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;

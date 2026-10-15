import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Briefcase, UserCheck, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

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
        setSuccess("Login successful. Redirecting to dashboard...");
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
      <h2 className="text-xl font-bold text-[#172B4D]">
        Sign in to Staffify
      </h2>
      <p className="mt-1 text-xs text-[#6B778C]">
        Enter your credentials to access your enterprise portal
      </p>

      {/* Quick Demo Access Buttons */}
      <div className="mt-4 p-3 bg-[#F4F5F7] border border-[#DFE1E6] rounded">
        <p className="text-[11px] font-semibold text-[#172B4D] mb-2 flex items-center gap-1.5">
          <KeyRound size={13} className="text-[#0052CC]" />
          <span>Demo Role Access</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@staffify.com", "Admin@123")}
            className="text-xs py-1 px-2 bg-white border border-[#DFE1E6] hover:bg-[#DEEBFF] hover:border-[#B3D4FF] text-[#172B4D] rounded font-medium transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShieldCheck size={12} className="text-[#403294]" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("manager@staffify.com", "Manager@123")}
            className="text-xs py-1 px-2 bg-white border border-[#DFE1E6] hover:bg-[#DEEBFF] hover:border-[#B3D4FF] text-[#172B4D] rounded font-medium transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Briefcase size={12} className="text-[#0747A6]" />
            <span>Manager</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("employee@staffify.com", "Employee@123")}
            className="text-xs py-1 px-2 bg-white border border-[#DFE1E6] hover:bg-[#DEEBFF] hover:border-[#B3D4FF] text-[#172B4D] rounded font-medium transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <UserCheck size={12} className="text-[#0052CC]" />
            <span>Employee</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-4 text-xs text-[#006644] bg-[#E3FCEF] px-3 py-2 rounded border border-[#ABF5D1] flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-xs text-[#DE350B] bg-[#FFEBE6] px-3 py-2 rounded border border-[#FFBDAD] flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#172B4D]"
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
            className="mt-1 w-full px-3 py-2 border border-[#DFE1E6] rounded text-sm text-[#172B4D]
                       focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-[#172B4D]"
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
            className="mt-1 w-full px-3 py-2 border border-[#DFE1E6] rounded text-sm text-[#172B4D]
                       focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-sm font-medium transition cursor-pointer
            ${
              loading
                ? "bg-[#0052CC]/60 cursor-not-allowed text-white"
                : "bg-[#0052CC] hover:bg-[#0747A6] text-white"
            }
            focus:outline-none focus:ring-2 focus:ring-[#0052CC]`}
        >
          {loading ? "Signing in..." : "Sign in to Portal"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-5 text-xs text-center text-[#6B778C]">
        New to Staffify?{" "}
        <Link
          to="/register"
          className="text-[#0052CC] font-semibold hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;

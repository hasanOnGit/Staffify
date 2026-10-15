import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, AlertCircle } from "lucide-react";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await register(name, email, password, role);

      if (res?.msg === "User registered successfully.") {
        setSuccess("Account created successfully. Redirecting to sign in...");

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setError(res?.msg || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.msg || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <h2 className="text-xl font-bold text-[#172B4D]">
        Create your Staffify account
      </h2>
      <p className="mt-1 text-xs text-[#6B778C]">
        Get started with streamlined enterprise HR management
      </p>

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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-[#172B4D]"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-[#DFE1E6] rounded text-sm text-[#172B4D]
                       focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition"
          />
        </div>

        {/* Email */}
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

        {/* Password */}
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
          <p className="mt-1 text-[11px] text-[#6B778C]">
            Must be at least 8 characters
          </p>
        </div>

        {/* Role Selector */}
        <div>
          <label
            htmlFor="role"
            className="block text-xs font-semibold text-[#172B4D]"
          >
            System Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-[#DFE1E6] rounded text-sm text-[#172B4D] bg-white
                       focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition"
          >
            <option value="Employee">Employee (ESS)</option>
            <option value="Manager">Manager (MSS)</option>
            <option value="Admin">HR Administrator</option>
          </select>
        </div>

        {/* Submit Button */}
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-5 text-xs text-center text-[#6B778C]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#0052CC] font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;

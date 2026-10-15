import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await register(name, email, password);

      if (res?.msg === "User registered successfully.") {
        setSuccess("Account created successfully. Redirecting to sign in...");

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setError(res?.msg || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <h2 className="text-3xl font-semibold text-gray-800">
        Create your Staffify account
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Get started with streamlined HR management
      </p>

      {/* Success Message */}
      {success && (
        <p className="mt-4 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
          {success}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-600
                       focus:border-purple-600 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-600
                       focus:border-purple-600 transition"
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
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-600
                       focus:border-purple-600 transition"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition
            ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-600 text-white"
            }
            focus:outline-none focus:ring-2 focus:ring-purple-600
            focus:ring-offset-2`}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-sm text-center text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-purple-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;

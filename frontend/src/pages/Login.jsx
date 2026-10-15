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
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);

      if (res?.msg === "Login successful.") {
        setSuccess("Account created successfully. Redirecting to dashboard...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      }  else {
        setError(res?.msg || "Invalid email or password");
      }
    } catch (err) {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <h2 className="text-3xl font-semibold text-gray-800">
        Sign in to Staffify
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Access your HR dashboard to manage people and processes
      </p>


      {/* Success Message */}
      {success && (
        <p className="mt-4 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
          {success}
        </p>
      )}
      

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                       focus:border-purple-600transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition
            ${
              loading
                ? "bg-purple-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }
            focus:outline-none focus:ring-2 focus:ring-purple-600 
            focus:ring-offset-2`}
        >
          {loading ? "Signing in..." : "Sign in"}
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

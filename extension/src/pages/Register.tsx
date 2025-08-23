import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../utils/api";
const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Password do not match!");
      return;
    }

    try {
      await register({ email, password });
      setSuccess("Registration successful! Redirecting to popup...");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/#/popup"); // Navigate to the popup page
    } catch (error: any) {
      setError(error.message || "Registration failed.");
    }
  };

  return (
    <div>
      <div className="w-full p-4 bg-gray-800 rounded-2xl text-white max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold text-center mb-6">
          Register for BrowseMind
        </h1>
        <form onSubmit={handleRegister} className="flex flex-col space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Register
          </button>
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-center mt-2">{success}</p>
          )}
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <a href="#/login" className="text-blue-400 hover:underline">
            Login here
          </a>
        </p>
      </div>{" "}
    </div>
  );
};

export default Register;

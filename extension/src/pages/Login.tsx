import React, { useState } from "react";
import { login } from "../utils/api"; // Assuming login function is in api.ts
import type { User } from "../types"; // Assuming User type is defined in types.ts

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // To store logged-in user info

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { user } = await login({ email, password });
      setUser(user);
      // In a real app, you'd store the token securely and redirect
      console.log("Logged in successfully:", user);
      // Redirect to the popup page
      window.location.hash = "/popup";
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="w-full p-4 bg-gray-800 rounded-2xl text-white max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Login to BrowseMind
      </h1>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
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
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login
        </button>
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
        {user && (
          <p className="text-green-500 text-sm text-center mt-2">
            Logged in as {user.email}
          </p>
        )}
      </form>
      <p className="text-center text-gray-400 text-sm mt-4">
        Don't have an account?{" "}
        <a href="#/register" className="text-blue-400 hover:underline">
          Register here
        </a>
      </p>
    </div>
  );
};

export default Login;

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Options from "./pages/Options";
import Popup from "./pages/Popup";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { getAuthToken } from "./utils/storage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // Removed useNavigate from here, components will handle their own navigation

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      setIsAuthenticated(!!token); // Set true if token exists, false otherwise
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading while checking auth
  }

  return (
    <Routes>
      {/* If authenticated, default to Popup. If not, default to Register. */}
      <Route path="/" element={isAuthenticated ? <Popup /> : <Register />} />
      {/* Specific routes */}
      <Route path="/popup" element={<Popup />} />
      <Route path="/options" element={<Options />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />{" "}
      {/* Keep /register route for direct access if needed */}
    </Routes>
  );
}

export default App;

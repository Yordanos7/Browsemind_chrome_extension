import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Options from "./pages/Options";
import Popup from "./pages/Popup";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { getAuthToken } from "./utils/storage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        setIsAuthenticated(true);
        navigate("/popup"); // Redirect to popup if authenticated
      } else {
        setIsAuthenticated(false);
        navigate("/"); // Stay on register if not authenticated
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Popup />} />{" "}
          {/* Default to Popup if authenticated */}
          <Route path="/popup" element={<Popup />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Register />} />{" "}
          {/* Default to Register if not authenticated */}
          <Route path="/register" element={<Register />} />{" "}
          {/* Keep /register route for direct access if needed */}
        </>
      )}
      <Route path="/options" element={<Options />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;

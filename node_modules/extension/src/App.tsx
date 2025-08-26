import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Options from "./pages/Options";
import Popup from "./pages/Popup";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Import Dashboard
import { getAuthToken } from "./utils/storage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // Removed useNavigate from here, components will handle their own navigation

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Add a listener for storage changes to update authentication status
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.authToken) {
        setIsAuthenticated(!!changes.authToken.newValue);
      }
    };

    chrome.storage.sync.onChanged.addListener(handleStorageChange);

    // Clean up the listener when the component unmounts
    return () => {
      chrome.storage.sync.onChanged.removeListener(handleStorageChange);
    };
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
      {/* If authenticated, redirect from Login/Register to Popup */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/popup" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/popup" replace /> : <Register />
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />{" "}
      {/* Add Dashboard route */}
    </Routes>
  );
}

export default App;

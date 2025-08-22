import { Routes, Route } from "react-router-dom"; // Removed React import as it's not directly used in JSX
import Options from "./pages/Options";
import Popup from "./pages/Popup";
import Register from "./pages/Register";
import Login from "./pages/Login"; // Import the new Login component

function App() {
  return (
    <Routes>
      <Route path="/" element={<Popup />} />
      <Route path="/options" element={<Options />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} /> {/* Add the Login route */}
    </Routes>
  );
}

export default App;

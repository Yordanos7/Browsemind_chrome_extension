import { Routes, Route } from "react-router-dom";
import Options from "./pages/Options";
import Popup from "./pages/Popup";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/popup" element={<Popup />} />
      <Route path="/options" element={<Options />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;

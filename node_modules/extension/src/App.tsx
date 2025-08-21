import React from "react";
import { Routes, Route } from "react-router-dom";
import Options from "./pages/Options";
import Popup from "./pages/Popup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Popup />} />
      <Route path="/options" element={<Options />} />
    </Routes>
  );
}

export default App;

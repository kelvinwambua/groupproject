// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/NavBar";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login"; 
import Home from "./Pages/Home";


export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/login" element={<Login/>} />

      </Routes>
    </Router>
  );
}

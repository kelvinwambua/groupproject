import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Components/theme-provider";
import Navbar from "./Components/Navbar";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login"; 
import Home from "./Pages/Home";
import About from "./Pages/About";
import Verify2FA from "./Pages/Verift2FA";
import { Users } from "./Pages/Users";


export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}
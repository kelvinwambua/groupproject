import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Components/theme-provider";
import Navbar from "./Components/Navbar";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login"; 
import Home from "./Pages/Home";
import About from "./Pages/About";
import Verify2FA from "./Pages/Verift2FA";
import { Users } from "./Pages/Users";
import SellItem from "./Pages/Sell";
import AdminAddProduct from "./Pages/AdminAddProduct";
import Profile from "./Pages/Profile";
import Cart from "./Pages/Cart";
import OrderConfirmation from "./Pages/OrderConfirmation";
import Services from "./Pages/Services";
import Contact from "./Pages/Contact";



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
            <Route path="/admin/add-product" element={<AdminAddProduct />} />
            <Route path="/sell-item" element={<SellItem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}
// src/pages/SignUp.jsx

import "../assets/Signup.css";

export default function SignUp() {
  return (
    <div className="signup">
      <h1>Create an Account</h1>
      <p>Join MyShop today and enjoy exclusive deals!</p>

      <form className="signup-form">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" placeholder="Enter your name" required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" required />
        </div>

        <button type="submit" className="signup-btn">Sign Up</button>
      </form>
    </div>
  );
}

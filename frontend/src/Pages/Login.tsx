import React, { useState } from "react";
import '../assets/Login.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        // Add logic to handle log in
        e.preventDefault();
        setError("");
        
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        
        alert(`Logged in as ${email}`);
    };

    return (
        <div className="login-container">
            
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
                <div >
                    <label htmlFor="email" className="login-label">Email:</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="login-input"
                        required
                    />
                </div>
                <div >
                    <label htmlFor="password" className="login-label">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="login-input"
                        required
                    />
                </div>
                {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};


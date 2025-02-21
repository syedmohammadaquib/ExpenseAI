import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./Login.css";

const Login = () => {
    const [action, setAction] = useState("");

    const register = () => {
        setAction("active");
    };

    const login = () => {
        setAction("");
    };

    return (
        <div className={`wrapper ${action}`}>
            <div className="form-box login">
                <form action="">
                    <h1>LOGIN</h1>
                    <div className="input-box">
                        <FaUser className="icon" />
                        <input type="text" placeholder="Username" required />
                    </div>
                    <div className="input-box">
                        <FaLock className="icon" />
                        <input type="password" placeholder="Password" required />
                    </div>
                    <button type="submit">LOGIN</button>
                    <div className="register-link">
                        <p>
                            Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); register(); }}>Signup</a>
                        </p>
                    </div>
                </form>
            </div>

            <div className="form-box register">
                <form action="">
                    <h1>SIGNUP</h1>
                    <div className="input-box">
                        <FaUser className="icon" />
                        <input type="text" placeholder="Username" required />
                    </div>
                    <div className="input-box">
                        <FaEnvelope className="icon" />
                        <input type="email" placeholder="Email" required />
                    </div>
                    <div className="input-box">
                        <FaLock className="icon" />
                        <input type="password" placeholder="Password" required />
                    </div>
                    <button type="submit">SIGNUP</button>
                    <div className="register-link">
                        <p>
                            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); login(); }}>Login</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

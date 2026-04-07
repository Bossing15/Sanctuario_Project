import React from "react";
import "./SignUpPage.css";

function SignUpPage() {
  return (
    <div className="signup-bg">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <input type="text" className="signup-input" placeholder="Username" />
        <input type="email" className="signup-input" placeholder="Email" />
        <input type="password" className="signup-input" placeholder="Password" />
        <button className="signup-btn">Sign Up</button>
      </div>
    </div>
  );
}

export default SignUpPage;
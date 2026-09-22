import { useState } from "react";

import {
  registerUser,
  loginUser,
} from "../services/authService";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      let user;

      if (isLogin) {
        user = await loginUser(
          email,
          password
        );

        setMessage(
          "Login successful!"
        );

      } else {

        user = await registerUser(
          email,
          password
        );

        setMessage(
          "Account created successfully!"
        );
      }

      onLogin(user);

    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );

      setMessage(
        error.message
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          📈
        </div>


        <h1>
          TradeLab
        </h1>


        <p className="auth-subtitle">
          Trading Strategy Simulator
        </p>


        <h2>
          {isLogin
            ? "Welcome Back!"
            : "Create Account"}
        </h2>


        <p className="auth-description">

          {isLogin
            ? "Login to access your trading simulator."
            : "Create an account to start testing trading strategies."}

        </p>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <label>
            Email Address
          </label>


          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
          />


          <label>
            Password
          </label>


          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            minLength="6"
            required
          />


          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}

          </button>

        </form>


        {message && (

          <p className="auth-message">

            {message}

          </p>

        )}


        <p className="auth-switch">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {

              setIsLogin(
                !isLogin
              );

              setMessage("");

            }}
          >

            {isLogin
              ? " Sign Up"
              : " Login"}

          </button>

        </p>

      </div>

    </div>

  );
}


export default Auth;
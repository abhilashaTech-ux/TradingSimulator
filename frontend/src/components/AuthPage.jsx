import {
  useState,
} from "react";


import {

  loginUser,

  registerUser,

} from "../services/authService";


function AuthPage() {

  const [
    isLogin,
    setIsLogin,
  ] = useState(true);


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");



  async function
  handleSubmit(e) {

    e.preventDefault();


    try {

      setLoading(
        true
      );


      setError(
        ""
      );


      if (isLogin) {

        await loginUser(
          email,
          password
        );

      } else {

        await registerUser(
          email,
          password
        );

      }


      setEmail(
        ""
      );


      setPassword(
        ""
      );

    } catch (error) {

      console.error(
        error
      );


      let message =
        "Authentication failed";


      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        message =
          "This email is already registered.";

      }


      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        message =
          "Please enter a valid email address.";

      }


      else if (
        error.code ===
        "auth/weak-password"
      ) {

        message =
          "Password should contain at least 6 characters.";

      }


      else if (
        error.code ===
        "auth/invalid-credential"
      ) {

        message =
          "Incorrect email or password.";

      }


      setError(
        message
      );

    } finally {

      setLoading(
        false
      );

    }

  }



  return (

    <div
      className="auth-page"
    >

      <div
        className="auth-card"
      >

        <div
          className="auth-icon"
        >
          📈
        </div>


        <h1>
  TradeLab
</h1>

<p className="auth-subtitle">
  Trading Strategy Simulator
</p>


        <p
          className="auth-description"
        >

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
            required
            minLength="6"
          />



          {error && (

            <p
              className="auth-error"
            >
              {error}
            </p>

          )}



          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading

              ? "Please wait..."

              : isLogin

                ? "Login"

                : "Create Account"

            }

          </button>


        </form>



        <p
          className="auth-switch"
        >

          {isLogin

            ? (
              <>
                Don't have an account?

                <button
                  type="button"
                  onClick={() =>
                    setIsLogin(
                      false
                    )
                  }
                >
                  Sign Up
                </button>

              </>
            )

            : (
              <>
                Already have an account?

                <button
                  type="button"
                  onClick={() =>
                    setIsLogin(
                      true
                    )
                  }
                >
                  Login
                </button>

              </>
            )

          }

        </p>

      </div>

    </div>

  );

}


export default AuthPage;
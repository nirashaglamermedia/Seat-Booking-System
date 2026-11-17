
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import EmailInput from "../features/emailValidation";
import PasswordValidation from "../features/passwordValidation";
import { useRegisterUserMutation } from "../features/userApi";

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conformPassword, setConformPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupAction, setPopupAction] = useState("");

  const [registerUser, { isLoading }] =
    useRegisterUserMutation();

  const passwordsMatch =
    password === conformPassword;
  
  useEffect(() => {
  if (
    passwordsMatch &&
    errorMessage === "Passwords do not match!"
  ) {
    setErrorMessage("");
  }
}, [passwordsMatch, errorMessage]);

  const showMessage = (title, message, action = "") => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupAction(action);
    setShowPopup(true);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !conformPassword ||
      !phone.trim()
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    
    if (password !== conformPassword) {
      console.log("Password:", JSON.stringify(password));
      console.log("Confirm Password:", JSON.stringify(conformPassword));

      setErrorMessage("Passwords do not match!");
      return;
    }

    console.log("Passwords match - continuing registration");

    
    let selectedSeats = [];

    try {
      selectedSeats = JSON.parse(
        localStorage.getItem("selectedSeats") || "[]"
      );
    } catch {
      selectedSeats = [];
    }

    if (
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      showMessage(
        "Select Your Seats",
        "Please go back to the Home page and select at least one seat before creating your account.",
        "home"
      );
      return;
    }

    
    const userData = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      conformpassword: conformPassword,
      phone: phone.trim(),
    };

   
    try {
      await registerUser(userData).unwrap();

      setName("");
      setEmail("");
      setPassword("");
      setConformPassword("");
      setPhone("");

      showMessage(
        "Registration Successful!",
        "Your account has been created successfully. Please log in to continue your booking.",
        "login"
      );
    }  catch (err) {
        

        const message = err?.data?.message;

        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message ||
                err?.error ||
                "Registration failed. Please check your details and try again."
        );
      }
  };

  const handlePopupClose = () => {
    setShowPopup(false);

    if (popupAction === "home") {
      navigate("/");
    } else if (popupAction === "login") {
      navigate("/login");
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex justify-content-center align-items-center p-2 overflow-auto"
      style={{
        background:
          "radial-gradient(ellipse at top, #263044 0%, #111827 48%, #070b12 100%)",
      }}
    >
      <div
        className="card border-0 shadow-lg overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "420px",
          maxHeight: "97vh",
          borderRadius: "10px",
          backgroundColor: "#151c29",
          color: "#f8fafc",
        }}
      >
        
        <div
          className="text-center px-3 pt-2 pb-2"
          style={{
            background:
              "linear-gradient(135deg, #202b3d, #151c29)",
            borderBottom: "1px solid #30394a",
          }}
        >
          <h2
            className="fw-bold mb-0"
            style={{ color: "#f2cc70" }}
          >
            Create Account
          </h2>

          <p className="mb-0 text-light opacity-75">
            Join us and book your favorite seats
          </p>
        </div>

        
        <div className="card-body p-3">
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignup}>
           
            <div className="mb-2">
              <label
                htmlFor="signup-name"
                className="form-label fw-semibold"
              >
                Full Name
              </label>

              <input
                id="signup-name"
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

           
            <div className="mb-2">
              <label className="form-label fw-semibold">
                Email Address
              </label>

              <EmailInput
                email={email}
                setEmail={setEmail}
              />
            </div>

           
            <div className="mb-2">
              <label className="form-label fw-semibold">
                Password
              </label>

              <PasswordValidation
                password={password}
                setPassword={setPassword}
              />
            </div>

            
            <div className="mb-2">
              <label
                htmlFor="signup-confirm-password"
                className="form-label fw-semibold"
              >
                Confirm Password
              </label>

              <input
                id="signup-confirm-password"
                type="password"
                className={`form-control ${
                  conformPassword.length === 0
                    ? ""
                    : passwordsMatch
                    ? "is-valid"
                    : "is-invalid"
                }`}
                placeholder="Re-enter your password"
                value={conformPassword}
                onChange={(e) =>
                  setConformPassword(e.target.value)
                }
                required
              />

              {conformPassword.length > 0 && (
                <small
                  className={
                    passwordsMatch
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {passwordsMatch
                    ? "Passwords match."
                    : "Passwords do not match."}
                </small>
              )}
            </div>

            
            <div className="mb-2">
              <label
                htmlFor="signup-phone"
                className="form-label fw-semibold"
              >
                Phone Number
              </label>

              <input
                id="signup-phone"
                type="tel"
                className="form-control"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

           
            <button
              type="submit"
              className="btn btn-lg w-100 fw-bold"
              disabled={isLoading}
              style={{
                backgroundColor: "#f2cc70",
                color: "#111827",
                border: "none",
              }}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          
          <div className="text-center mt-2">
            <p className="text-light opacity-75 mb-2">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="fw-bold text-decoration-none"
              style={{ color: "#f2cc70" }}
            >
              Login Here
            </Link>
          </div>
        </div>
      </div>

      
      {showPopup && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{
                backgroundColor: "#151c29",
                color: "#f8fafc",
                borderRadius: "16px",
              }}
            >
              <div
                className="modal-header"
                style={{
                  borderBottom: "1px solid #30394a",
                }}
              >
                <h5
                  className="modal-title fw-bold"
                  style={{ color: "#f2cc70" }}
                >
                  {popupTitle}
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handlePopupClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body py-4">
                <p className="mb-0">{popupMessage}</p>
              </div>

              <div
                className="modal-footer"
                style={{
                  borderTop: "1px solid #30394a",
                }}
              >
                <button
                  type="button"
                  className="btn fw-bold px-4"
                  style={{
                    backgroundColor: "#f2cc70",
                    color: "#111827",
                    border: "none",
                  }}
                  onClick={handlePopupClose}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import EmailInput from "../features/emailValidation";
import PasswordValidation from "../features/passwordValidation";
import { useRegisterUserMutation } from "../features/userApi";

const styles = `
.su { background:#f2f2f2; min-height:100vh; display:flex; flex-direction:column; }

/* top bar */
.su-nav { background:#333545; color:#fff; padding:14px 32px; }
.su-logo { font-size:1.5rem; font-weight:800; letter-spacing:-0.5px; }
.su-logo span { color:#f84464; }

/* centre area */
.su-wrap {
  flex:1; display:flex; align-items:center; justify-content:center;
  padding:32px 16px;
}
.su-box {
  display:flex; width:100%; max-width:900px; background:#fff;
  border-radius:16px; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,.12);
}

/* left promo panel */
.su-side {
  flex:1; color:#fff; padding:40px 32px;
  background:linear-gradient(150deg,#1f2030 0%,#3a1c3f 60%,#f84464 160%);
  display:flex; flex-direction:column; justify-content:center;
}
.su-side h2 { font-weight:800; margin-bottom:8px; }
.su-side p { opacity:.8; }
.su-perk { display:flex; align-items:center; gap:12px; margin-top:18px; }
.su-perk i {
  background:rgba(255,255,255,.15); width:38px; height:38px; border-radius:50%;
  display:flex; align-items:center; justify-content:center; color:#ffb3c1;
}

/* right form */
.su-form { flex:1.2; padding:36px 32px; }
.su-form h3 { font-weight:800; margin-bottom:4px; }
.su-form .form-label { font-weight:600; font-size:.9rem; margin-bottom:4px; }
.su-form .form-control { border-radius:8px; padding:.6rem .8rem; }
.su-form .form-control:focus {
  border-color:#f84464; box-shadow:0 0 0 3px rgba(248,68,100,.2);
}

.su-btn {
  background:#f84464; color:#fff; border:0; width:100%;
  padding:.8rem; border-radius:10px; font-weight:700; font-size:1.05rem;
  transition:background .2s;
}
.su-btn:hover:not(:disabled) { background:#d9304f; color:#fff; }
.su-btn:disabled { opacity:.6; }
.su-btn:focus-visible { outline:3px solid #f84464; outline-offset:2px; }
.su-link { color:#f84464; font-weight:700; text-decoration:none; }
.su-link:hover { text-decoration:underline; color:#d9304f; }

.su .modal-content { border:0; border-radius:14px; overflow:hidden; }
.su .modal-header { background:#333545; color:#fff; }

@media (max-width: 768px) {
  .su-side { display:none; }
  .su-form { padding:28px 20px; }
}
`;

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
    } catch (err) {
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
    <div className="su">
      <style>{styles}</style>

      {/* TOP BAR */}
      <div className="su-nav">
        <div className="su-logo">
          cinema<span>seat</span>
        </div>
      </div>

      <div className="su-wrap">
        <div className="su-box">

          {/* LEFT PROMO PANEL */}
          <div className="su-side">
            <h2>Join the show</h2>
            <p>Join us and book your favorite seats.</p>

            <div className="su-perk">
              <i className="bi bi-ticket-perforated"></i>
              <span>Easy online booking</span>
            </div>

            <div className="su-perk">
              <i className="bi bi-grid-3x3-gap"></i>
              <span>Pick your own seats</span>
            </div>

            <div className="su-perk">
              <i className="bi bi-percent"></i>
              <span>Seat, coupon and member discounts</span>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="su-form">
            <h3>Create Account</h3>
            <p className="text-secondary mb-3">
              Fill in your details to continue.
            </p>

            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSignup}>

              <div className="mb-3">
                <label
                  htmlFor="signup-name"
                  className="form-label"
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

              <div className="mb-3">
                <label className="form-label">
                  Email Address
                </label>

                <EmailInput
                  email={email}
                  setEmail={setEmail}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Password
                </label>

                <PasswordValidation
                  password={password}
                  setPassword={setPassword}
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="signup-confirm-password"
                  className="form-label"
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

              <div className="mb-4">
                <label
                  htmlFor="signup-phone"
                  className="form-label"
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
                className="su-btn"
                disabled={isLoading}
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

            <div className="text-center mt-3">
              <span className="text-secondary">
                Already have an account?{" "}
              </span>

              <Link to="/login" className="su-link">
                Login Here
              </Link>
            </div>
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
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="su-btn w-auto px-4"
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
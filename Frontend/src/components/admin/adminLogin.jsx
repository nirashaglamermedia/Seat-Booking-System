
import React, { useState } from "react";
import PasswordValidation from "../../features/passwordValidation";
import { useLoginMutation } from "../../features/authApi";
import { useNavigate } from "react-router-dom";
import EmailInput from "../../features/emailValidation";

function AdminLogin() {

    const[email,setEmail]=useState('');
    const[password,setPassword]=useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const navigate=useNavigate();
    const [login, { isLoading }] = useLoginMutation();

    function showMessage(title, message) {
        setPopupTitle(title);
        setPopupMessage(message);
        setShowPopup(true);
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password) {
        showMessage(
            "Missing Details",
            "Please enter your email and password."
        );
        return;
        }

        try {
        const result = await login({
            email: email.trim(),
            password,
        }).unwrap();

        if (!result.access_token) {
            showMessage("Login Failed", "Access token not received.");
            return;
        }

        const role = result.user?.role?.toLowerCase();

        
        if (role !== "admin" && role !== "manager") {
            showMessage(
            "Access Denied",
            "Only Admin and Manager accounts can log in here."
            );
            return;
        }

        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("user", JSON.stringify(result.user));

        navigate("/admin-dashboard", { replace: true });
        } catch (error) {
        console.error("Login Error:", error);

        const message = error?.data?.message;

        showMessage(
            "Login Failed",
            Array.isArray(message)
            ? message.join(", ")
            : message || "Invalid email or password."
        );
        }
    };
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      style={{
        background:
          'radial-gradient(ellipse at top, #263044 0%, #111827 48%, #070b12 100%)',
      }}>
      <div
        className="card shadow-lg border-0 p-4"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div className="card-body">
          <h2 className="text-center fw-bold mb-2">
            Admin Login
          </h2>


          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <EmailInput
                email={email}
                setEmail={setEmail}/>
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <PasswordValidation 
                password={password}
                setPassword={setPassword}/>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-3"
              onClick={() => window.location.href = "/"}
            >
              Back to Home
            </button>
          </form>
        </div>
      </div>
      {showPopup && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {popupTitle}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPopup(false)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body">
                <p className="mb-0">
                  {popupMessage}
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowPopup(false)}
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

export default AdminLogin;

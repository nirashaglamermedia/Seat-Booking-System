
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/authApi';
import PasswordValidation from '../features/passwordValidation';
import EmailInput from '../features/emailValidation';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('Notice');

  const navigate = useNavigate();
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
        'Missing Details',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      const result = await login({
        email: email.trim(),
        password,
      }).unwrap();

      if (!result.access_token) {
        showMessage(
          'Login Failed',
          'Access token not received.'
        );
        return;
      }

      const role = result.user?.role?.toLowerCase();

      
      if (role !== 'user') {
        showMessage(
          'Access Denied',
          'This login page is for cinema customers only.'
        );
        return;
      }

      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));

      
      const pendingSeats = JSON.parse(
        localStorage.getItem('selectedSeats') || '[]'
      );

      if (Array.isArray(pendingSeats) && pendingSeats.length > 0) {
        navigate('/booking');
      } else {
        navigate('/my-booking');
      }
    } catch (error) {
      console.error('Login Error:', error);

      showMessage(
        'Login Failed',
        'Invalid email or password.'
      );
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      style={{
        background:
          'radial-gradient(ellipse at top, #263044 0%, #111827 48%, #070b12 100%)',
      }}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div
            className="card border-0 shadow-lg overflow-hidden"
            style={{
              backgroundColor: '#151c29',
              borderRadius: '20px',
              
            }}
          >
            <div
              className="text-center px-4 pt-4 pb-3"
              style={{
                background:
                  'linear-gradient(135deg, #202b3d, #111827)',
                borderBottom: '1px solid #343b48',
              }}
            >
              

              <h2
                className="fw-bold mb-2"
                style={{ color: '#f2cc70' }}
              >
                Welcome Back
              </h2>

              <p className="mb-0 text-light opacity-75">
                Sign in to continue your seat booking
              </p>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="form-label fw-semibold"
                    style={{ color: '#f8fafc' }}
                  >
                    Email
                  </label>

                  <EmailInput
                    email={email}
                    setEmail={setEmail}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="password"
                    className="form-label fw-semibold"
                    style={{ color: '#f8fafc' }}
                  >
                    Password
                  </label>

                  <div className="login-password">
                    <PasswordValidation
                      password={password}
                      setPassword={setPassword}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-lg w-100 fw-bold py-3"
                  disabled={isLoading}
                  style={{
                    background:
                      'linear-gradient(135deg, #f2cc70, #c49a35)',
                    color: '#171717',
                    border: 'none',
                    borderRadius: '10px',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i
                        className="bi bi-box-arrow-in-right me-2"
                        aria-hidden="true"
                      />
                      Login
                    </>
                  )}
                </button>
              </form>

              <div className="text-center my-4">
                <div className="d-flex align-items-center gap-3">
                  <hr className="flex-grow-1 border-secondary" />
                  <span className="small text-secondary">OR</span>
                  <hr className="flex-grow-1 border-secondary" />
                </div>
              </div>

              <p className="text-center mb-0 text-light">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="fw-bold text-decoration-none"
                  style={{ color: '#f2cc70' }}
                >
                  Create Account
                </Link>
              </p>

              <div className="text-center mt-4">
                <Link
                  to="/"
                  className="small text-decoration-none"
                  style={{ color: '#aab3c2' }}
                >
                  <i
                    className="bi bi-arrow-left me-2"
                    aria-hidden="true"
                  />
                  Back to Home
                </Link>
              </div>
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
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1055,
          }}
        >
          <div className="modal-dialog modal-dialog-centered px-3">
            <div
              className="modal-content border-secondary"
              style={{
                backgroundColor: '#151c29',
                color: '#f8fafc',
                borderRadius: '16px',
              }}
            >
              <div className="modal-header border-secondary">
                <h5
                  className="modal-title fw-bold"
                  style={{ color: '#f2cc70' }}
                >
                  {popupTitle}
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowPopup(false)}
                />
              </div>

              <div className="modal-body py-4">
                <p className="mb-0">{popupMessage}</p>
              </div>

              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn fw-bold px-4"
                  onClick={() => setShowPopup(false)}
                  style={{
                    backgroundColor: '#f2cc70',
                    color: '#171717',
                  }}
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

export default Login;

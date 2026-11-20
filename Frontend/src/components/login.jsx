import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/authApi';
import PasswordValidation from '../features/passwordValidation';
import EmailInput from '../features/emailValidation';

const styles = `
.lg { background:#f2f2f2; min-height:100vh; display:flex; flex-direction:column; }

/* top bar */
.lg-nav {
  background:#333545; color:#fff; padding:14px 32px;
  display:flex; align-items:center; justify-content:space-between;
}
.lg-logo { font-size:1.5rem; font-weight:800; letter-spacing:-0.5px; }
.lg-logo span { color:#f84464; }
.lg-back { color:#fff; opacity:.8; text-decoration:none; font-size:.9rem; }
.lg-back:hover { opacity:1; color:#fff; }

/* centre area */
.lg-wrap {
  flex:1; display:flex; align-items:center; justify-content:center;
  padding:32px 16px;
}
.lg-box {
  display:flex; width:100%; max-width:820px; background:#fff;
  border-radius:16px; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,.12);
}

/* left promo panel */
.lg-side {
  flex:1; color:#fff; padding:40px 32px;
  background:linear-gradient(150deg,#1f2030 0%,#3a1c3f 60%,#f84464 160%);
  display:flex; flex-direction:column; justify-content:center;
}
.lg-side i.big { font-size:3rem; color:#ffb3c1; }
.lg-side h2 { font-weight:800; margin:12px 0 8px; }
.lg-side p { opacity:.8; margin:0; }

/* right form */
.lg-form { flex:1.1; padding:40px 32px; }
.lg-form h3 { font-weight:800; margin-bottom:4px; }
.lg-form .form-label { font-weight:600; font-size:.9rem; margin-bottom:4px; }
.lg-form .form-control { border-radius:8px; padding:.6rem .8rem; }
.lg-form .form-control:focus {
  border-color:#f84464; box-shadow:0 0 0 3px rgba(248,68,100,.2);
}

.lg-btn {
  background:#f84464; color:#fff; border:0; width:100%;
  padding:.8rem; border-radius:10px; font-weight:700; font-size:1.05rem;
  transition:background .2s;
}
.lg-btn:hover:not(:disabled) { background:#d9304f; color:#fff; }
.lg-btn:disabled { opacity:.6; }
.lg-btn:focus-visible { outline:3px solid #f84464; outline-offset:2px; }
.lg-link { color:#f84464; font-weight:700; text-decoration:none; }
.lg-link:hover { text-decoration:underline; color:#d9304f; }

.lg-or { display:flex; align-items:center; gap:12px; margin:22px 0; color:#999; font-size:.85rem; }
.lg-or::before, .lg-or::after { content:''; flex:1; height:1px; background:#ddd; }

.lg .modal-content { border:0; border-radius:14px; overflow:hidden; }
.lg .modal-header { background:#333545; color:#fff; }

@media (max-width: 768px) {
  .lg-side { display:none; }
  .lg-form { padding:28px 20px; }
}
`;

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
    <div className="lg">
      <style>{styles}</style>

      {/* TOP BAR */}
      <div className="lg-nav">
        <div className="lg-logo">
          cinema<span>seat</span>
        </div>

        <Link to="/" className="lg-back">
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Back to Home
        </Link>
      </div>

      <div className="lg-wrap">
        <div className="lg-box">

          {/* LEFT PROMO PANEL */}
          <div className="lg-side">
            <i className="bi bi-ticket-perforated big" aria-hidden="true"></i>
            <h2>Welcome Back</h2>
            <p>Sign in to continue your seat booking.</p>
          </div>

          {/* RIGHT FORM */}
          <div className="lg-form">
            <h3>Login</h3>
            <p className="text-secondary mb-4">
              Enter your details to continue.
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>

                <EmailInput
                  email={email}
                  setEmail={setEmail}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">
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
                className="lg-btn"
                disabled={isLoading}
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

            <div className="lg-or">OR</div>

            <p className="text-center mb-0 text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="lg-link">
                Create Account
              </Link>
            </p>
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
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="lg-btn w-auto px-4"
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

export default Login;
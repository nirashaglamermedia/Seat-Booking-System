import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddMembershipMutation } from '../features/membershipApi';
import cinemaBackground from '../assets/cinemaclub.jpg';
import Popup from '../features/Popup';

const styles = `
.cc { background:#f2f2f2; min-height:100vh; padding-bottom:3rem; }

/* top bar */
.cc-nav {
  background:#333545; color:#fff; padding:14px 32px;
  display:flex; align-items:center; justify-content:space-between;
  position:sticky; top:0; z-index:10;
}
.cc-logo { font-size:1.5rem; font-weight:800; letter-spacing:-0.5px; }
.cc-logo span { color:#f84464; }

/* hero */
.cc-hero {
  color:#fff; text-align:center; padding:56px 20px 90px;
  background-size:cover; background-position:center;
}
.cc-hero h1 { font-weight:800; font-size:2.4rem; }
.cc-hero p { opacity:.85; margin:10px 0 0; }
.cc-crown { font-size:2.6rem; color:#ffb3c1; }

/* join card (overlaps the hero) */
.cc-join {
  background:#fff; border-radius:16px; padding:32px 24px; text-align:center;
  box-shadow:0 8px 28px rgba(0,0,0,.14);
  max-width:560px; margin:-60px auto 0; position:relative; z-index:2;
}
.cc-join h3 { font-weight:800; margin-bottom:4px; }
.cc-percent {
  font-size:4.5rem; font-weight:800; color:#f84464; line-height:1; margin-top:18px;
}
.cc-off { font-weight:700; letter-spacing:.15em; color:#555; margin-bottom:22px; }

.cc-btn {
  background:#f84464; color:#fff; border:0; padding:.85rem 2.4rem;
  border-radius:10px; font-weight:700; font-size:1.05rem; transition:background .2s;
}
.cc-btn:hover:not(:disabled) { background:#d9304f; color:#fff; }
.cc-btn:disabled { opacity:.6; }
.cc-btn:focus-visible { outline:3px solid #f84464; outline-offset:2px; }

/* benefits */
.cc-title { font-weight:700; font-size:1.5rem; margin:44px 0 18px; }
.cc-title::after {
  content:''; display:block; width:44px; height:4px;
  background:#f84464; border-radius:4px; margin-top:6px;
}
.cc-benefit {
  background:#fff; border-radius:12px; padding:20px; height:100%;
  border-left:5px solid #f84464; box-shadow:0 2px 8px rgba(0,0,0,.06);
  display:flex; gap:14px; align-items:flex-start;
}
.cc-benefit i { color:#f84464; font-size:1.8rem; }

.cc-note {
  background:#fff0f3; color:#a12a42; border-radius:10px;
  padding:14px 18px; margin-top:28px; text-align:center; font-size:.92rem;
}
`;

function CinemaClub() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = React.useState(false);
  const [popupTitle, setPopupTitle] = React.useState('');
  const [popupMessage, setPopupMessage] = React.useState('');
  const [popupType, setPopupType] = React.useState('info');
  const [redirectPath, setRedirectPath] = React.useState(null);

  const showMessage = (title, message, type = 'info', redirect = null) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setRedirectPath(redirect);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);

    if (redirectPath) {
      navigate(redirectPath);
    }

    setRedirectPath(null);
  };
  const [
    addMembership,
    { isLoading }
  ] = useAddMembershipMutation();

  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const handleJoinMembership = async () => {
    if (!localStorage.getItem('access_token') || !user.user_id) {
      showMessage(
        'Login Required',
        'Please login before joining Cinema Club.',
        'warning',
        '/login'
      );
      return;
    }

    try {
      await addMembership({
        user_id: user.user_id
      }).unwrap();

      showMessage(
        'Success',
        'Membership request submitted successfully!',
        'success',
        '/my-membership'
      );

    } catch (error) {
      console.error('Membership request error:', error);

      if (error?.status === 409) {
        showMessage(
          'Already Requested',
          'You already have a membership request.',
          'warning',
          '/my-membership'
        );
      } else {
        const message = error?.data?.message;

        showMessage(
          'Error',
          Array.isArray(message)
            ? message.join('\n')
            : message || 'Failed to submit membership request.',
          'error'
        );
      }
    }
  };

  return (
    <div className="cc">
      <style>{styles}</style>

      {/* TOP BAR */}
      <div className="cc-nav">
        <div className="cc-logo">
          cinema<span>seat</span>
        </div>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate('/')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Home
        </button>
      </div>

      {/* HERO */}
      <div
        className="cc-hero"
        style={{
          backgroundImage: `
            linear-gradient(rgba(31, 32, 48, 0.78), rgba(58, 28, 63, 0.85)),
            url(${cinemaBackground})
          `,
        }}
      >
        <i className="bi bi-stars cc-crown"></i>
        <h1>Welcome to Cinema Club</h1>
        <p>Enjoy exclusive benefits and make every movie experience special.</p>
      </div>

      <div className="container">

        {/* JOIN CARD */}
        <div className="cc-join">
          <h3>Cinema Club Membership</h3>
          <p className="text-secondary mb-0">
            Your movie experience, upgraded.
          </p>

          <div className="cc-percent">5%</div>
          <div className="cc-off">TICKET DISCOUNT</div>

          <button
            className="cc-btn"
            onClick={handleJoinMembership}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus-fill me-2"></i>
                Join Cinema Club
              </>
            )}
          </button>
        </div>

        {/* BENEFITS */}
        <h2 className="cc-title">Membership Benefits</h2>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="cc-benefit">
              <i className="bi bi-ticket-perforated-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">5% Ticket Discount</h6>
                <small className="text-secondary">
                  Save 5% on eligible ticket bookings.
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="cc-benefit">
              <i className="bi bi-people-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">Book Up to 10 Seats</h6>
                <small className="text-secondary">
                  Enjoy booking up to 10 seats per booking.
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="cc-benefit">
              <i className="bi bi-calendar-check-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">One Year Membership</h6>
                <small className="text-secondary">
                  Enjoy membership benefits for one year.
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="cc-benefit">
              <i className="bi bi-star-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">Exclusive Membership</h6>
                <small className="text-secondary">
                  Become a special Cinema Club member.
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="cc-note">
          <i className="bi bi-info-circle me-2"></i>
          Membership requires admin approval. Your membership benefits will be
          activated after approval.
        </div>
      </div>

      <Popup
        show={showPopup}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={handleClosePopup}
      />
    </div>
  );
}

export default CinemaClub;
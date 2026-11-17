
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddMembershipMutation } from '../features/membershipApi';
import cinemaBackground from '../assets/cinemaclub.jpg';
import Popup from '../features/Popup';


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
    <div
        className="container-fluid py-5"
        style={{
            backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)),
            url(${cinemaBackground})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
        }}
        >

      <div className="text-center mb-5">
        

        <h1 className="fw-bold display-5">
           <span className="text-warning">Welcome to Cinema Club</span>
        </h1>

        <p className="text-secondary mt-3">
          Enjoy exclusive benefits and make every movie experience special.
        </p>
      </div>

      <div
        className="card border-0 shadow-lg mx-auto overflow-hidden"
        style={{ maxWidth: '850px', borderRadius: '20px' }}
      >
        <div
          className="p-5 text-white text-center"
          style={{
            background: 'linear-gradient(135deg, #172033, #263b5c)'
          }}
        >
          <div className="mb-3">
            <i
              className="bi bi-stars text-warning"
              style={{ fontSize: '45px' }}
            ></i>
          </div>

          <h2 className="fw-bold">Cinema Club Membership</h2>

          <p className="text-light opacity-75">
            Your movie experience, upgraded.
          </p>

          <div className="my-4">
            <h1 className="display-2 fw-bold text-warning">5%</h1>
            <h5 className="fw-semibold">TICKET DISCOUNT</h5>
          </div>

          <button
            className="btn btn-warning btn-lg px-5 fw-bold"
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

        <div className="card-body p-4 p-md-5">

          <h4 className="fw-bold text-center mb-4">
            Membership Benefits
          </h4>

          <div className="row g-4">

            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                <div className="bg-warning rounded-circle p-3 me-3">
                  <i className="bi bi-ticket-perforated-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">5% Ticket Discount</h6>
                  <small className="text-secondary">
                    Save 5% on eligible ticket bookings.
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                <div className="bg-warning rounded-circle p-3 me-3">
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Book Up to 10 Seats</h6>
                  <small className="text-secondary">
                    Enjoy booking up to 10 seats per booking.
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                <div className="bg-warning rounded-circle p-3 me-3">
                  <i className="bi bi-calendar-check-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">One Year Membership</h6>
                  <small className="text-secondary">
                    Enjoy membership benefits for one year.
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                <div className="bg-warning rounded-circle p-3 me-3">
                  <i className="bi bi-star-fill fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Exclusive Membership</h6>
                  <small className="text-secondary">
                    Become a special Cinema Club member.
                  </small>
                </div>
              </div>
            </div>

          </div>

          <hr className="my-4" />

          <div className="text-center">
            <p className="text-secondary mb-1">
              Membership requires admin approval.
            </p>
            <small className="text-muted">
              Your membership benefits will be activated after approval.
            </small>
          </div>

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

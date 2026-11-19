
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useGetMembershipsQuery } from '../features/membershipApi';


function Booking() {
  const navigate = useNavigate();

  const selectedSeat = JSON.parse(
    localStorage.getItem('selectedSeats') || '[]'
  );

  const totalPrice = Number(
    localStorage.getItem('totalPrice') || 0
  );

  const movieId = localStorage.getItem("movie_id");
  const movieName = localStorage.getItem("movie_name");
  const showtimeId = localStorage.getItem("showtime_id");
  const visitDate = localStorage.getItem("visit_date");
  const startTime = localStorage.getItem("start_time");

  const subtotal = Number(
    localStorage.getItem('subtotal') || 0
  );

  const totalDiscount = subtotal - totalPrice;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("Notice");
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const couponCardRef = useRef(null);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);

  function showMessage(title, message) {
    setPopupTitle(title);
    setPopupMessage(message);
    setShowPopup(true);
  }

   async function handleApplyCoupon() {
    setCouponMessage('');
    setCouponDiscount(0);
    setAppliedCoupon('');

    if (!couponCode.trim()) {
      setCouponMessage('Please enter your coupon code.');
      return;
    }

    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      setCouponMessage('Please login before applying a coupon.');
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      setCouponMessage('Invalid user session. Please login again.');
      return;
    }

    if (!user?.user_id) {
      setCouponMessage('Customer details not found.');
      return;
    }

    setCouponLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/coupons/user/${user.user_id}`
      );

      const result = await response.json();

      console.log('Booking API Response:', result);

      if (!response.ok) {
        const message = result?.message;

        throw new Error(
          Array.isArray(message)
            ? message.join(', ')
            : message || 'Unable to confirm your booking.'
        );
      }
      if (
        result.user_id !== Number(user.user_id) ||
        result.coupon_code !== couponCode.trim()
      ) {
        throw new Error('Invalid coupon code.');
      }

      
      if (result.status !== 'Available') {
        throw new Error('This coupon has already been used or is unavailable.');
      }

      
      if (
        result.expires_at &&
        new Date(result.expires_at).getTime() <= Date.now()
      ) {
        throw new Error('This coupon has expired.');
      }

      const percentage = Number(result.discount_percentage);

      if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
        throw new Error('Invalid coupon discount.');
      }

      
      const discount = Math.round(
        (totalPrice * percentage / 100) * 100
      ) / 100;

      setCouponDiscount(discount);
      setAppliedCoupon(result.coupon_code);

      setCouponMessage(
        `${percentage}% coupon successfully applied!`
      );

    } catch (error) {
      setCouponMessage(
        error.message || 'Unable to apply coupon.'
      );
    } finally {
      setCouponLoading(false);
    }
  }

    
  function handleRemoveCoupon() {
    setAppliedCoupon('');
    setCouponDiscount(0);
    setCouponCode('');
    setCouponMessage('');
  }

  const finalTotal = Math.max(
    0,
    totalPrice - couponDiscount
  );
  async function downloadCouponPNG() {
  if (!couponCardRef.current || !generatedCoupon) {
    return;
  }

  try {
    const imageUrl = await toPng(couponCardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#172554',
    });

    const link = document.createElement('a');
    link.download = `Cinema-Coupon-${generatedCoupon.code}.png`;
    link.href = imageUrl;
    link.click();
  } catch (error) {
    console.error('Coupon PNG Error:', error);
    showMessage('Download Failed', 'Unable to download coupon. Please try again.');
  }
}
  async function handleConfirm() {
    setErrorMessage('');

    if (selectedSeat.length === 0) {
      setErrorMessage('Please select at least one seat.');
      return;
    }

    if (selectedSeat.length > maxSeats) {
      setErrorMessage(
        `You can select a maximum of ${maxSeats} seats.`
      );
      return;
    }

    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      alert('Please login before confirming your booking.');
      navigate('/login');
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      showMessage(
        'Session Invalid',
        'Your session is invalid. Please login again.'
      )
      
      navigate('/login');
      return;
    }

    if (!user?.user_id) {
      showMessage(
        'User details not found.',
        ' Please login again.'
      )
      
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const seatsResponse = await fetch(
        'http://localhost:3001/seats'
      );

      if (!seatsResponse.ok) {
        throw new Error('Unable to load seat information.');
      }

      const allSeats = await seatsResponse.json();

      const seatsToBook = selectedSeat.map((seatName) => {
        const seat = allSeats.find(
          (item) =>
            `${item.row_name}${item.seat_number}` === seatName
        );

        if (!seat) {
          throw new Error(`Seat ${seatName} was not found.`);
        }

        return {
          seat_id: Number(seat.seat_id),
        };
      });

      const token = localStorage.getItem('access_token');

      const response = await fetch("http://localhost:3001/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(user.user_id),
          showtime_id: Number(showtimeId),
          visit_date: visitDate,
          seats: seatsToBook,
          ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
        }),
      });

      const result = await response.json();

      console.log("Booking API Response:", result);

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "Booking failed"
        );
      }

      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('totalPrice');
      localStorage.removeItem('subtotal');
      localStorage.removeItem('discount');

      localStorage.removeItem('movie_id');
      localStorage.removeItem('movie_name');
      localStorage.removeItem('showtime_id');
      localStorage.removeItem('visit_date');
      localStorage.removeItem('start_time');

      
      
        if (result.generated_coupon_code) {
        setGeneratedCoupon({
          code: result.generated_coupon_code,
          percentage: result.generated_coupon_percentage || 10,
          name: user.name || 'Valued Customer',
          expiresAt:
            result.generated_coupon_expires_at ||
            result.coupon_expires_at ||
            result.expires_at ||
            null,
        });

        setPopupTitle('Booking Successful!');
        setPopupMessage(
          `Your booking ID is ${result.booking_id}. Congratulations! You have received a 10% reward coupon.`
        );
        setShowPopup(true);

      } else {
      showMessage(
        'Booking Successful',
        `Your booking ID is ${result.booking_id}. Final Amount: Rs. ${Number(result.final_total ?? result.total ?? finalTotal).toFixed(2)}`
      );
    }
    } catch (error) {
      setErrorMessage(
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (loading) return;

    localStorage.removeItem('selectedSeats');
    localStorage.removeItem('totalPrice');

    navigate('/my-booking');
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: memberships = [] } = useGetMembershipsQuery();

  const membership = memberships.find(
    (item) =>
      Number(item.user_id) === Number(user.user_id) &&
      item.status === 'Active'
  );

  const isActiveMember = Boolean(membership);
  const maxSeats = isActiveMember ? 10 : 5;

  return (
    <div className="container-fluid bg-black min-vh-100 py-5">
      

      <div
        ref={couponCardRef}
        style={{
          position: 'fixed',
          left: '-10000px',
          top: '0px',
          width: '600px',
          minHeight: '400px',
          padding: '40px',
          backgroundColor: '#172554',
          color: '#ffffff',
          textAlign: 'center',
          borderRadius: '20px',
          fontFamily: 'Arial, sans-serif',
          border: '5px solid #fbbf24',
          boxSizing: 'border-box',
          zIndex: 9999,
        }}
      >
        <h2 style={{ letterSpacing: '3px' }}>
          CINEMA REWARDS
        </h2>

        <p>SPECIAL OFFER FOR YOU</p>

        <h1 style={{
          fontSize: '65px',
          color: '#facc15',
          fontWeight: 'bold',
        }}>
          {generatedCoupon?.percentage || 10}% OFF
        </h1>

        <h3>YOUR NEXT BOOKING</h3>

        <hr />

        <p>
          Congratulations, {generatedCoupon?.name || 'Valued Customer'}!
        </p>

        <p>Your exclusive coupon code</p>

        <h1 style={{
            background: 'white',
            color: '#172554',
            padding: '15px',
            borderRadius: '10px',
            letterSpacing: '3px',
          }}>
            {generatedCoupon?.code || 'COUPON'}
          </h1>
          <p style={{ marginTop: '20px', fontSize: '18px' }}>
            Valid Until: {
              generatedCoupon?.expiresAt
                ? new Date(generatedCoupon.expiresAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Not available'
            }
          </p>
        <p>* One-time use only</p>

        <p>Thank you for choosing our Cinema Booking System!</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6 col-xl-5">

          <div className="card border-0 shadow">
            <div className="card-header bg-dark text-white p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="fw-bold mb-1">
                    Review Your Booking
                  </h4>

                  <small className="text-white-50">
                    Your booking details
                  </small>
                </div>

                <span className="badge bg-light text-dark">
                  {selectedSeat.length} seat
                  {selectedSeat.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="card-body p-4">

              {/* Movie Details */}
              <div className="border rounded-3 p-3 mb-4">

                <h6 className="fw-bold mb-3">
                  <i className="bi bi-film me-2"></i>
                  Movie Details
                </h6>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Movie</span>
                  <strong>{movieName || "Not available"}</strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Visit Date</span>
                  <strong>{visitDate || "Not available"}</strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Showtime</span>
                  <strong>{startTime || "Not available"}</strong>
                </div>

              </div>

              {errorMessage && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  <strong>Booking failed:</strong>{' '}
                  {errorMessage}
                </div>
              )}

              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  Selected Seats
                </h6>

                {selectedSeat.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeat.map((seat, index) => (
                      <span
                        key={`${seat}-${index}`}
                        className="badge border border-primary text-primary bg-light p-2 fs-6"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-warning mb-0">
                    No seats selected. Please select seats first.
                  </div>
                )}
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary">
                  Total seats
                </span>

                <span className="fw-semibold">
                  {selectedSeat.length}
                </span>
              </div>
                <div className="border rounded-3 p-3 mb-4">

                <h6 className="fw-bold mb-3">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Have a Coupon?
                </h6>

                {!appliedCoupon ? (

                  <>
                    <div className="input-group">

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponMessage('');
                        }}
                        disabled={couponLoading || loading}
                      />

                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || loading}
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>

                    </div>

                    {couponMessage && (
                      <div className="mt-2 small text-danger">
                        {couponMessage}
                      </div>
                    )}
                  </>

                ) : (

                  <>
                    <div className="alert alert-success mb-2">

                      <div className="d-flex justify-content-between align-items-center">

                        <div>
                          <strong>{appliedCoupon}</strong>
                          <div className="small">
                            Coupon successfully applied!
                          </div>
                        </div>

                        <span className="badge bg-success">
                          10% OFF
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveCoupon}
                      disabled={loading}
                    >
                      Remove Coupon
                    </button>
                  </>

                )}

                {!appliedCoupon && couponMessage && (
                  <div className="small text-success mt-2">
                    {couponMessage}
                  </div>
                )}

              </div>
              

              <div className="rounded-3 bg-light p-3 mb-4">

                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-success">
                      Seat & Membership Discount
                    </span>

                    <span className="text-success">
                      - Rs. {totalDiscount.toFixed(2)}
                    </span>
                  </div>

                  {isActiveMember && (
                    <div className="text-success small mb-2">
                      <i className="bi bi-star-fill me-2"></i>
                      Cinema Club Member – 5% discount included
                    </div>
                  )}
                  

                  <hr />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">
                      Final Amount
                    </span>

                    <h3 className="fw-bold text-success mb-0">
                      Rs. {finalTotal.toFixed(2)}
                    </h3>
                  </div>

                </div>

              <button
                type="button"
                className="btn btn-success btn-lg w-100 mb-3"
                onClick={handleConfirm}
                disabled={loading || selectedSeat.length === 0}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                    Confirming Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel and Return
              </button>

              
            </div>
          </div>

          
        </div>
      </div>
      {showPopup && (
  <div
    className="modal d-block"
    tabIndex="-1"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10000,
    }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">

        <div className="modal-header bg-dark text-white">
          <h5 className="modal-title">{popupTitle}</h5>

          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => {
              setShowPopup(false);
              navigate('/my-booking');
            }}
          ></button>
        </div>

        <div className="modal-body text-center p-4">

          <div className="text-success mb-3">
            <i className="bi bi-check-circle-fill fs-1"></i>
          </div>

          <p>{popupMessage}</p>

          {generatedCoupon && (
            <div
              className="p-3 mt-3"
              style={{
                background: '#172554',
                color: 'white',
                border: '4px solid #fbbf24',
                borderRadius: '15px',
              }}
            >
              <h4 style={{ letterSpacing: '2px' }}>
                CINEMA REWARDS
              </h4>

              <p>SPECIAL OFFER FOR YOU</p>

              <h1
                style={{
                  color: '#facc15',
                  fontSize: '55px',
                  fontWeight: 'bold',
                }}
              >
                {generatedCoupon.percentage}% OFF
              </h1>

              <h5>YOUR NEXT BOOKING</h5>

              <hr />

              <p>
                Congratulations, {generatedCoupon.name}!
              </p>

              <p>Your exclusive coupon code</p>

              <div
                className="p-3 rounded"
                style={{
                  background: 'white',
                  color: '#172554',
                  fontSize: '25px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                }}
              >
                {generatedCoupon.code}
              </div>

              <p className="mt-3 mb-2">
                <strong>Valid Until:</strong>{' '}
                {generatedCoupon.expiresAt
                  ? new Date(generatedCoupon.expiresAt).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }
                    )
                  : 'Not available'}
              </p>

              <small>* One-time use only</small>
            </div>
          )}

        </div>

        <div className="modal-footer justify-content-center">

          {generatedCoupon ? (
            <>
              <button
                type="button"
                className="btn btn-success"
                onClick={downloadCouponPNG}
              >
                <i className="bi bi-download me-2"></i>
                Download Coupon PNG
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowPopup(false);
                  navigate('/my-booking');
                }}
              >
                Continue
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowPopup(false);
                navigate('/my-booking');
              }}
            >
              OK
            </button>
          )}

        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Booking;

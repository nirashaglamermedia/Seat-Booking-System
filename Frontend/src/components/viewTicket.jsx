import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetBookingByUserIdQuery,
} from '../features/bookingApi';

function ViewTicket() {
  const navigate = useNavigate();
  const { booking_id } = useParams();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.user_id;

  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useGetBookingByUserIdQuery(userId);

  // Get selected booking
  const booking = bookings.find(
    (item) => Number(item.booking_id) === Number(booking_id)
  );

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading ticket...</p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-danger">Ticket not found!</h5>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/my-booking')}
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '600px' }}
      >
        <div className="card-header bg-dark text-white text-center py-3">
          <h3 className="mb-0">Cinema Ticket</h3>
        </div>

        <div className="card-body p-4">
          <h4 className="text-center mb-4">View Ticket</h4>

          <div className="row mb-3">
            <div className="col-5 text-muted">Booking ID</div>
            <div className="col-7 fw-bold">
              {booking.booking_id}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5 text-muted">Movie Name</div>
            <div className="col-7 fw-bold">
              {booking.movie_name || '-'}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5 text-muted">Visit Date</div>
            <div className="col-7 fw-bold">
              {booking.visit_date
                ? new Date(booking.visit_date).toLocaleDateString()
                : '-'}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5 text-muted">Showtime</div>
            <div className="col-7 fw-bold">
              {booking.start_time || '-'}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5 text-muted">Seats</div>
            <div className="col-7 fw-bold">
              {booking.booked_seats || '-'}
            </div>
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">Total Price</span>
            <h4 className="text-success mb-0">
              Rs. {Number(booking.total).toFixed(2)}
            </h4>
          </div>

          <div className="text-center mt-4">
            <span
              className={`badge px-3 py-2 ${
                booking.status === 'Confirmed'
                  ? 'bg-success'
                  : 'bg-danger'
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="card-footer bg-light text-center py-3">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/my-booking')}
          >
            Back
          </button>

          <button
            className="btn btn-primary ms-2"
            onClick={() => window.print()}
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewTicket;
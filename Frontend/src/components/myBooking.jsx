
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

import {
  useGetBookingByUserIdQuery,
  useMarkArrivedMutation,
} from '../features/bookingApi';

import { useGetMembershipsQuery } from '../features/membershipApi';
const socket = io('http://localhost:3001');

function MyBooking() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.user_id;

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
}  = useGetBookingByUserIdQuery(userId);

  const [markArrived, { isLoading: isArriving }] =
    useMarkArrivedMutation();

  
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('Notice');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  
  function showMessage(title, message, type = 'success') {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  }

  useEffect(() => {

    function handleBookingUpdate(data) {

        if (Number(data.user_id) === Number(userId)) {

            console.log('Booking updated:', data);

            // Automatically reload customer bookings
            refetch();
        }
    }

    socket.on('bookingUpdated', handleBookingUpdate);

    return () => {
        socket.off('bookingUpdated', handleBookingUpdate);
    };

}, [userId, refetch]);
  async function handleArrived(bookingId) {
    try {
      await markArrived({
        booking_id: bookingId,
        user_id: userId,
      }).unwrap();

      showMessage(
        'Arrival Confirmed',
        'Your arrival has been successfully confirmed!',
        'success'
      );

    } catch (err) {
      const message = err?.data?.message;

      showMessage(
        'Arrival Failed',
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Failed to confirm your arrival.',
        'danger'
      );
    }
  }

  
  function handleAddBooking() {
    navigate('/');
  }

  
  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    navigate('/');
  }
  const { data: memberships = [] } = useGetMembershipsQuery();
  
  const membership = memberships.find(
      (item) => Number(item.user_id) === Number(user.user_id)
  );
  
  const isActiveMember = membership?.status === 'Active';

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">

      <div className="container">

       
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>
            <h2 className="fw-bold text-dark mb-2">
              My Bookings
            </h2>

            <p className="text-secondary mb-0">
              Manage your cinema bookings and confirm your arrival.
            </p>
          </div>

          <div className="d-flex gap-2">

            <button
              className="btn btn-primary px-3"
              onClick={handleAddBooking}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Booking
            </button>

            <button
              className="btn btn-outline-danger px-3"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
            <span className="text-black d-none d-md-inline">
              <i className="bi bi-person-circle me-2"></i>
              {user.name || user.username || 'Customer'}
            </span>
          </div>

        </div>

        
        <div className="card border-0 shadow-sm rounded-3">

          {/* Card Header */}
          <div className="card-header bg-white border-bottom py-3">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-ticket-perforated me-2 text-primary"></i>
                  Booking Details
                </h5>

                <small className="text-secondary">
                  View your booking information
                </small>
              </div>

              <span className="badge bg-primary rounded-pill px-3 py-2">
                {bookings.length} Bookings
              </span>

            </div>

          </div>

          
          <div className="card-body p-3 p-md-4">

            <div className="table-responsive">

              <table className="table table-hover table-bordered align-middle text-center mb-0">

                <thead className="table-light">

                  <tr>
                    <th className="py-3">Booking ID</th>
                    <th className="py-3">Booking Date</th>
                    <th className="py-3">Seats</th>
                    <th className="py-3">Movie Name</th>
                    <th className="py-3">Visit Date</th>
                    <th className="py-3">Showtime</th>
                    <th className="py-3">Total Price</th>
                    <th className="py-3">Tickect</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>

                </thead>

                <tbody>

                  
                  {isLoading ? (

                    <tr>
                      <td colSpan="9" className="py-5">

                        <div className="d-flex flex-column align-items-center">

                          <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Loading...
                            </span>
                          </div>

                          <span className="text-secondary">
                            Loading your bookings...
                          </span>

                        </div>

                      </td>
                    </tr>

                  ) : isError ? (

                    
                    <tr>
                      <td colSpan="9" className="py-5">

                        <i className="bi bi-exclamation-circle text-danger fs-2"></i>

                        <p className="text-danger mt-2 mb-0">
                          Failed to load bookings. Please try again.
                        </p>

                      </td>
                    </tr>

                  ) : bookings.length === 0 ? (

                    
                    <tr>
                      <td colSpan="9" className="py-5">

                        <i className="bi bi-ticket-perforated text-secondary fs-1"></i>

                        <h6 className="fw-bold mt-3">
                          No Bookings Found
                        </h6>

                        <p className="text-secondary mb-3">
                          You haven't made any cinema bookings yet.
                        </p>

                        

                      </td>
                    </tr>

                  ) : (

                    
                    bookings.map((booking) => (

                      <tr key={booking.booking_id}>

                        <td className="fw-semibold">
                          {booking.booking_id}
                        </td>

                        <td className="text-nowrap">
                          {new Date(
                            booking.booking_date
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          <span className="fw-medium">
                            {booking.booked_seats}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium">
                            {booking.movie_name || '-'}
                          </span>
                        </td>
                         <td className="text-nowrap">
                            {booking.visit_date
                              ? new Date(booking.visit_date).toLocaleDateString()
                              : '-'}
                          </td>

                          <td className="text-nowrap">
                            {booking.start_time || '-'}
                          </td>

                        <td className="fw-semibold text-nowrap">
                          Rs. {Number(booking.total).toFixed(2)}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/view/${booking.booking_id}`)}
                            >
                              
                              View
                            </button>

                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => navigate(`/modified/${booking.booking_id}`)}
                            >
                              
                              Modify
                            </button>
                          </div>
                        </td>
                       
                        <td>

                          {booking.status === 'Confirmed' ? (

                            <span className="badge bg-success px-3 py-2">
                              Confirmed
                            </span>

                          ) : (

                            <span className="badge bg-danger px-3 py-2">
                              Cancelled
                            </span>

                          )}

                        </td>

                        
                        <td className="text-nowrap">

                          {booking.arrival_status === 'Arrived' ? (

                            <button
                              className="btn btn-success btn-sm"
                              disabled
                            >
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Arrival Confirmed
                            </button>

                          ) : booking.status !== 'Confirmed' ? (

                            <button
                              className="btn btn-secondary btn-sm"
                              disabled
                            >
                              Not Available
                            </button>

                          ) : (

                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleArrived(booking.booking_id)
                              }
                              disabled={isArriving}
                            >

                              {isArriving ? (

                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                  ></span>
                                  Confirming...
                                </>

                              ) : (

                                <>
                                  <i className="bi bi-geo-alt me-1"></i>
                                  I Have Arrived
                                </>

                              )}

                            </button>

                          )}

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

        
        

      </div>

      
      {showPopup && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 shadow rounded-3">

              
              <div className="modal-header">

                <h5 className="modal-title fw-bold">

                  {popupType === 'success' ? (

                    <i className="bi bi-check-circle-fill text-success me-2"></i>

                  ) : (

                    <i className="bi bi-exclamation-circle-fill text-danger me-2"></i>

                  )}

                  {popupTitle}

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPopup(false)}
                ></button>

              </div>

              
              <div className="modal-body py-4">

                <p className="mb-0 text-secondary">
                  {popupMessage}
                </p>

              </div>

              
              <div className="modal-footer">

                <button
                  type="button"
                  className={`btn btn-${popupType} px-4`}
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

export default MyBooking;

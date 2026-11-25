import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useGetBookingsQuery,
  useDeleteBookingMutation,
} from '../../../features/bookingApi';
import Popup from '../../../features/Popup';

function BookingList() {
  const navigate = useNavigate();

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch, 
  } = useGetBookingsQuery();

  const [deleteBooking] = useDeleteBookingMutation();

  const [deletingBookingId, setDeletingBookingId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [popupAction, setPopupAction] = useState('confirm');

  const handleDelete = (bookingId) => {
    setSelectedBookingId(bookingId);
    setPopupTitle('Delete Booking');
    setPopupMessage('Are you sure you want to delete this Booking?');
    setPopupType('warning');
    setPopupAction('confirm');
    setShowPopup(true);
  };

  const confirmDelete = async () => {
    if (selectedBookingId === null) return;

    const bookingId = selectedBookingId;
    setDeletingBookingId(bookingId);
    
    setShowPopup(false);

    try {
      await deleteBooking(bookingId).unwrap();
      
      
      refetch();

      setPopupTitle('Success');
      setPopupMessage('Booking deleted successfully!');
      setPopupType('success');
      setPopupAction('message');
      setShowPopup(true);
    } catch (err) {
      console.error('Delete error:', err);

      const message = err?.data?.message;
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message || 'Failed to delete booking. Please try again.';

      setPopupTitle('Delete Failed');
      setPopupMessage(errorMessage);
      setPopupType('error');
      setPopupAction('message');
      setShowPopup(true);
    } finally {
      setDeletingBookingId(null);
      setSelectedBookingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5">
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Failed to load bookings.{' '}
          {error?.data?.message ||
            error?.status ||
            'Please check the backend and API connection.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Booking Management System
          </h2>
          <p className="text-muted mb-0">
            Manage all Seats bookings
          </p>
        </div>

        <button
          type="button"
          className="btn btn-danger"
          aria-label="Close"
          onClick={() => navigate('/admin-dashboard')}
        >
          ×
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">Booking List</h5>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Name</th>
                  <th>Booked Seats</th>
                  <th>Booking Date</th>
                  <th>Movie Name</th>
                  <th>Visit Date</th>
                  <th>Showtime</th>
                  <th>Total (LKR)</th>
                  <th>Arrival status</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.booking_id}</td>

                      <td>
                        <strong>
                          {booking.customer_name || 'Unknown'}
                        </strong>
                      </td>

                      <td>
                        <span className="badge bg-primary">
                          {booking.booked_seats || 'No seats'}
                        </span>
                      </td>

                      <td>
                        {booking.booking_date
                          ? new Date(
                              booking.booking_date
                            ).toLocaleString()
                          : '-'}
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
                      <td className="text-nowrap">
                        Rs. {Number(booking.total || 0).toFixed(2)}
                      </td>
                      <td className="text-nowrap">
                        {booking.arrival_status || 'Not Arrived'}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            booking.status === 'Confirmed'
                              ? 'bg-success'
                              : booking.status === 'Cancelled'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}
                        >
                          {booking.status || 'Unknown'}
                        </span>
                      </td>

                      <td className="text-center text-nowrap">
                       {new Date(booking.visit_date).setHours(0, 0, 0, 0) >=
                          new Date().setHours(0, 0, 0, 0) &&
                          booking.arrival_status !== 'Arrived' &&
                          booking.status !== 'Cancelled' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-warning me-1"
                              onClick={() =>
                                navigate(`/edit-booking/${booking.booking_id}`)
                              }
                            >
                              Edit
                            </button>
                          )}

                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          disabled={deletingBookingId === booking.booking_id}
                          onClick={() =>
                            handleDelete(booking.booking_id)
                          }
                        >
                          {deletingBookingId === booking.booking_id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-footer bg-white text-muted">
          Showing {bookings.length} booking(s)
        </div>
      </div>

      <Popup
        show={showPopup}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={() => {
          setShowPopup(false);
          setSelectedBookingId(null);
        }}
        onConfirm={
          popupAction === 'confirm'
            ? confirmDelete
            : undefined
        }
        confirmText="OK"
        cancelText="Cancel"
      />
    </div>
  );
}

export default BookingList;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetBookingByIdQuery,
  useUpdateBookingMutation,
  useCancelBookingSeatMutation,
} from '../../../features/bookingApi';

function EditBooking() {
  const navigate = useNavigate();
  const {booking_id} = useParams();

  
  const [customerName, setCustomerName] = useState('');
  const [bookedSeats, setBookedSeats] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [total, setTotal] = useState('');
  const [status, setStatus] = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedBookingSeatId, setSelectedBookingSeatId] = useState(null);
  
  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useGetBookingByIdQuery(booking_id);

  
  
const [
  updateBooking,
  {
    isLoading: isUpdating,
  },
] = useUpdateBookingMutation();

const [
  cancelBookingSeat,
  {
    isLoading: isCancellingSeat,
  },
] = useCancelBookingSeatMutation();


 
  useEffect(() => {
    if (booking) {
      setCustomerName(booking.customer_name ?? '');
      setBookedSeats(booking.booked_seats ?? '');

      setBookingDate(
        booking.booking_date
          ? String(booking.booking_date).slice(0, 10)
          : ''
      );

      setTotal(booking.total ?? '');
      setStatus(booking.status ?? '');
    }
  }, [booking]);

  
  const showMessage = (title, message, type = 'success') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setConfirmAction(null);
    setShowPopup(true);
  };

  
  const showConfirmation = (title, message, action) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setConfirmAction(() => action);
    setShowPopup(true);
  };

  
  const closePopup = () => {
    setShowPopup(false);
    setConfirmAction(null);
    setSelectedBookingSeatId(null);
  };

  
  const handlePopupConfirm = async () => {
    if (confirmAction) {
      const action = confirmAction;
      setShowPopup(false);
      setConfirmAction(null);
      await action();
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="mb-0">
              Loading booking details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  if (isError || !booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5>Unable to Load Booking</h5>

          <p className="mb-0">
            {error?.data?.message ||
              'Booking details could not be loaded.'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/booking-list')}
        >
          Back to Booking List
        </button>
      </div>
    );
  }
  const isArrived = booking.arrival_status === 'Arrived';
  const handleCancelSeat = (bookingSeatId) => {
    setSelectedBookingSeatId(bookingSeatId);

    showConfirmation(
      'Cancel Seat',
      'Are you sure you want to cancel this seat?',
      async () => {
        try {
          await cancelBookingSeat({
            booking_id: Number(booking_id),
            booking_seat_id: bookingSeatId,
          }).unwrap();

          showMessage(
            'Success',
            'Seat cancelled successfully!',
            'success'
          );

        } catch (error) {
          console.error('Cancel seat error:', error);

          const message = error?.data?.message;

          showMessage(
            'Error',
            Array.isArray(message)
              ? message.join('\n')
              : message || 'Failed to cancel seat.',
            'error'
          );
        }
      }
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!['Confirmed', 'Cancelled'].includes(status)) {
      showMessage(
        'Invalid Status',
        'Please select a valid booking status.',
        'error'
      );
      return;
    }

    showConfirmation(
      'Update Booking',
      status === 'Cancelled' ||
  isArrived
        ? 'Are you sure you want to cancel this booking?'
        : 'Are you sure you want to update this booking status?',
      async () => {
        try {
          await updateBooking({
            booking_id: Number(booking_id),
            status: status,
          }).unwrap();

          showMessage(
            'Success',
            status === 'Cancelled'
              ? 'Booking cancelled successfully!'
              : 'Booking status updated successfully!',
            'success'
          );

        } catch (error) {
          console.error('Update error:', error);

          const message = error?.data?.message;

          showMessage(
            'Error',
            Array.isArray(message)
              ? message.join('\n')
              : message || 'Failed to update booking.',
            'error'
          );
        }
      }
    );
  };

  return (
    <div className="container py-5">

      
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Edit Booking
        </h2>

        <p className="text-muted mb-0">
          View booking information and update its status.
        </p>
      </div>

      
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">
          <h5 className="fw-semibold mb-0">
            Booking Information
          </h5>
        </div>
        {isArrived && (
            <div className="alert alert-warning">
              <i className="bi bi-lock-fill me-2"></i>
              <strong>Booking Locked!</strong>
              <p className="mb-0">
                Customer has already arrived.
                This booking cannot be edited or cancelled.
              </p>
            </div>
          )}
        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Booking ID
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={booking.booking_id ?? booking_id}
                  readOnly
                />
              </div>

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Customer Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={customerName}
                  readOnly
                />
              </div>

              
              <div className="col-12">
              <label className="form-label fw-semibold">
                Booked Seats
              </label>

              {Array.isArray(booking.seats) &&
              booking.seats.length > 0 ? (
                <div className="list-group">
                  {booking.seats.map((seat) => (
                    <div
                      key={seat.booking_seat_id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
            <div className="fw-semibold">
                {seat.seat_name}
              </div>

              <small className="text-muted">
                LKR {seat.ticket_price}
              </small>
            </div>

            {seat.status === 'Cancelled' ? (
              <span className="badge text-bg-secondary">
                Cancelled
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={isCancellingSeat || status === 'Cancelled'}
                onClick={() =>
                  handleCancelSeat(seat.booking_seat_id)
                }
              >
                {isCancellingSeat
                  ? 'Cancelling...'
                  : 'Cancel Seat'}
              </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info mb-0">
                    Seat details are not available.
                    The backend must return a seats array to enable
                    individual seat cancellation.
                  </div>
                )}
              </div>

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Booking Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  readOnly
                />
              </div>

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Total Price (LKR)
                </label>

                <input
                  type="number"
                  className="form-control"
                  value={total}
                  readOnly
                />
              </div>

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Booking Status
                </label>

                <select
                  className="form-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  required
                  disabled={isUpdating}
                >
                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>

            </div>

           
            <div className="d-flex justify-content-end gap-2 mt-4">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/booking-list')}
                disabled={isUpdating}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Update Booking
                  </>
                )}
              </button>

            </div>

          </form>

        </div>
      </div>
     
    <div
      className={`modal fade ${showPopup ? 'show d-block' : ''}`}
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: showPopup
          ? 'rgba(0, 0, 0, 0.5)'
          : 'transparent',
      }}
      aria-modal={showPopup}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {popupTitle}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={closePopup}
            ></button>
          </div>

          
          <div className="modal-body text-center py-4">

            {confirmAction ? (
              <i className="bi bi-question-circle text-warning fs-1 mb-3"></i>
            ) : popupType === 'success' ? (
              <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
            ) : (
              <i className="bi bi-exclamation-circle-fill text-danger fs-1 mb-3"></i>
            )}

            <p className="mb-0 mt-2">
              {popupMessage}
            </p>
          </div>

          
          <div className="modal-footer justify-content-center">

            {confirmAction ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closePopup}
                >
                  No, Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handlePopupConfirm}
                  disabled={isCancellingSeat || isUpdating}
                >
                  Yes, Confirm
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const shouldNavigate =
                    popupTitle === 'Success' &&
                    !confirmAction;

                  closePopup();

                  if (shouldNavigate) {
                    
                    if (popupMessage.includes('Booking')) {
                      navigate('/booking-list');
                    }
                  }
                }}
              >
                OK
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default EditBooking;

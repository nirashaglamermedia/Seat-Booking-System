
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../features/Popup';

import {
  useGetBookingByUserIdQuery,
  useUpdateBookingMutation,
} from '../features/bookingApi';

import { useGetMoviesQuery } from '../features/movieApi';

function ModifiedTicket() {
  const navigate = useNavigate();
  const { booking_id } = useParams();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.user_id;

  const {
    data: movies = [],
    isLoading: isMoviesLoading,
  } = useGetMoviesQuery();

  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useGetBookingByUserIdQuery(userId);

  const [updateBooking, { isLoading: isModifying }] =
    useUpdateBookingMutation();

  const [movieId, setMovieId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [showtimeId, setShowtimeId] = useState('');

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [isSeatsLoading, setIsSeatsLoading] = useState(false);
  const [seatError, setSeatError] = useState('');

  
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('Notice');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [popupAction, setPopupAction] = useState(null);

  const showMessage = (title, message, type = 'info', action = null) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupAction(() => action);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupAction(null);
  };

  const handlePopupConfirm = () => {
    const action = popupAction;
    closePopup();

    if (action) {
      action();
    }
  };

  const booking = bookings.find(
    (item) => Number(item.booking_id) === Number(booking_id)
  );

  
  const currentBookedSeats = booking?.booked_seats
    ? booking.booked_seats
        .split(',')
        .map((seat) => seat.trim())
        .filter((seat) => seat && seat !== 'No seats')
    : [];

  
  const showStartTime = booking?.show_start_datetime
    ? new Date(booking.show_start_datetime)
    : null;

  const isWithin48Hours = showStartTime
    ? Date.now() >=
      showStartTime.getTime() - 48 * 60 * 60 * 1000
    : false;

  
  const uniqueMovies = [
    ...new Map(
      movies.map((movie) => [movie.movie_id, movie])
    ).values(),
  ];

  
  const selectedShowtimes = movies.filter(
    (movie) =>
      Number(movie.movie_id) === Number(movieId) &&
      movie.showtime_id !== null
  );

  
  useEffect(() => {
    if (!booking) return;

    setMovieId(String(booking.movie_id || ''));
    setShowtimeId(String(booking.showtime_id || ''));

    setVisitDate(
      String(booking.visit_date || '').slice(0, 10)
    );

    setSelectedSeat(currentBookedSeats);
  }, [booking_id, booking?.booking_id]);

  
  useEffect(() => {
    if (!showtimeId || !visitDate || !booking) {
      setSeats([]);
      return;
    }

    const controller = new AbortController();

    const fetchAvailableSeats = async () => {
      try {
        setIsSeatsLoading(true);
        setSeatError('');

        const params = new URLSearchParams({
          showtime_id: showtimeId,
          visit_date: visitDate,
          exclude_booking_id: booking_id,
        });

        const response = await fetch(
          `http://localhost:3001/seats/availability?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load available seats');
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        setSeats(data);

        
        setSelectedSeat((previous) =>
          previous.filter((seatName) =>
            data.some(
              (seat) =>
                `${seat.row_name}${seat.seat_number}` === seatName &&
                seat.status === 'Available'
            )
          )
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Seat loading error:', error);
          setSeatError('Unable to load seats. Please try again.');
          setSeats([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSeatsLoading(false);
        }
      }
    };

    fetchAvailableSeats();

    return () => controller.abort();
  }, [showtimeId, visitDate, booking_id, booking]);

  
  const handleSeat = (seatName) => {
    const seat = seats.find(
      (item) =>
        `${item.row_name}${item.seat_number}` === seatName
    );

    if (!seat || seat.status === 'Booked') {
      showMessage(
        'Seat Unavailable',
        'This seat is already booked by another customer.',
        'warning'
      );
      return;
    }

    setSelectedSeat((previous) => {
      if (previous.includes(seatName)) {
        return previous.filter((item) => item !== seatName);
      }

      return [...previous, seatName];
    });
  };

  
  const selectedSeatDetails = selectedSeat
    .map((seatName) =>
      seats.find(
        (seat) =>
          `${seat.row_name}${seat.seat_number}` === seatName
      )
    )
    .filter(Boolean);

  
  const subtotal = selectedSeatDetails.reduce(
    (total, seat) => total + Number(seat.price || 0),
    0
  );

  
  const seatDiscount = selectedSeatDetails.reduce(
    (total, seat, index) => {
      if ((index + 1) % 3 !== 0) return total;

      return total + Number(seat.price || 0) * 0.5;
    },
    0
  );

  const totalPrice = subtotal - seatDiscount;

  
  const handleModifyBooking = async () => {
    if (!movieId || !visitDate || !showtimeId) {
      showMessage(
        'Missing Details',
        'Please select Movie, Visit Date and Showtime.',
        'warning'
      );
      return;
    }

    if (selectedSeat.length === 0) {
      showMessage(
        'No Seats Selected',
        'Please select at least one seat.',
        'warning'
      );
      return;
    }

    if (isWithin48Hours) {
      showMessage(
        'Modification Not Allowed',
        'You cannot modify this booking within 48 hours of the show.',
        'warning'
      );
      return;
    }

    
    const selectedSeatIds = selectedSeat.map((seatName) => {
      const seat = seats.find(
        (item) =>
          `${item.row_name}${item.seat_number}` === seatName
      );

      return seat ? Number(seat.seat_id) : null;
    });

    
    if (
      selectedSeatIds.some((seatId) => seatId === null) ||
      selectedSeatIds.length !== selectedSeat.length
    ) {
      showMessage(
        'Seat Error',
        'Some selected seats are unavailable. Please reload seats.',
        'error'
      );
      return;
    }

    try {
      await updateBooking({
        booking_id: Number(booking_id),
        showtime_id: Number(showtimeId),
        visit_date: visitDate,
        selected_seats: selectedSeatIds,
      }).unwrap();

      showMessage(
        'Success',
        'Your booking has been updated successfully!',
        'success',
        () => navigate('/my-booking')
      );
    } catch (error) {
      console.error('Booking modification error:', error);

      const errorMessage =
        error?.data?.message ||
        error?.error ||
        'Booking modification failed. Please try again.';

      showMessage(
        'Modification Failed',
        Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage,
        'error'
      );
    }
  };

 
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  
  if (isError || !booking) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-danger">Booking not found!</h5>

        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/my-booking')}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '750px' }}
      >
        <div className="card-header bg-dark text-white text-center py-3">
          <h3 className="mb-0">Modify Cinema Ticket</h3>
        </div>

        <div className="card-body p-4">

          {/* Booking ID */}
          <div className="row mb-3">
            <div className="col-5 text-muted">Booking ID</div>

            <div className="col-7 fw-bold">
              {booking.booking_id}
            </div>
          </div>

          {/* Movie */}
          <div className="row mb-3">
            <label className="col-5 text-muted">
              Movie Name
            </label>

            <div className="col-7">
              <select
                className="form-select"
                value={movieId}
                disabled={isMoviesLoading}
                onChange={(e) => {
                  setMovieId(e.target.value);
                  setShowtimeId('');
                }}
              >
                <option value="">Select Movie</option>

                {uniqueMovies.map((movie) => (
                  <option
                    key={movie.movie_id}
                    value={movie.movie_id}
                  >
                    {movie.movie_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visit Date */}
          <div className="row mb-3">
            <label className="col-5 text-muted">
              Visit Date
            </label>

            <div className="col-7">
              <input
                type="date"
                className="form-control"
                value={visitDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setVisitDate(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Showtime */}
          <div className="row mb-3">
            <label className="col-5 text-muted">
              Showtime
            </label>

            <div className="col-7">
              <select
                className="form-select"
                value={showtimeId}
                disabled={!movieId}
                onChange={(e) => {
                  setShowtimeId(e.target.value);
                }}
              >
                <option value="">Select Showtime</option>

                {selectedShowtimes.map((showtime) => (
                  <option
                    key={showtime.showtime_id}
                    value={showtime.showtime_id}
                  >
                    {String(showtime.start_time).slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr />

          
          <h5 className="text-center mb-3">
            Select Your Seats
          </h5>

          <div className="text-center bg-secondary text-white rounded py-2 mb-4">
            SCREEN
          </div>

          {isSeatsLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary"></div>
              <p>Loading seats...</p>
            </div>
          ) : seatError ? (
            <div className="alert alert-danger text-center">
              {seatError}
            </div>
          ) : seats.length === 0 ? (
            <p className="text-center text-muted">
              Select a visit date and showtime to see available seats.
            </p>
          ) : (
            <>
              {[...new Set(seats.map((seat) => seat.row_name))]
                .sort()
                .map((rowName) => (
                  <div
                    key={rowName}
                    className="d-flex justify-content-center align-items-center gap-2 mb-3"
                  >
                    <strong style={{ width: '25px' }}>
                      {rowName}
                    </strong>

                    {seats
                      .filter((seat) => seat.row_name === rowName)
                      .sort(
                        (a, b) =>
                          Number(a.seat_number) -
                          Number(b.seat_number)
                      )
                      .map((seat) => {
                        const seatName =
                          `${seat.row_name}${seat.seat_number}`;

                        const isSelected =
                          selectedSeat.includes(seatName);

                        const isBooked =
                          seat.status === 'Booked';

                        return (
                          <button
                            key={seat.seat_id}
                            type="button"
                            disabled={isBooked || isSeatsLoading}
                            onClick={() => handleSeat(seatName)}
                            className={`btn btn-sm ${
                              isBooked
                                ? 'btn-danger'
                                : isSelected
                                ? 'btn-success'
                                : 'btn-outline-primary'
                            }`}
                            style={{
                              width: '42px',
                              height: '38px',
                            }}
                            title={seatName}
                          >
                            {seatName}
                          </button>
                        );
                      })}
                  </div>
                ))}

              
              <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
                <span>
                  <span className="badge bg-light border border-primary me-1">
                    &nbsp;
                  </span>
                  Available
                </span>

                <span>
                  <span className="badge bg-success me-1">
                    &nbsp;
                  </span>
                  Selected
                </span>

                <span>
                  <span className="badge bg-danger me-1">
                    &nbsp;
                  </span>
                  Booked
                </span>
              </div>
            </>
          )}

          <hr />

          
          <div className="mb-3">
            <strong>Selected Seats: </strong>

            {selectedSeat.length > 0
              ? selectedSeat.join(', ')
              : 'No seats selected'}
          </div>

          
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Seat Discount</span>

            <span className="text-success">
              - Rs. {seatDiscount.toFixed(2)}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <strong>Total Price</strong>

            <h4 className="text-success mb-0">
              Rs. {totalPrice.toFixed(2)}
            </h4>
          </div>

          <small className="text-muted d-block mt-2">
            Final price will be calculated and verified by the server.
          </small>

          {isWithin48Hours && (
            <div className="alert alert-warning mt-3 mb-0">
              This booking cannot be modified because the show starts
              within 48 hours.
            </div>
          )}

         
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/my-booking')}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-warning"
              onClick={handleModifyBooking}
              disabled={
                isModifying ||
                isWithin48Hours ||
                isSeatsLoading ||
                seats.length === 0 ||
                selectedSeat.length === 0
              }
            >
              {isModifying ? 'Modifying...' : 'Modify Booking'}
            </button>
          </div>
        </div>
      </div>

      
      <Popup
        show={showPopup}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={closePopup}
        onConfirm={popupAction ? handlePopupConfirm : null}
        confirmText="OK"
        cancelText="Cancel"
      />
    </div>
  );
}

export default ModifiedTicket;

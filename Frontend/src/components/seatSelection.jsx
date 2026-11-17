
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useGetMembershipsQuery } from "../features/membershipApi";

const socket = io("http://localhost:3001");

function SeatSelection() {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("Notice");

  const navigate = useNavigate();
  const location = useLocation();

  const {
    movie_id,
    movie_name,
    showtime_id,
    show_date,
    start_time,
  } = location.state || {};

  const isLoggedIn =
    !!localStorage.getItem("access_token") &&
    !!localStorage.getItem("user");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCustomer = isLoggedIn && user.role === "User";

  // Membership hook
  const { data: memberships = [] } = useGetMembershipsQuery();

  const membership = memberships.find(
    (item) => Number(item.user_id) === Number(user.user_id)
  );

  const isActiveMember = membership?.status === "Active";
  const maxSeats = isActiveMember ? 10 : 5;

  // Fetch seats and listen for real-time updates
  useEffect(() => {
    if (!showtime_id || !show_date) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchSeats() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:3001/seats/availability?showtime_id=${showtime_id}&visit_date=${show_date}`
        );

        if (!response.ok) {
          throw new Error("Failed to load seats");
        }

        const data = await response.json();

        if (isMounted) {
          setSeats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Backend error. Could not load seats.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const handleSeatSelected = (data) => {
      if (
        Number(data.showtime_id) !== Number(showtime_id) ||
        data.visit_date !== show_date
      ) {
        return;
      }

      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          Number(seat.seat_id) === Number(data.seat_id)
            ? { ...seat, temporaryStatus: "Selected" }
            : seat
        )
      );
    };

    const handleSeatUnselected = (data) => {
      if (
        Number(data.showtime_id) !== Number(showtime_id) ||
        data.visit_date !== show_date
      ) {
        return;
      }

      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          Number(seat.seat_id) === Number(data.seat_id)
            ? { ...seat, temporaryStatus: null }
            : seat
        )
      );
    };

    const handleSeatUpdated = (data) => {
      if (
        Number(data.showtime_id) !== Number(showtime_id) ||
        data.visit_date !== show_date
      ) {
        return;
      }

      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          Number(seat.seat_id) === Number(data.seat_id)
            ? {
                ...seat,
                status: data.status,
                temporaryStatus: null,
              }
            : seat
        )
      );
    };

    socket.on("seatSelected", handleSeatSelected);
    socket.on("seatUnselected", handleSeatUnselected);
    socket.on("seatUpdated", handleSeatUpdated);

    fetchSeats();

    return () => {
      isMounted = false;

      socket.off("seatSelected", handleSeatSelected);
      socket.off("seatUnselected", handleSeatUnselected);
      socket.off("seatUpdated", handleSeatUpdated);
    };
  }, [showtime_id, show_date]);

  function showMessage(title, message) {
    setPopupTitle(title);
    setPopupMessage(message);
    setShowPopup(true);
  }

  function handleSeat(seatName) {
    const seat = seats.find(
      (item) =>
        `${item.row_name}${item.seat_number}` === seatName
    );

    if (!seat || seat.status === "Booked") {
      return;
    }

    // Unselect already selected seat
    if (selectedSeat.includes(seatName)) {
      setSelectedSeat((prev) =>
        prev.filter((item) => item !== seatName)
      );

      socket.emit("unselectSeat", {
        seat_id: seat.seat_id,
        showtime_id: Number(showtime_id),
        visit_date: show_date,
      });

      return;
    }

    // Check maximum seat limit
    if (selectedSeat.length >= maxSeats) {
      showMessage(
        "Seat Selection",
        `You can select a maximum of ${maxSeats} seats per booking!`
      );
      return;
    }

    // Check temporary selection by another customer
    if (seat.temporaryStatus === "Selected") {
      showMessage(
        "Seat Selection",
        "This seat is temporarily selected by another customer!"
      );
      return;
    }

    setSelectedSeat((prev) => [...prev, seatName]);

    socket.emit("selectSeat", {
      seat_id: seat.seat_id,
      showtime_id: Number(showtime_id),
      visit_date: show_date,
    });
  }

  function CalculationSeatPrice(seatName) {
    const seat = seats.find(
      (item) =>
        `${item.row_name}${item.seat_number}` === seatName
    );

    return seat ? Number(seat.price) : 0;
  }

  function handleBooking() {
    if (selectedSeat.length === 0) {
      showMessage(
        "Booking Message",
        "Please select at least one seat!"
      );
      return;
    }

    const subtotal = selectedSeat.reduce((total, seatName) => {
      return total + CalculationSeatPrice(seatName);
    }, 0);

    // 50% discount for every third seat
    const seatDiscount = selectedSeat.reduce(
      (total, seatName, index) => {
        const price = CalculationSeatPrice(seatName);

        if ((index + 1) % 3 === 0) {
          return total + price * 0.5;
        }

        return total;
      },
      0
    );

    // Membership discount
    const membershipDiscount = isActiveMember
      ? (subtotal - seatDiscount) * 0.05
      : 0;

    const discount = seatDiscount + membershipDiscount;
    const total = subtotal - discount;

    // Save booking details
    localStorage.setItem(
      "selectedSeats",
      JSON.stringify(selectedSeat)
    );

    localStorage.setItem("subtotal", subtotal.toString());
    localStorage.setItem("discount", discount.toString());
    localStorage.setItem("totalPrice", total.toString());

    // Save selected movie and visit details
    
    localStorage.setItem("movie_id", String(movie_id));
    localStorage.setItem("movie_name", movie_name);
    localStorage.setItem("showtime_id", String(showtime_id));
    localStorage.setItem("visit_date", show_date);
    localStorage.setItem("start_time", start_time);

    if (isLoggedIn) {
      navigate("/booking");
    } else {
      navigate("/register");
    }
  }

  // All hooks are called before this conditional return
  if (!showtime_id || !show_date) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please select a movie and visit date first.
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundImage: 'url("/src/assets/cinema-visit.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="text-center mb-4 position-relative p-3">
        <h1 className="fw-bold">
          Cinema Seat Booking System
        </h1>

        <p className="text-secondary">
          Book your favorite cinema seats
        </p>

        <div className="text-center">
          <h5>{movie_name}</h5>
          <p className="mb-1">Date: {show_date}</p>
          <p>Showtime: {start_time}</p>
        </div>

        <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
          {isCustomer && !isActiveMember && (
            <button
              className="btn btn-warning fw-bold"
              onClick={() => navigate("/cinema-club")}
            >
              <i className="bi bi-star-fill me-2"></i>
              Join Cinema Club
            </button>
          )}

          {!isLoggedIn && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                Guest
              </button>

              
            </>
          )}
        </div>
      </header>

      <div
        className="card p-4 shadow-sm mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <div className="text-center mb-4">
          <h5 className="bg-secondary text-white p-2 rounded">
            SCREEN
          </h5>
        </div>

        <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
          <span>
            <span className="badge bg-outline-primary border border-primary text-primary">
              &nbsp;&nbsp;
            </span>{" "}
            Available
          </span>

          <span>
            <span className="badge bg-success">&nbsp;&nbsp;</span>{" "}
            Selected
          </span>

          <span>
            <span className="badge bg-danger">&nbsp;&nbsp;</span>{" "}
            Booked
          </span>
        </div>

        <div className="text-center">
          {loading && <p>Loading seats...</p>}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {!loading && !error && seats.length === 0 && (
            <p>No seats available.</p>
          )}

          {!loading &&
            !error &&
            Object.entries(
              seats.reduce((groups, seat) => {
                if (!groups[seat.row_name]) {
                  groups[seat.row_name] = [];
                }

                groups[seat.row_name].push(seat);
                return groups;
              }, {})
            )
              .sort(([rowA], [rowB]) =>
                rowA.localeCompare(rowB)
              )
              .map(([rowName, rowSeats]) => (
                <div
                  className="d-flex justify-content-center gap-2 mb-2"
                  key={rowName}
                >
                  {rowSeats
                    .sort(
                      (a, b) =>
                        Number(a.seat_number) -
                        Number(b.seat_number)
                    )
                    .map((item) => {
                      const seatName =
                        `${item.row_name}${item.seat_number}`;

                      return (
                        <button
                          className={
                            item.status === "Booked"
                              ? "btn btn-danger"
                              : selectedSeat.includes(seatName) ||
                                item.temporaryStatus === "Selected"
                              ? "btn btn-success"
                              : "btn btn-outline-primary"
                          }
                          key={item.seat_id}
                          type="button"
                          disabled={
                            item.status === "Booked" ||
                            (item.temporaryStatus === "Selected" &&
                              !selectedSeat.includes(seatName))
                          }
                          onClick={() => handleSeat(seatName)}
                          title={item.status}
                        >
                          {seatName}
                        </button>
                      );
                    })}
                </div>
              ))}
        </div>

        <hr />

        <p>
          <strong>Selected Seats:</strong>{" "}
          {selectedSeat.length > 0
            ? selectedSeat.join(", ")
            : "None"}
        </p>

        <p>
          <strong>Total Seats Selected:</strong>{" "}
          {selectedSeat.length}
        </p>

        {(() => {
          const subtotal = selectedSeat.reduce(
            (total, seat) =>
              total + CalculationSeatPrice(seat),
            0
          );

          const seatDiscount = selectedSeat.reduce(
            (total, seat, index) => {
              const price = CalculationSeatPrice(seat);

              return (index + 1) % 3 === 0
                ? total + price * 0.5
                : total;
            },
            0
          );

          const membershipDiscount = isActiveMember
            ? (subtotal - seatDiscount) * 0.05
            : 0;

          const discount =
            seatDiscount + membershipDiscount;

          const total = subtotal - discount;

          return (
            <div className="border rounded p-3 mb-3 text-start">
              <p>
                <strong>Subtotal:</strong>{" "}
                Rs. {subtotal.toLocaleString()}
              </p>

              <p className="text-success">
                <strong>Discount:</strong>{" "}
                - Rs. {discount.toLocaleString()}
              </p>

              <h5>
                <strong>Total Price:</strong>{" "}
                Rs. {total.toLocaleString()}
              </h5>
            </div>
          );
        })()}

        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleBooking}
        >
          Book Now
        </button>
      </div>

      {showPopup && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {popupTitle}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPopup(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p className="mb-0">{popupMessage}</p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
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

export default SeatSelection;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useGetMembershipsQuery } from "../features/membershipApi";

const socket = io("http://localhost:3001");

const styles = `
.ss { background:#f2f2f2; min-height:100vh; padding-bottom:3rem; }

/* top bar */
.ss-nav {
  background:#333545; color:#fff; padding:12px 32px;
  display:flex; align-items:center; justify-content:space-between;
  gap:16px; flex-wrap:wrap; position:sticky; top:0; z-index:10;
}
.ss-logo { font-size:1.5rem; font-weight:800; letter-spacing:-0.5px; }
.ss-logo span { color:#f84464; }
.ss-movie { font-weight:700; font-size:1.15rem; margin:0; }
.ss-meta { font-size:.85rem; opacity:.75; margin:0; }

.ss-guest { border:1px solid #fff; color:#fff; background:transparent; }
.ss-guest:hover { background:#fff; color:#333545; }

/* cards */
.ss-card {
  background:#fff; border-radius:14px; padding:24px;
  box-shadow:0 4px 16px rgba(0,0,0,.08);
}

/* legend */
.ss-swatch {
  display:inline-block; width:18px; height:18px; border-radius:4px;
  vertical-align:middle;
}
.ss-swatch.available { border:2px solid #1ea83c; background:#fff; }
.ss-swatch.selected { background:#1ea83c; border:2px solid #1ea83c; }
.ss-swatch.booked { background:#d5d5d5; border:2px solid #d5d5d5; }

/* seats: keep original Bootstrap classes, restyle them */
.ss-seats { overflow-x:auto; padding:8px 0; }
.ss-row { display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:8px; }
.ss-rowname { width:24px; font-weight:700; color:#888; font-size:.85rem; }
.ss-seats .btn {
  min-width:40px; height:36px; padding:0; font-size:.75rem; font-weight:600;
  border-radius:6px; transition:transform .1s;
}
.ss-seats .btn-outline-primary { color:#1ea83c; border:1.5px solid #1ea83c; background:#fff; }
.ss-seats .btn-outline-primary:hover { background:#1ea83c; color:#fff; transform:scale(1.08); }
.ss-seats .btn-success { background:#1ea83c; border:1.5px solid #1ea83c; color:#fff; }
.ss-seats .btn-danger { background:#d5d5d5; border:1.5px solid #d5d5d5; color:#999; }
.ss-seats .btn:disabled { cursor:not-allowed; }
.ss-seats .btn:focus-visible, .ss-book:focus-visible { outline:3px solid #f84464; outline-offset:2px; }

/* screen at the bottom, like BookMyShow */
.ss-screen-wrap { margin-top:28px; text-align:center; }
.ss-screen {
  height:10px; width:70%; margin:0 auto;
  background:linear-gradient(#cfcfcf,#eee);
  border-radius:50% 50% 0 0 / 100% 100% 0 0;
  box-shadow:0 -8px 18px rgba(248,68,100,.25);
}
.ss-screen-text { font-size:.75rem; color:#999; letter-spacing:.15em; margin-top:8px; }

/* summary */
.ss-summary-title { font-weight:700; margin-bottom:14px; }
.ss-line { display:flex; justify-content:space-between; margin-bottom:8px; }
.ss-total {
  display:flex; justify-content:space-between; font-weight:800; font-size:1.2rem;
  border-top:2px dashed #ddd; padding-top:12px; margin-top:12px;
}
.ss-chip {
  display:inline-block; background:#fff0f3; color:#f84464; font-weight:600;
  border-radius:6px; padding:2px 10px; margin:0 6px 6px 0; font-size:.85rem;
}

.ss-book {
  background:#f84464; color:#fff; border:0; font-weight:700;
  padding:.8rem; border-radius:10px; font-size:1.05rem; transition:background .2s;
}
.ss-book:hover { background:#d9304f; color:#fff; }

.ss .modal-content { border:0; border-radius:14px; }
.ss .modal-title { font-weight:700; }
`;

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

  
  const { data: memberships = [] } = useGetMembershipsQuery();

  const membership = memberships.find(
    (item) => Number(item.user_id) === Number(user.user_id)
  );

  const isActiveMember = membership?.status === "Active";
  const maxSeats = isActiveMember ? 10 : 5;

  
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

    
    if (selectedSeat.length >= maxSeats) {
      showMessage(
        "Seat Selection",
        `You can select a maximum of ${maxSeats} seats per booking!`
      );
      return;
    }

    
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

    
    const membershipDiscount = isActiveMember
      ? (subtotal - seatDiscount) * 0.05
      : 0;

    const discount = seatDiscount + membershipDiscount;
    const total = subtotal - discount;

    localStorage.setItem(
      "selectedSeats",
      JSON.stringify(selectedSeat)
    );

    localStorage.setItem("subtotal", subtotal.toString());
    localStorage.setItem("discount", discount.toString());
    localStorage.setItem("totalPrice", total.toString());

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

  
  const subtotal = selectedSeat.reduce(
    (total, seat) => total + CalculationSeatPrice(seat),
    0
  );

  const seatDiscount = selectedSeat.reduce((total, seat, index) => {
    const price = CalculationSeatPrice(seat);

    return (index + 1) % 3 === 0 ? total + price * 0.5 : total;
  }, 0);

  const membershipDiscount = isActiveMember
    ? (subtotal - seatDiscount) * 0.05
    : 0;

  const discount = seatDiscount + membershipDiscount;
  const total = subtotal - discount;

  return (
    <div className="ss">
      <style>{styles}</style>

      
      <div className="ss-nav">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          <div className="ss-logo">
            cinema<span>seat</span>
          </div>

          <div>
            <p className="ss-movie">{movie_name}</p>
            <p className="ss-meta">
              {show_date} &nbsp;|&nbsp; {start_time}
            </p>
          </div>
        </div>

        <div className="d-flex gap-2">
          {isCustomer && !isActiveMember && (
            <button
              className="btn btn-warning btn-sm fw-bold"
              onClick={() => navigate("/cinema-club")}
            >
              <i className="bi bi-star-fill me-2"></i>
              Join Cinema Club
            </button>
          )}

          {!isLoggedIn && (
            <button
              className="btn btn-sm ss-guest"
              onClick={() => navigate("/login")}
            >
              Guest
            </button>
          )}
        </div>
      </div>

      <div className="container mt-4">
        <div className="row g-4">
          
          <div className="col-lg-8">
            <div className="ss-card">
              <div className="d-flex justify-content-center gap-4 mb-3 flex-wrap">
                <span>
                  <span className="ss-swatch available"></span>{" "}
                  Available
                </span>

                <span>
                  <span className="ss-swatch selected"></span>{" "}
                  Selected
                </span>

                <span>
                  <span className="ss-swatch booked"></span>{" "}
                  Booked
                </span>
              </div>

              <hr />

              <div className="ss-seats">
                {loading && <p className="text-center">Loading seats...</p>}

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                {!loading && !error && seats.length === 0 && (
                  <p className="text-center">No seats available.</p>
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
                      <div className="ss-row" key={rowName}>
                        <span className="ss-rowname">{rowName}</span>

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

              <div className="ss-screen-wrap">
                <div className="ss-screen"></div>
                <div className="ss-screen-text">ALL EYES THIS WAY PLEASE</div>
              </div>
            </div>
          </div>

          
          <div className="col-lg-4">
            <div className="ss-card">
              <div className="ss-summary-title">
                <i className="bi bi-ticket-perforated me-2 text-danger"></i>
                Booking Summary
              </div>

              <div className="mb-3">
                {selectedSeat.length > 0 ? (
                  selectedSeat.map((seat) => (
                    <span className="ss-chip" key={seat}>
                      {seat}
                    </span>
                  ))
                ) : (
                  <span className="text-secondary">No seats selected</span>
                )}
              </div>

              <div className="ss-line">
                <span>Seats</span>
                <strong>{selectedSeat.length}</strong>
              </div>

              <div className="ss-line">
                <span>Subtotal</span>
                <strong>Rs. {subtotal.toLocaleString()}</strong>
              </div>

              <div className="ss-line text-success">
                <span>Discount</span>
                <strong>- Rs. {discount.toLocaleString()}</strong>
              </div>

              <div className="ss-total">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>

              <button
                type="button"
                className="btn ss-book w-100 mt-4"
                onClick={handleBooking}
              >
                Book Now
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
                  className="btn ss-book"
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
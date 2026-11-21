import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMoviesQuery } from '../features/movieApi';

function Home() {
  const navigate = useNavigate();

  const {
    data: movies = [],
    isLoading,
    isError,
  } = useGetMoviesQuery();

  const activeMovies = movies.filter(
    (movie) => movie.status === "Active"
  );
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
        <p className="mt-2">Loading movies...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger m-4">
        Failed to load movies. Please try again.
      </div>
    );
  }

  return (
    <div className="bms-page">
      <style>{`
        .bms-page { background:#f2f2f2; min-height:100vh; }

        /* top bar */
        .bms-nav {
          background:#333545; color:#fff;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 32px; position:sticky; top:0; z-index:10;
        }
        .bms-logo { font-size:1.5rem; font-weight:800; letter-spacing:-0.5px; }
        .bms-logo span { color:#f84464; }

        /* hero */
        .bms-hero {
          background:linear-gradient(120deg,#1f2030 0%,#3a1c3f 55%,#f84464 140%);
          color:#fff; padding:64px 24px; text-align:center;
        }
        .bms-hero h1 { font-weight:800; font-size:2.6rem; }
        .bms-hero p { opacity:.8; margin:0; }

        /* section heading */
        .bms-title { font-weight:700; font-size:1.5rem; margin:36px 0 18px; }
        .bms-title::after {
          content:''; display:block; width:44px; height:4px;
          background:#f84464; border-radius:4px; margin-top:6px;
        }

        /* movie card */
        .bms-card {
          background:transparent; cursor:pointer; height:100%;
          transition:transform .2s ease;
        }
        .bms-card:hover { transform:translateY(-6px); }
        .bms-poster {
          position:relative; border-radius:12px; overflow:hidden;
          aspect-ratio:2/3; box-shadow:0 6px 16px rgba(0,0,0,.15);
        }
        .bms-poster img { width:100%; height:100%; object-fit:cover; }
        .bms-badge {
          position:absolute; left:0; right:0; bottom:0;
          background:linear-gradient(transparent,rgba(0,0,0,.9));
          color:#fff; padding:28px 12px 10px; font-size:.85rem;
        }
        .bms-name { font-weight:700; margin:12px 0 4px; font-size:1.05rem; }
        .bms-desc {
          color:#6b6b6b; font-size:.85rem; margin-bottom:10px;
          display:-webkit-box; -webkit-line-clamp:2;
          -webkit-box-orient:vertical; overflow:hidden;
        }
        .bms-btn {
          background:#f84464; color:#fff; border:none; width:100%;
          padding:9px; border-radius:8px; font-weight:600;
          transition:background .2s;
        }
        .bms-btn:hover { background:#d9304f; }

        /* offers */
        .bms-offer {
          background:#fff; border-radius:12px; padding:20px; height:100%;
          border-left:5px solid #f84464; box-shadow:0 2px 8px rgba(0,0,0,.06);
          display:flex; gap:14px; align-items:flex-start;
        }
        .bms-offer i { color:#f84464; font-size:1.8rem; }

        /* why us */
        .bms-why { background:#fff; margin-top:48px; padding:48px 0; }
        .bms-why i { color:#f84464; font-size:2.2rem; }
      `}</style>

      {/* TOP BAR */}
      <div className="bms-nav">
        <div className="bms-logo">
          NJ<span>Cinema</span>
        </div>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate('/adminLogin')}
        >
          <i className="bi bi-person-lock me-2"></i>
          Admin
        </button>
      </div>

      {/* HERO */}
      <div className="bms-hero">
        <h1>Welcome to Cinema Seat Booking</h1>
        <p className="mt-3">Book your favourite movies easily.</p>
      </div>

      <div className="container pb-4">
        {/* OFFERS */}
        <h2 className="bms-title">Offers For You</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="bms-offer">
              <i className="bi bi-ticket-perforated-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">3rd Seat Discount</h6>
                <small className="text-secondary">
                  Buy 2 seats and get 50% OFF on your 3rd seat.
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bms-offer">
              <i className="bi bi-ticket-detailed-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">Coupon Code Discount</h6>
                <small className="text-secondary">
                  Apply a valid coupon code and enjoy 10% OFF.
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="bms-offer">
              <i className="bi bi-star-fill"></i>
              <div>
                <h6 className="fw-bold mb-1">Cinema Club Membership</h6>
                <small className="text-secondary">
                  Cinema Club members receive an exclusive 5% OFF.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* MOVIES */}
        <h2 className="bms-title">Now Showing</h2>
        <div className="row g-4">
          {activeMovies.map((movie) => (
            <div className="col-6 col-md-4 col-lg-3" key={movie.movie_id}>
              <div
                className="bms-card"
                onClick={() =>
                  navigate(
                    `/movie-page/${encodeURIComponent(movie.movie_name)}`,
                    {
                      state: {
                        movie_id: movie.movie_id,
                      },
                    }
                  )
                }
              >
                <div className="bms-poster">
                  <img
                    src={
                      movie.poster_url?.trim()
                        ? movie.poster_url
                        : '/default-movie.jpg'
                    }
                    alt={movie.movie_name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/default-movie.jpg';
                    }}
                  />
                  <div className="bms-badge">
                    <i className="bi bi-clock me-2"></i>
                    {movie.duration_minutes} minutes
                  </div>
                </div>

                <div className="bms-name">{movie.movie_name}</div>
                <div className="bms-desc">{movie.description}</div>

                <button
                  className="bms-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/movie-page/${encodeURIComponent(movie.movie_name)}`,
                      {
                        state: {
                          movie_id: movie.movie_id,
                        },
                      }
                    );
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="bms-why">
        <div className="container">
          <h2 className="fw-bold text-center mb-4">Why Choose Us?</h2>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <i className="bi bi-ticket-perforated"></i>
              <h5 className="fw-bold mt-3">Easy Booking</h5>
              <p className="text-secondary">
                Book your movie tickets online easily.
              </p>
            </div>

            <div className="col-md-4">
              <i className="bi bi-grid-3x3-gap"></i>
              <h5 className="fw-bold mt-3">Seat Selection & Discounts</h5>
              <p className="text-secondary">
                Select your preferred seats and enjoy special discounts.
              </p>
            </div>

            <div className="col-md-4">
              <i className="bi bi-calendar-check"></i>
              <h5 className="fw-bold mt-3">Flexible Scheduling</h5>
              <p className="text-secondary">
                Choose a suitable date and showtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
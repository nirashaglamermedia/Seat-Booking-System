import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMovieByNameQuery } from '../features/movieApi';

const styles = `
.mp { background:#f2f2f2; min-height:100vh; }

/* top bar */
.mp-nav {
  background:#333545; color:#fff; padding:14px 32px;
  display:flex; align-items:center; justify-content:space-between;
  position:sticky; top:0; z-index:10;
}
.mp-logo { font-size:1.5rem; font-weight:800; letter-spacing:-0.5px; }
.mp-logo span { color:#f84464; }

/* hero with blurred poster backdrop */
.mp-hero { position:relative; color:#fff; overflow:hidden; background:#1f2030; }
.mp-hero-bg {
  position:absolute; inset:0; background-size:cover; background-position:center;
  filter:blur(22px) brightness(.35); transform:scale(1.15);
}
.mp-hero-inner { position:relative; padding:40px 0; }
.mp-poster {
  width:100%; max-width:300px; aspect-ratio:2/3; object-fit:cover;
  border-radius:14px; box-shadow:0 12px 30px rgba(0,0,0,.5);
}
.mp-chip {
  display:inline-block; background:rgba(255,255,255,.15);
  padding:6px 14px; border-radius:20px; font-size:.9rem; margin-top:8px;
}
.mp-desc { opacity:.85; max-width:620px; text-align:justify; margin-top:18px; }

/* booking card */
.mp-book {
  background:#fff; border-radius:14px; padding:28px;
  box-shadow:0 4px 16px rgba(0,0,0,.08); margin-top:-30px;
  position:relative; z-index:2;
}
.mp-label { font-weight:700; margin-bottom:10px; }
.mp-book .form-control { border-radius:8px; max-width:280px; }
.mp-book .form-control:focus {
  border-color:#f84464; box-shadow:0 0 0 3px rgba(248,68,100,.2);
}

.mp-pill {
  border:1.5px solid #f84464; color:#f84464; background:#fff;
  padding:8px 20px; border-radius:8px; font-weight:600; transition:all .15s;
}
.mp-pill:hover { background:#fff0f3; }
.mp-pill.active { background:#f84464; color:#fff; }

.mp-select {
  background:#f84464; color:#fff; border:none; width:100%;
  padding:12px; border-radius:10px; font-weight:700; font-size:1.05rem;
  transition:background .2s;
}
.mp-select:hover { background:#d9304f; }
`;

function MoviePage() {
  const { movie_name } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  const max = maxDate.toISOString().split("T")[0];
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const {
    data: movie,
    isLoading,
    isError,
  } = useGetMovieByNameQuery(movie_name);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
        <p>Loading movie...</p>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="alert alert-danger m-4">
        Movie details not found.
      </div>
    );
  }

  const posterSrc = movie.poster_url?.trim()
    ? movie.poster_url
    : '/default-movie.jpg';

  return (
    <div className="mp">
      <style>{styles}</style>

      {/* TOP BAR */}
      <div className="mp-nav">
        <div className="mp-logo">
          cinema<span>seat</span>
        </div>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate("/")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Home
        </button>
      </div>

      {/* HERO */}
      <div className="mp-hero">
        <div
          className="mp-hero-bg"
          style={{ backgroundImage: `url(${posterSrc})` }}
        ></div>

        <div className="container mp-hero-inner">
          <div className="row align-items-center g-4">
            <div className="col-md-4 text-center">
              <img
                src={posterSrc}
                alt={movie.movie_name}
                className="mp-poster"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/default-movie.jpg';
                }}
              />
            </div>

            <div className="col-md-8">
              <h1 className="fw-bold">{movie.movie_name}</h1>

              <span className="mp-chip">
                <i className="bi bi-clock me-2"></i>
                {movie.duration_minutes} minutes
              </span>

              <p className="mp-desc">{movie.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING CARD */}
      <div className="container pb-5">
        <div className="mp-book">
          <div className="mp-label">
            <i className="bi bi-calendar-event me-2 text-danger"></i>
            Select Date
          </div>

          <input
            type="date"
            className="form-control"
            min={today}
            max={max}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedShowtime(null);
            }}
          />

          <hr className="my-4" />

          <div className="mp-label">
            <i className="bi bi-clock-history me-2 text-danger"></i>
            Select Showtime
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {movie.show_time && (
              <button
                type="button"
                className={`mp-pill ${selectedShowtime ? 'active' : ''}`}
                onClick={() => setSelectedShowtime(movie)}
              >
                {movie.show_time}
              </button>
            )}
          </div>

          <div className="mt-4">
            <button
              className="mp-select"
              onClick={() =>
                navigate('/seat-selection', {
                  state: {
                    movie_id: movie.movie_id,
                    movie_name: movie.movie_name,
                    showtime_id: selectedShowtime.showtime_id,
                    show_date: selectedDate,
                    start_time: selectedShowtime.show_time
                  }
                })
              }
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoviePage;
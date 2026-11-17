
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
    <div className="container py-5">
       <div className="position-absolute top-0 end-0 p-4">
        <button
          className="btn btn-outline-light"
          onClick={() => navigate('/adminLogin')}
        >
          <i className="bi bi-person-lock me-2"></i>
          Admin
        </button>
      </div>

      <div className="text-center mb-5">
        <h1 className="fw-bold">
          Welcome to Cinema Seat Booking
        </h1>

        <p className="text-muted mt-3">
          Book your favourite movies easily.
        </p>
        
      </div>

      <div className="row g-4">
        {movies.map((movie) => (
          <div className="col-md-6 col-lg-4" key={movie.movie_id}>
            <div className="card border-0 shadow-sm h-100 overflow-hidden">

              <img
                src={
                    movie.poster_url?.trim()
                        ? movie.poster_url
                        : '/default-movie.jpg'
                }
                alt={movie.movie_name}
                className="card-img-top"
                style={{
                    height: '350px',
                    objectFit: 'cover',
                }}
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/default-movie.jpg';
                }}
            />

              <div className="card-body p-4">
                 <h4 className="fw-bold">
                  {movie.movie_name}
                </h4>

                 <p style={{ textAlign: 'justify' }}>
                    {movie.description}
                </p>


                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    <i className="bi bi-clock me-2"></i>
                    {movie.duration_minutes} minutes
                  </span>

                  
                </div>

                <button
                  className="btn btn-danger w-100"
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
                  Book Now
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
         <div className="bg-white py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Why Choose Us?</h2>
            <p className="text-secondary">
              Enjoy a simple and convenient movie booking experience.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4">
                <i className="bi bi-ticket-perforated text-danger fs-1"></i>
                <h5 className="fw-bold mt-3">Easy Booking</h5>
                <p className="text-secondary">
                  Book your movie tickets online easily.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4">
                <i className="bi bi-grid-3x3-gap text-danger fs-1"></i>
                <h5 className="fw-bold mt-3">Seat Selection</h5>
                <p className="text-secondary">
                  Select your preferred seats before booking.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4">
                <i className="bi bi-calendar-check text-danger fs-1"></i>
                <h5 className="fw-bold mt-3">Flexible Scheduling</h5>
                <p className="text-secondary">
                  Choose a suitable date and showtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

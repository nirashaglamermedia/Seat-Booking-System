
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMovieByNameQuery } from '../features/movieApi';

function MoviePage() {
  const { movie_name } = useParams();
  const navigate=useNavigate();
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

  return (
    <div className="container py-5">
        <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">
                Movie Details
            </h2>
            <p className="text-secondary mb-0">
                Explore the movie and select your preferred Date
            </p>
            <button
                className="btn btn-primary"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            <div
                className="mx-auto mt-3"
                style={{
                    width: '65px',
                    height: '4px',
                    backgroundColor: '#0d6efd',
                    borderRadius: '10px'
                }}
            ></div>
        </div>

        <div className="row justify-content-center">

          <div className="col-md-5">
    <img
        src={
            movie.poster_url?.trim()
                ? movie.poster_url
                : '/default-movie.jpg'
        }
        alt={movie.movie_name}
        className="img-fluid rounded shadow"
        style={{
            width: '100%',
            height: '550px',
            objectFit: 'cover',
        }}
        onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/default-movie.jpg';
        }}
    />
          </div>

          <div className="col-md-6">

            <h2 className="fw-bold mt-3">
              {movie.movie_name}
            </h2>

            <p className="text-secondary mt-3">
              {movie.description}
            </p>

            <p>
              <strong>Duration:</strong> {movie.duration_minutes} minutes
            </p>
            <hr />

              <h5 className="fw-bold">
                  Select Date
              </h5>

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

              <hr />

              <h5 className="fw-bold">
                  Select Showtime
              </h5>

              <div className="d-flex gap-2 flex-wrap">

                  {movie.show_time && (
                      <button
                          type="button"
                          className={`btn ${
                              selectedShowtime
                                  ? 'btn-outline-primary'
                                  : 'btn-primary'
                          }`}
                          onClick={() => setSelectedShowtime(movie)}
                      >
                          {movie.show_time}
                      </button>
                  )}

              </div>
            <div className="text-center mt-4">
                <button
                    className="btn btn-primary btn-lg"
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

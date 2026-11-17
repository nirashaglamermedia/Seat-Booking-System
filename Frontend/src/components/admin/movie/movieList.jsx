import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetMoviesQuery ,useDeactivateMovieMutation,} from '../../../features/movieApi';

function MovieList() {
    const navigate=useNavigate();

    const {
        data: movies = [],
        isLoading,
        isError,
        error,
      } = useGetMoviesQuery();

      const [deactivateMovie, { isLoading: isDeactivating }] = useDeactivateMovieMutation();

        const [selectedMovieId, setSelectedMovieId] = useState(null);
        const [showPopup, setShowPopup] = useState(false);
        const [popupMessage, setPopupMessage] = useState('');
        const [popupType, setPopupType] = useState('success');

        const handleDelete = (movie_id) => {
            setSelectedMovieId(movie_id);
            setPopupMessage('Are you sure you want to deactivate this movie?');
            setPopupType('confirm');
            setShowPopup(true);
        };
        const handleConfirmDelete = async () => {
            try {
                await deactivateMovie(selectedMovieId).unwrap();

                setPopupMessage('Movie deactivated successfully!');
                setPopupType('success');
                setSelectedMovieId(null);

            } catch (error) {
                console.error('Deactivate Movie Error:', error);

                setPopupMessage(
                    error?.data?.message || 'Failed to deactivate movie.'
                );
                setPopupType('error');
            }
        };
      const groupedMovies = Object.values(
        movies.reduce((acc, movie) => {
            if (!acc[movie.movie_id]) {
            acc[movie.movie_id] = {
                ...movie,
                showtimes: [],
            };
            }

            if (movie.start_time) {
            acc[movie.movie_id].showtimes.push({
                showtime_id: movie.showtime_id,
                start_time: movie.start_time,
            });
            }

            return acc;
        }, {})
        );

const totalMovies = groupedMovies.length;
  return (
    <div className="container-fluid py-4 px-3 px-md-4">

      
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

        <div>
          <h3 className="fw-bold mb-1">
            Manage Movies
          </h3>
        </div>

        <div className="d-flex gap-2 flex-wrap">

          <button
            className="btn btn-outline-secondary px-3"
            onClick={() => navigate('/admin-dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
            <button  className="btn btn-primary" onClick={() => navigate('/add-movie')} >
                Add Movie
            </button>
        </div>
        </div>
        <div className="row g-3 mb-4">

            <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex justify-content-between align-items-center">

                        <div>
                            <p className="text-secondary mb-2">
                                Total Movies
                            </p>

                            <h3 className="fw-bold mb-0">
                                {totalMovies}
                            </h3>
                        </div>

                        

                    </div>
                </div>
            </div>
        </div>
        <div className="card-body p-0">

            <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">
                        <tr>
                        <th className="ps-3">Movie ID</th>
                        <th>Movie Name</th>
                        <th>Description</th>
                        
                        <th>Showtimes</th>
                        <th>Duration(min)</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                         {isLoading && (
                            <tr>
                                <td colSpan="7" className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="text-muted mt-2 mb-0">
                                    Loading Movies...
                                </p>
                                </td>
                            </tr>
                            )}

                            
                            {isError && (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-danger">
                                Failed to load Movies.

                                <div className="small mt-2">
                                    {error?.data?.message || 'Please try again.'}
                                </div>
                                </td>
                            </tr>
                            )}

                            
                            {!isLoading && !isError && groupedMovies.map((movie) => (
                                <tr key={movie.movie_id}>
                                    <td className="ps-3 fw-semibold">
                                        {movie.movie_id}
                                    </td>

                                    <td className="fw-semibold">
                                        {movie.movie_name}
                                    </td>

                                    <td>
                                        {movie.description}
                                    </td>
                                    
                                    <td>
                                    <div className="d-flex flex-wrap gap-2">
                                        {movie.showtimes.length > 0 ? (
                                        movie.showtimes.map((showtime) => (
                                            <span
                                            key={showtime.showtime_id}
                                            className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                                            >
                                            {showtime.start_time}
                                            </span>
                                        ))
                                        ) : (
                                        <span className="text-secondary">No Showtimes</span>
                                        )}
                                    </div>
                                    </td>

                                    <td>
                                    {movie.duration_minutes}
                                    </td>

                                    <td>
                                    <span
                                        className={`badge rounded-pill px-3 py-2 ${
                                        movie.status === 'Active'
                                            ? 'bg-success bg-opacity-10 text-success'
                                            : 'bg-danger bg-opacity-10 text-danger'
                                        }`}
                                    >
                                        {movie.status}
                                    </span>
                                    </td>

                                    <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() =>
                                            navigate(`/edit-movie/${movie.movie_id}`)
                                        }
                                        >
                                        Edit
                                        </button>
                                        <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(movie.movie_id)}
                                    >
                                        Delete
                                    </button>
                                    </div>
                                    </td>
                                </tr>
                                ))}

                {/* Empty Data */}
                {!isLoading &&
                    !isError &&
                    groupedMovies.length === 0 && (
                        <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                            No Movies found
                        </td>
                        </tr>
                    )}
   
                    </tbody>
                </table>
            </div>
        </div>
         {showPopup && (
    <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

                <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                        {popupType === 'confirm'
                            ? 'Deactivate Movie'
                            : popupType === 'success'
                            ? 'Success'
                            : 'Error'}
                    </h5>

                    <button
                        className="btn-close"
                        onClick={() => setShowPopup(false)}
                    />
                </div>

                <div className="modal-body text-center py-4">
                    <i
                        className={`bi ${
                            popupType === 'confirm'
                                ? 'bi-question-circle text-warning'
                                : popupType === 'success'
                                ? 'bi-check-circle-fill text-success'
                                : 'bi-exclamation-circle-fill text-danger'
                        } fs-1`}
                    ></i>

                    <p className="mt-3 mb-0">{popupMessage}</p>
                </div>

                <div className="modal-footer justify-content-center">

                    {popupType === 'confirm' ? (
                        <>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-danger"
                                onClick={handleConfirmDelete}
                                disabled={isDeactivating}
                            >
                                {isDeactivating ? 'Processing...' : 'Yes, Deactivate'}
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowPopup(false)}
                        >
                            OK
                        </button>
                    )}

                </div>
            </div>
        </div>
    </div>
)}   
    </div>
  )
}

export default MovieList
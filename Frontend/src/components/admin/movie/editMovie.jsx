import React, { useState, useEffect } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  
  
import { useGetMovieByIdQuery, useUpdateMovieMutation } from '../../../features/movieApi';

function EditMovie() {
  
    const navigate = useNavigate();
    const {movie_id} = useParams();
  
    
    const [movieName, setMovieName] = useState('');
    const [description, setDescription] = useState('');
    const [showtimes, setShowtimes] = useState([]);
    const [halls, setHalls] = useState([]);
    const [durationMinutes, setDurationMinutes] = useState('');
    const [status, setStatus] = useState('');
    const [showingStartDate, setShowingStartDate] = useState('');
    const [showingEndDate, setShowingEndDate] = useState('');
  
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('success');
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedMovieId, setSelectedMovieSeatId] = useState(null);
    
    const {
      data: movie,
      isLoading,
      isError,
      error,
    } = useGetMovieByIdQuery(movie_id);
  
    
    
  const [
    updateMovie,
    {
      isLoading: isUpdating,
    },
  ] = useUpdateMovieMutation();
  
  
  
  
   
  useEffect(() => {
    if (movie) {
      setMovieName(movie.movie_name ?? '');
      setDescription(movie.description ?? '');
      setShowtimes(movie.showtimes ?? []);
      setHalls(movie.halls ?? []);
      setDurationMinutes(movie.duration_minutes ?? '');
      setStatus(movie.status ?? '');

      setShowingStartDate(
        movie.showing_start_date
          ? String(movie.showing_start_date).slice(0, 10)
          : ''
      );

      setShowingEndDate(
        movie.showing_end_date
          ? String(movie.showing_end_date).slice(0, 10)
          : ''
      );
    }
  }, [movie]);
  
    
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
      setSelectedMovieId(null);
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
                Loading movie details...
              </p>
            </div>
          </div>
        </div>
      );
    }
  
    
    if (isError || !movie) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger">
            <h5>Unable to Load Movie</h5>
  
            <p className="mb-0">
              {error?.data?.message ||
                'Movie details could not be loaded.'}
            </p>
          </div>
  
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/movie-list')}
          >
            Back to Movie List
          </button>
        </div>
      );
    }
    const isArrived = movie.arrival_status === 'Arrived';
    
    const handleSubmit = async (e) => {e.preventDefault();

      if (!showingStartDate || !showingEndDate) {
        showMessage(
          'Invalid Date',
          'Please select both showing dates.',
          'error'
        );
        return;
      }

      if (new Date(showingEndDate) < new Date(showingStartDate)) {
        showMessage(
          'Invalid Date',
          'Showing End Date cannot be earlier than Start Date.',
          'error'
        );
        return;
      }

      showConfirmation(
        'Update Movie',
        'Are you sure you want to update this movie?',
        async () => {
          try {
            await updateMovie({
              movie_id: Number(movie_id),
              description,
              showing_start_date: showingStartDate,
              showing_end_date: showingEndDate,
            }).unwrap();

            showMessage(
              'Success',
              'Movie updated successfully!',
              'success'
            );

          } catch (error) {
            console.error('Update error:', error);

            const message = error?.data?.message;

            showMessage(
              'Error',
              Array.isArray(message)
                ? message.join('\n')
                : message || 'Failed to update movie.',
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
            Edit Movie
          </h2>
  
          <p className="text-muted mb-0">
            View Movie information and update its status.
          </p>
        </div>
  
        
        <div className="card shadow-sm border-0">
  
          <div className="card-header bg-white py-3">
            <h5 className="fw-semibold mb-0">
              Movie Information
            </h5>
          </div>
          {/* {isArrived && (
              <div className="alert alert-warning">
                <i className="bi bi-lock-fill me-2"></i>
                <strong>Booking Locked!</strong>
                <p className="mb-0">
                  Customer has already arrived.
                  This booking cannot be edited or cancelled.
                </p>
              </div>
            )} */}
          <div className="card-body p-4">
  
            <form onSubmit={handleSubmit}>
  
              <div className="row g-3">
  
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Movie ID
                  </label>
  
                  <input
                    type="text"
                    className="form-control"
                    value={movie.movie_id ?? movie_id}
                    readOnly
                  />
                </div>
  
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Movie Name
                  </label>
  
                  <input
                    type="text"
                    className="form-control"
                    value={movieName}
                    readOnly
                  />
                </div>
  
                
                <div className="col-12">
                <label className="form-label fw-semibold">
                  Movie Description
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                {/* Showing Start Date */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Showing Start Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={showingStartDate}
                    onChange={(e) => setShowingStartDate(e.target.value)}
                    readOnly
                  />
                </div>

                {/* Showing End Date */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Showing End Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={showingEndDate}
                    min={showingStartDate}
                    onChange={(e) => setShowingEndDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Showtimes
                    </label>

                    <div className="form-control bg-light" style={{ minHeight: '45px' }}>
                      {showtimes.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {showtimes.map((item) => (
                            <span
                              key={item.showtime_id}
                              className="badge bg-primary px-3 py-2"
                            >
                              {String(item.start_time).slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No Showtimes'
                      )}
                    </div>
                  </div>

  
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Duration (min)
                  </label>
  
                  <input
                    type="number"
                    className="form-control"
                    value={durationMinutes}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Halls
                    </label>

                    <div className="form-control bg-light" style={{ minHeight: '45px' }}>
                      {halls.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {halls.map((hall, index) => (
                            <span
                              key={index}
                              className="badge bg-info text-dark px-3 py-2"
                            >
                              {hall}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No Halls'
                      )}
                    </div>
                  </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                      Movie Status
                  </label>

                  <input
                      type="text"
                      className="form-control"
                      value={status}
                      readOnly
                  />
              </div>
              </div>
  
             
              <div className="d-flex justify-content-end gap-2 mt-4">
  
               <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/movie-list')}
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
                      Update Movie
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
                    disabled={ isUpdating}
                  >
                    Yes, Confirm
                  </button>
                </>
              ) : (
                <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const shouldNavigate = popupTitle === 'Success';

                  closePopup();

                  if (shouldNavigate) {
                    navigate('/movie-list');
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

export default EditMovie



  



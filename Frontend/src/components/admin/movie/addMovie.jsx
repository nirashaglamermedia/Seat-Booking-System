
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAddMovieWithShowtimeMutation } from '../../../features/movieApi';

function AddMovie() {
    const navigate = useNavigate();

    const [addMovie, { isLoading }] = useAddMovieWithShowtimeMutation();

    const [movieName, setMovieName] = useState('');
    const [description, setDescription] = useState('');
    const [posterUrl, setPosterUrl] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!startTime || !endTime) {
            setError('Please select start time and end time.');
            return;
        }

        if (endTime <= startTime) {
            setError('End time must be later than start time.');
            return;
        }

        try {
            await addMovie({
                movie_name: movieName.trim(),
                description: description.trim(),
                poster_url: posterUrl,
                duration_minutes: Number(durationMinutes),
                start_time: startTime,
                end_time: endTime,
            }).unwrap();

            navigate('/movie-list');

        } catch (error) {
            console.error('Add Movie error:', error);

            const message = error?.data?.message;

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message || 'Unable to create Movie'
            );
        }
    };

    return (
        <div className="container py-5">

            <div className="mb-4">
                <h2 className="fw-bold mb-1">Add Movie</h2>
                <p className="text-muted mb-0">
                    Add Movie information
                </p>
            </div>

            <div className="card shadow-sm border-0">

                <div className="card-header bg-white py-3">
                    <h5 className="fw-semibold mb-0">
                        Movie Information
                    </h5>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Movie Name
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Movie Name"
                                value={movieName}
                                onChange={(e) => setMovieName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Movie Description
                            </label>

                            <textarea
                                className="form-control"
                                placeholder="Enter Movie Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                required
                            />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                              Movie Poster Image URL
                          </label>

                          <input
                              type="url"
                              className="form-control"
                              placeholder="Enter movie poster image URL"
                              value={posterUrl}
                              onChange={(e) => setPosterUrl(e.target.value)}
                              required
                          />
                      </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Showtime Start Time
                            </label>

                            <input
                                type="time"
                                className="form-control"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Showtime End Time
                            </label>

                            <input
                                type="time"
                                className="form-control"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Movie Duration (Minutes)
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                placeholder="Enter Movie Duration"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                min="1"
                                required
                            />
                        </div>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <div className="d-flex justify-content-end gap-2 mt-4">

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/movie-list')}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Add Movie'}
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddMovie;

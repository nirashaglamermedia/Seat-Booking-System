
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

    const [showingStartDate, setShowingStartDate] = useState('');
    const [showingEndDate, setShowingEndDate] = useState('');

    const [showtimes, setShowtimes] = useState([
        {
            hall_id: '',
            start_time: '',
            end_time: '',
        },
    ]);

    const [error, setError] = useState('');

    // Add another showtime row
    const handleAddShowtime = () => {
        setShowtimes([
            ...showtimes,
            {
                hall_id: '',
                start_time: '',
                end_time: '',
            },
        ]);
    };

    // Remove a showtime row
    const handleRemoveShowtime = (index) => {
        setShowtimes(showtimes.filter((_, i) => i !== index));
    };

    // Update showtime details
    const handleShowtimeChange = (index, field, value) => {
        const updatedShowtimes = [...showtimes];

        updatedShowtimes[index] = {
            ...updatedShowtimes[index],
            [field]: value,
        };

        setShowtimes(updatedShowtimes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!showingStartDate || !showingEndDate) {
            setError('Please select movie showing start date and end date.');
            return;
        }

        if (showingEndDate < showingStartDate) {
            setError('Showing end date must be after or equal to start date.');
            return;
        }

        if (showtimes.length === 0) {
            setError('Please add at least one showtime.');
            return;
        }

        for (let i = 0; i < showtimes.length; i++) {
            const showtime = showtimes[i];

            if (
                !showtime.hall_id ||
                !showtime.start_time ||
                !showtime.end_time
            ) {
                setError(`Please complete all fields in Showtime ${i + 1}.`);
                return;
            }

            if (showtime.end_time <= showtime.start_time) {
                setError(`End time must be later than start time in Showtime ${i + 1}.`);
                return;
            }
        }

        try {
            await addMovie({
                movie_name: movieName.trim(),
                description: description.trim(),
                poster_url: posterUrl.trim(),
                duration_minutes: Number(durationMinutes),

                showing_start_date: showingStartDate,
                showing_end_date: showingEndDate,

                showtimes: showtimes.map((showtime) => ({
                    hall_id: Number(showtime.hall_id),
                    start_time: showtime.start_time,
                    end_time: showtime.end_time,
                })),
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

    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) {
            return '';
        }

        const [hours, minutes] = startTime.split(':').map(Number);

        const startMinutes = hours * 60 + minutes;

        const endMinutes = startMinutes + Number(durationMinutes);

        const endHours = Math.floor(endMinutes / 60) % 24;
        const endMinute = endMinutes % 60;

        return `${String(endHours).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    };

    return (
        <div className="container py-5">

            <div className="mb-4">
                <h2 className="fw-bold mb-1">Add Movie</h2>

                <p className="text-muted mb-0">
                    Add Movie information and showtimes
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

                        {/* Movie Name */}
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

                        {/* Description */}
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

                        {/* Poster URL */}
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

                        {/* Duration */}
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

                        <hr className="my-4" />

                        {/* Showing Period */}
                        <h5 className="fw-bold mb-3">
                            Movie Showing Period
                        </h5>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Showing Start Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={showingStartDate}
                                    onChange={(e) => setShowingStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Showing End Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    min={showingStartDate || undefined}
                                    value={showingEndDate}
                                    onChange={(e) => setShowingEndDate(e.target.value)}
                                    required
                                />
                            </div>

                        </div>

                        <hr className="my-4" />

                        {/* Showtimes */}
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

                            <h5 className="fw-bold mb-0">
                                Movie Showtimes
                            </h5>

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={handleAddShowtime}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Showtime
                            </button>

                        </div>

                        {showtimes.map((showtime, index) => (

                            <div
                                className="card bg-light border mb-3"
                                key={index}
                            >

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center mb-3">

                                        <h6 className="fw-bold mb-0">
                                            Showtime {index + 1}
                                        </h6>

                                        {showtimes.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveShowtime(index)}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                Remove
                                            </button>
                                        )}

                                    </div>

                                    <div className="row">

                                        {/* Hall ID */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-semibold">
                                                Hall ID
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter Hall ID"
                                                min="1"
                                                value={showtime.hall_id}
                                                onChange={(e) =>
                                                    handleShowtimeChange(
                                                        index,
                                                        'hall_id',
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        {/* Start Time */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-semibold">
                                                Showtime Start Time
                                            </label>

                                            <input
                                            type="time"
                                            className="form-control"
                                            value={showtime.start_time || ''}
                                            onChange={(e) => {
                                                const startTime = e.target.value;

                                                const endTime = calculateEndTime(
                                                    startTime,
                                                    durationMinutes
                                                );

                                                setShowtimes((previousShowtimes) =>
                                                    previousShowtimes.map((item, i) =>
                                                        i === index
                                                            ? {
                                                                ...item,
                                                                start_time: startTime,
                                                                end_time: endTime,
                                                            }
                                                            : item
                                                    )
                                                );
                                            }}
                                            required
                                        />
                                        </div>

                                        {/* End Time */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-semibold">
                                                Showtime End Time
                                            </label>

                                            <input
                                                    type="time"
                                                    className="form-control"
                                                    value={showtime.end_time}
                                                    readOnly
                                                />
                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                        {/* Error */}
                        {error && (
                            <div className="alert alert-danger mt-3">
                                {error}
                            </div>
                        )}

                        {/* Buttons */}
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


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddHallMutation } from '../../../features/hallapi';

function AddHall() {
  const navigate = useNavigate();

  const [addHall, { isLoading }] = useAddHallMutation();

  const [formData, setFormData] = useState({
    hall_name: '',
    total_rows: '',
    seats_per_row: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (
      !formData.hall_name.trim() ||
      !formData.total_rows ||
      !formData.seats_per_row
    ) {
      setErrorMessage('Please fill all fields.');
      return;
    }

    if (
      Number(formData.total_rows) <= 0 ||
      Number(formData.seats_per_row) <= 0
    ) {
      setErrorMessage('Rows and seats per row must be greater than zero.');
      return;
    }

    try {
      await addHall({
        hall_name: formData.hall_name.trim(),
        total_rows: Number(formData.total_rows),
        seats_per_row: Number(formData.seats_per_row),
      }).unwrap();

      setSuccessMessage('Hall added successfully!');

      setTimeout(() => {
        navigate('/movie-hall');
      }, 1000);

    } catch (error) {
      console.error('Add Hall Error:', error);

      setErrorMessage(
        error?.data?.message || 'Failed to add hall.'
      );
    }
  };

  return (
    <div className="container py-4">

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">

          <div className="card shadow-sm border-0">

            <div className="card-header bg-primary text-white py-3">
              <h4 className="mb-0 fw-bold">
                Add New Hall
              </h4>
            </div>

            <div className="card-body p-4">

              {errorMessage && (
                <div className="alert alert-danger">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Hall Name
                  </label>

                  <input
                    type="text"
                    name="hall_name"
                    className="form-control"
                    placeholder="Enter hall name"
                    value={formData.hall_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Total Rows
                  </label>

                  <input
                    type="number"
                    name="total_rows"
                    className="form-control"
                    placeholder="Enter total rows"
                    min="1"
                    value={formData.total_rows}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Seats Per Row
                  </label>

                  <input
                    type="number"
                    name="seats_per_row"
                    className="form-control"
                    placeholder="Enter seats per row"
                    min="1"
                    value={formData.seats_per_row}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/movie-hall')}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Add Hall'}
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AddHall;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddSeatMutation } from '../../../features/seatApi'
import Popup from '../../../features/Popup';

function AddSeat() {
  const navigate = useNavigate();
  const [addSeat, { isLoading }] = useAddSeatMutation();
  const [seatNumber, setSeatNumber] = useState('');
  const [row, setRow] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Available');
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [isSuccess, setIsSuccess] = useState(false);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    await addSeat({
      seat_number: seatNumber,
      row_name: row,
      price: Number(price),
    }).unwrap();

    setError('');
    setPopupTitle('Success');
    setPopupMessage('Seat added successfully!');
    setPopupType('success');
    setIsSuccess(true);
    setShowPopup(true);

  } catch (error) {
    console.error('Add seat error:', error);

    const message = error?.data?.message;

    setError(
      Array.isArray(message)
        ? message.join(', ')
        : message || 'Unable to create seat'
    );
  }
};

  return (
    <div className="container py-5">

      
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Add Seat</h2>

        <p className="text-muted mb-0">
          Add a new cinema seat to the system
        </p>
      </div>

      
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            Seat Information
          </h5>
        </div>

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Seat Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: A1"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  required
                />
              </div>

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Seat Row
                </label>

                <select
                  className="form-select"
                  value={row}
                  onChange={(e) => setRow(e.target.value)}
                  required
                >
                  <option value="">Select Row</option>
                  <option value="A">Row A</option>
                  <option value="B">Row B</option>
                  <option value="C">Row C</option>
                  <option value="D">Row D</option>
                  <option value="E">Row E</option>
                  <option value="F">Row F</option>
                  <option value="G">Row G</option>
                </select>
              </div>

              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Seat Price (LKR)
                </label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter seat price"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              
                
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
                onClick={() => navigate('/seat-list')}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Add Seat'}
              </button>
             

            </div>

          </form>

        </div>
      </div>
      <Popup
        show={showPopup}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={() => {
          setShowPopup(false);

          if (isSuccess) {
            navigate('/seat-list');
          }
        }}
      />

    </div>
  );
}

export default AddSeat;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeactivateHallMutation,
  useGetHallsQuery,
} from '../../../features/hallapi';

function HallList() {
  const navigate = useNavigate();

  const {
    data: halls = [],
    isLoading,
    isError,
    error,
  } = useGetHallsQuery();

  const [deactivateHall, { isLoading: isDeactivating }] =
    useDeactivateHallMutation();

  const [selectedHallId, setSelectedHallId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  const handleDelete = (hall_id) => {
    setSelectedHallId(hall_id);
    setPopupMessage(
      'Are you sure you want to deactivate this hall?'
    );
    setPopupType('confirm');
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deactivateHall(selectedHallId).unwrap();

      setPopupMessage('Hall deactivated successfully!');
      setPopupType('success');
      setSelectedHallId(null);
    } catch (error) {
      console.error('Deactivate Hall Error:', error);

      setPopupMessage(
        error?.data?.message || 'Failed to deactivate Hall.'
      );
      setPopupType('error');
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

        <div>
          <h3 className="fw-bold mb-1">Manage Hall</h3>
        </div>

        <div className="d-flex gap-2 flex-wrap">

          <button
            className="btn btn-outline-secondary px-3"
            onClick={() => navigate('/admin-dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/add-hall')}
          >
            Add Hall
          </button>

        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th className="ps-3">Hall ID</th>
                  <th>Hall Name</th>
                  <th>Total Rows</th>
                  <th>Seats Per Row</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>

                {isLoading && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                      <p className="text-muted mt-2 mb-0">
                        Loading Halls...
                      </p>
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-danger">
                      Failed to load Halls.
                      <div className="small mt-2">
                        {error?.data?.message || 'Please try again.'}
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && halls.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No halls found.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && halls.map((hall) => (
                  <tr key={hall.hall_id}>

                    <td className="ps-3 fw-semibold">
                      {hall.hall_id}
                    </td>

                    <td className="fw-semibold">
                      {hall.hall_name}
                    </td>

                    <td>
                      {hall.total_rows}
                    </td>

                    <td>
                      {hall.seats_per_row}
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          hall.status === 'Active'
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}
                      >
                        {hall.status}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-2">

                        {hall.status === 'Active' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(hall.hall_id)}
                          >
                            Deactivate
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>
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
                    ? 'Deactivate Hall'
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
                      disabled={isDeactivating}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={handleConfirmDelete}
                      disabled={isDeactivating}
                    >
                      {isDeactivating
                        ? 'Processing...'
                        : 'Yes, Deactivate'}
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
  );
}

export default HallList;

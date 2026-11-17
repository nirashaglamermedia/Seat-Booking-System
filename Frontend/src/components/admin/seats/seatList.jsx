import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Popup from '../../../features/Popup';

import {
  useGetSeatsQuery,
  useDeleteSeatMutation,
} from '../../../features/seatApi';

function SeatList() {
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [popupAction, setPopupAction] = useState('confirm');

  
  const currentUser = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  
  const {
    data: seat = [],
    isLoading,
    isError,
    error,
  } = useGetSeatsQuery();

  
  const [deleteSeat, { isLoading: isDeleting }] =
    useDeleteSeatMutation();

  
  const handleDelete = (seatId) => {
    setSelectedSeatId(seatId);
    setPopupTitle('Delete Seat');
    setPopupMessage(
      'Are you sure you want to delete this seat?'
    );
    setPopupType('warning');
    setPopupAction('confirm');
    setShowPopup(true);
  };

  
  const confirmDelete = async () => {
    if (selectedSeatId === null || isDeleting) {
      return;
    }

    try {
      await deleteSeat(selectedSeatId).unwrap();

      setPopupTitle('Success');
      setPopupMessage('Seat deleted successfully!');
      setPopupType('success');
      setPopupAction('message');
      setSelectedSeatId(null);
    } catch (err) {
      console.error('Delete error:', err);

      setPopupTitle('Delete Failed');
      setPopupMessage('Failed to delete seat. Please try again.');
      setPopupType('error');
      setPopupAction('message');
    }
  };

  
  if (isLoading) {
    return (
      <div className="container py-5">
        <p>Loading seats...</p>
      </div>
    );
  }

  
  if (isError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Failed to load seats. Check backend and CORS.
          {' '}{error?.status || ''}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">

      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Seat Management System
          </h2>

          <p className="text-muted mb-0">
            Manage all cinema seats
          </p>
        </div>

        <div className="d-flex gap-2">
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/add-seat')}
            >
              + Add Seats
            </button>
          )}

          <button
            type="button"
            className="btn btn-danger d-flex align-items-center justify-content-center p-0"
            style={{
              width: '35px',
              height: '35px',
              borderRadius: '6px',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
            aria-label="Close"
            onClick={() => navigate('/admin-dashboard')}
          >
            ×
          </button>
        </div>
      </div>

      
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            Seat List
          </h5>
        </div>

        <div className="card-body">
          <div className="table-responsive">

            <table className="table table-striped table-hover table-bordered align-middle mb-0">

              <thead className="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Row</th>
                  <th scope="col">Seat Number</th>
                  <th scope="col">Price (LKR)</th>
                  <th scope="col" className="text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {seat.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No seats found
                    </td>
                  </tr>
                ) : (
                  seat.map((item) => (
                    <tr key={item.seat_id}>
                      <td>{item.seat_id}</td>

                      <td>
                        <strong>{item.row_name}</strong>
                      </td>

                      <td>{item.seat_number}</td>

                      <td>{item.price ?? '-'}</td>

                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            navigate(`/edit-seat/${item.seat_id}`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          disabled={isDeleting}
                          onClick={() => handleDelete(item.seat_id)}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

        <div className="card-footer bg-white text-muted">
          Showing {seat.length} seats
        </div>
      </div>

      
      <Popup
        show={showPopup}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={() => {
          setShowPopup(false);
          setSelectedSeatId(null);
        }}
        onConfirm={
          popupAction === 'confirm'
            ? confirmDelete
            : undefined
        }
        confirmText={popupAction === 'confirm' ? 'OK' : 'OK'}
        cancelText="Cancel"
      />

    </div>
  );
}

export default SeatList;
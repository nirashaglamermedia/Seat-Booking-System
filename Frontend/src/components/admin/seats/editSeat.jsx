
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetSeatByIdQuery,
  useUpdateSeatMutation,
} from '../../../features/seatApi'
import Popup from '../../../features/Popup';

function EditSeat() {
  const navigate = useNavigate();
  const { seat_id } = useParams();

  const {
      data: seat,
      isLoading,
      isError,
    } = useGetSeatByIdQuery(seat_id);
  
    const [
      updateSeat,
      { isLoading: isUpdating, error: updateError },
    ] = useUpdateSeatMutation();

    const [seatNumber, setSeatNumber] = useState('');
    const [row, setRow] = useState('');
    const [price, setPrice] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('info');
    const [isSuccess, setIsSuccess] = useState(false);
  

  useEffect(()=>{
      if(seat){
        setSeatNumber(seat.seat_number?? "");
        setRow(seat.row_name ?? '');
        setPrice(seat.price ?? "");
        
      }
    },[seat]);
  
    const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await updateSeat({
      seat_id: Number(seat_id),
      seat_number: seatNumber,
      row_name: row,
      price: Number(price),
    }).unwrap();

    setPopupTitle('Success');
    setPopupMessage('Seat update successfully!');
    setPopupType('success');
    setIsSuccess(true);
    setShowPopup(true);

  } catch (error) {
    console.error('Update error:', error);
    alert(
      error?.data?.message
        ? JSON.stringify(error.data.message)
        : 'Failed to update seat'
    );
  }
};
  return (
    <div className="container py-5">

      
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Edit Seat</h2>

        <p className="text-muted mb-0">
          Update the cinema seat information
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
                  placeholder="Enter seat number"
                  value={seatNumber}
                  onChange={(e) =>
                    setSeatNumber(e.target.value)
                  }
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
                  onChange={(e) =>
                    setRow(e.target.value)
                  }
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
                  min="1"
                  placeholder="Enter seat price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  required
                />
              </div>

              

            </div>

            
            <div className="d-flex justify-content-end gap-2 mt-4">
              
              {updateError && (
                  <div className="alert alert-danger">
                    Update failed. Check the email and backend response.
                  </div>
                )}
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
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Seat"}
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

export default EditSeat;

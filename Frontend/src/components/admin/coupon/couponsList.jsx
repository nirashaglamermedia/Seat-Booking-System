import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { useDeleteCouponMutation, useGetAllCouponsQuery } from '../../../features/couponApi';
import Popup from '../../../features/Popup';


function CouponsList() {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [popupAction, setPopupAction] = useState('');
  

  
  const {
    data: coupons = [],
    isLoading,
    isError,
    error,
  } = useGetAllCouponsQuery();
  const [deleteCoupon, { isLoading: isDeleting }] =
      useDeleteCouponMutation();
  
  
  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) => coupon.status === 'Available'
    ).length;

  const inactiveCoupons = coupons.filter(
    (coupon) => coupon.status === 'Used'
    ).length;

const handleDelete = async (coupon_id) => {
    setSelectedCouponId(coupon_id);
      setPopupTitle('Delete Coupon');
      setPopupMessage(
          'Are you sure you want to delete this coupon?'
      );
      setPopupType('warning');
      setPopupAction('confirm');
      setShowPopup(true);
  };
  const confirmDelete = async () => {
    if (selectedMemberId === null || isDeleting) {
      return;
    }

    try {
      await deleteCoupon(selectedCouponId).unwrap();

      setPopupTitle('Success');
      setPopupMessage('Coupon deleted successfully!');
      setPopupType('success');
      setPopupAction('message');
      setSelectedCouponId(null);

    } catch (err) {
      console.error('Delete error:', err);

        setPopupTitle('Delete Failed');
        setPopupMessage(
            err?.data?.message || 'Failed to delete Coupon.'
        );
        setPopupType('error');
        setPopupAction('message');
    }
  };
  
  return (
    <div className="container-fluid py-4 px-3 px-md-4">

      
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

        <div>
          <h3 className="fw-bold mb-1">
            Manage Coupons
          </h3>

          <p className="text-muted mb-0">
            Manage customer coupon and benefits
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">

          <button
            className="btn btn-outline-secondary px-3"
            onClick={() => navigate('/admin-dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>

        </div>
      </div>

      
      {message && (
        <div className="alert alert-info alert-dismissible fade show">
          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage('')}
          ></button>
        </div>
      )}

      
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">

              <div>
                <p className="text-secondary mb-2">
                  Total Coupons
                </p>

                <h3 className="fw-bold mb-0">
                  {totalCoupons}
                </h3>
              </div>

              

            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">

              <div>
                <p className="text-secondary mb-2">
                  Available Coupons
                </p>

                <h3 className="fw-bold mb-0">
                  {activeCoupons}
                </h3>
              </div>


            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">

              <div>
                <p className="text-secondary mb-2">
                  Used Coupons
                </p>

               <h3 className="fw-bold mb-0">
                    {inactiveCoupons}
                </h3>
              </div>

              

            </div>
          </div>
        </div>

      </div>

      
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            Coupons List
          </h5>
        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th className="ps-3">ID</th>
                  <th>User Name</th>
                  <th>Coupon Code</th>
                  <th>Discount Percentage(%)</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Expire Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>

                
                {isLoading && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                      <p className="text-muted mt-2 mb-0">
                        Loading Coupons...
                      </p>
                    </td>
                  </tr>
                )}

                
                {isError && (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-danger">
                      Failed to load coupons.

                      <div className="small mt-2">
                        {error?.data?.message || 'Please try again.'}
                      </div>
                    </td>
                  </tr>
                )}

                
                {!isLoading && !isError && coupons.map((coupon) => (

                  <tr key={coupon.coupon_id}>

                    <td className="ps-3 fw-semibold">
                      {coupon.coupon_id}
                    </td>

                    <td className="fw-semibold">
                      {coupon.user_name}
                    </td>

                    <td>
                      {coupon.coupon_code}
                    </td>

                    <td>
                      {coupon.discount_percentage}%
                    </td>

                    
                    <td>
                    <span
                        className={`badge rounded-pill px-3 py-2 ${
                        coupon.status === 'Available'
                            ? 'bg-success text-white'
                            : coupon.status === 'Used'
                            ? 'bg-danger text-white'
                            : 'bg-secondary text-white'
                        }`}
                    >
                        {coupon.status || 'Unknown'}
                    </span>
                    </td>

                    <td>
                      {coupon.created_at
                    ? new Date(coupon.created_at).toLocaleDateString()
                    : '-'}
                    </td>
                        <td>
                      {coupon.expire_at
                    ? new Date(coupon.expires_at).toLocaleDateString()
                    : '-'}
                    </td>
                    

                    <td>
                      <div className="d-flex justify-content-center gap-2">
                         <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                                handleDelete(coupon.coupon_id)
                            }
                            disabled={isDeleting}
                            title="Delete"
                            >
                            Delete
                         </button>
                        

                        

                      </div>
                    </td>

                  </tr>

                ))}

                
                {!isLoading &&
                  !isError &&
                 coupons.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-5 text-muted"
                      >
                        <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                        No coupons found
                      </td>
                    </tr>
                  )}

              </tbody>

            </table>

          </div>
        </div>
      </div>
      <Popup
                show={showPopup}
                title={popupTitle}
                message={popupMessage}
                type={popupType}
                onClose={() => {
                    setShowPopup(false);
                    setSelectedCouponId(null);
                }}
                onConfirm={
                    popupAction === 'confirm'
                        ? confirmDelete
                        : undefined
                }
                confirmText="Delete"
                cancelText="Cancel"
            />

    </div>
  );
}

export default CouponsList


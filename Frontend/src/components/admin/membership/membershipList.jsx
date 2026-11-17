
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import {
  useDeleteMembershipMutation,
  useGetMembershipsQuery,
} from '../../../features/membershipApi';
import Popup from '../../../features/Popup';

function MembershipList() {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [popupAction, setPopupAction] = useState('');

  
  const {
    data: memberships = [],
    isLoading,
    isError,
    error,
  } = useGetMembershipsQuery();

  
  const [deleteMembership, { isLoading: isDeleting }] =
    useDeleteMembershipMutation();

  
  const totalMembership = memberships.length;

  const activeMembership = memberships.filter(
    (item) => item.status === 'Active'
  ).length;

  const expiredMembership = memberships.filter(
    (item) => item.status === 'Expired'
).length;
  const pendingCount = memberships.filter(
    (item) => item.status === 'Pending'
).length;
  
  const handleEdit = (id) => {
    navigate(`/edit-membership/${id}`);
  };

  
  const handleDelete = (membership_id) => {
      setSelectedMemberId(membership_id);
      setPopupTitle('Delete Membership');
      setPopupMessage(
          'Are you sure you want to delete this membership?'
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
      await deleteMembership(selectedMemberId).unwrap();

      setPopupTitle('Success');
      setPopupMessage('Membership deleted successfully!');
      setPopupType('success');
      setPopupAction('message');
      setSelectedMemberId(null);

    } catch (err) {
      console.error('Delete error:', err);

        setPopupTitle('Delete Failed');
        setPopupMessage(
            err?.data?.message || 'Failed to delete membership.'
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
            Manage Membership
          </h3>

          <p className="text-muted mb-0">
            Manage customer memberships and benefits
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
          <button
            className="btn btn-outline-dark px-3"
            onClick={() => navigate('/pending-request')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Pending Request
            <span className="badge bg-danger ms-2">
                      {pendingCount}
                  </span>
          </button>

          <button
            className="btn btn-primary px-4"
            onClick={() => navigate('/add-membership')}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Membership
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
                  Total Membership
                </p>

                <h3 className="fw-bold mb-0">
                  {totalMembership}
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
                  Active Membership
                </p>

                <h3 className="fw-bold mb-0">
                  {activeMembership}
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
                    Expired Membership
                </p>

               <h3 className="fw-bold mb-0">
                    {expiredMembership}
                </h3>
              </div>

              

            </div>
          </div>
        </div>

      </div>

      
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            Membership List
          </h5>
        </div>

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th className="ps-3">ID</th>
                  <th>User Name</th>
                  <th>Membership Type</th>
                  <th>Discount (%)</th>
                  <th>Max Seats</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>

                
                {isLoading && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                      <p className="text-muted mt-2 mb-0">
                        Loading memberships...
                      </p>
                    </td>
                  </tr>
                )}

                
                {isError && (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-danger">
                      Failed to load memberships.

                      <div className="small mt-2">
                        {error?.data?.message || 'Please try again.'}
                      </div>
                    </td>
                  </tr>
                )}

                
                {!isLoading && !isError && memberships.map((membership) => (

                  <tr key={membership.membership_id}>

                    <td className="ps-3 fw-semibold">
                      {membership.membership_id}
                    </td>

                    <td className="fw-semibold">
                      {membership.name}
                    </td>

                    <td>
                      {membership.membership_type}
                    </td>

                    <td>
                      {membership.discount_percentage}%
                    </td>

                    <td>
                      {membership.max_seats}
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          membership.status === 'Active'
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}
                      >
                        {membership.status}
                      </span>
                    </td>

                    <td>
                      {membership.start_date?.split('T')[0]}
                    </td>

                    <td>
                      {membership.expiry_date?.split('T')[0]}
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-2">

                        {/* Edit Button */}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            handleEdit(membership.membership_id)
                          }
                          title="Edit"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(membership.membership_id)
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

                {/* Empty Data */}
                {!isLoading &&
                  !isError &&
                  memberships.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-5 text-muted"
                      >
                        <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                        No memberships found
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
              setSelectedMemberId(null);
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

export default MembershipList;

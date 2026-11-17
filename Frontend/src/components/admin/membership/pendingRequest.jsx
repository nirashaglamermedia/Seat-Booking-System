
import React, { useState } from 'react';

import {
  useApproveMembershipMutation,
  useGetPendingMembershipsQuery,
  useRejectMembershipMutation,
} from '../../../features/membershipApi';


import Popup from '../../../features/Popup';

function PendingRequest() {
    
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('info');
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [popupAction, setPopupAction] = useState('');

    const showMessage = (title, message, type = 'info') => {
        setPopupTitle(title);
        setPopupMessage(message);
        setPopupType(type);
        setPopupAction('');
        setShowPopup(true);
    };

    const showConfirmation = (id, action) => {
    setSelectedMemberId(id);
    setPopupAction(action);

    setPopupTitle(
        action === 'approve'
        ? 'Approve Membership'
        : 'Reject Membership'
    );

    setPopupMessage(
        action === 'approve'
        ? 'Are you sure you want to approve this membership application?'
        : 'Are you sure you want to reject this membership application?'
    );

    setPopupType(action === 'approve' ? 'success' : 'warning');
    setShowPopup(true);
    };

    const closePopup = () => {
    setShowPopup(false);
    setSelectedMemberId(null);
    setPopupAction('');
    };

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useGetPendingMembershipsQuery();

  const [approveApplication, { isLoading: isApproving }] =
    useApproveMembershipMutation();

  const [rejectApplication, { isLoading: isRejecting }] =
    useRejectMembershipMutation();

 const handleApprove = async (id) => {
  try {
    await approveApplication(id).unwrap();

    showMessage(
      'Success',
      'Application approved successfully!',
      'success'
    );
  } catch (err) {
    const message = err?.data?.message;

    showMessage(
      'Approval Failed',
      Array.isArray(message)
        ? message.join('\n')
        : message || 'Approval failed!',
      'error'
    );
  }
};

const handleReject = async (id) => {
  try {
    await rejectApplication(id).unwrap();

    showMessage(
      'Success',
      'Application rejected successfully!',
      'success'
    );
  } catch (err) {
    const message = err?.data?.message;

    showMessage(
      'Rejection Failed',
      Array.isArray(message)
        ? message.join('\n')
        : message || 'Rejection failed!',
      'error'
    );
  }
};
const handlePopupConfirm = async () => {
  if (!selectedMemberId || !popupAction) return;

  const memberId = selectedMemberId;
  const action = popupAction;

  closePopup();

  if (action === 'approve') {
    await handleApprove(memberId);
  } else if (action === 'reject') {
    await handleReject(memberId);
  }
};
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Pending Request</h1>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th className="ps-3">ID</th>
                  <th>User Name</th>
                  <th>Membership Type</th>
                  <th>Discount (%)</th>
                  <th>Max Seats</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading pending requests...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="6" className="text-danger text-center py-4">
                      {error?.data?.message ||
                        'Failed to load pending requests.'}
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No pending applications available.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application.membership_id}>
                      <td>{application.membership_id}</td>

                      <td>{application.name}</td>

                      <td>{application.membership_type}</td>

                      <td>{application.discount_percentage}%</td>

                      <td>{application.max_seats}</td>

                      <td className="text-center">
                        <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() =>
                                showConfirmation(application.membership_id, 'approve')
                            }
                            disabled={isApproving || isRejecting}
                            >
                            Approve
                            </button>

                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                                showConfirmation(application.membership_id, 'reject')
                            }
                            disabled={isApproving || isRejecting}
                            >
                            Reject
                            </button>
                      </td>
                    </tr>
                  ))
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
        onClose={closePopup}
        onConfirm={
            popupAction ? handlePopupConfirm : null
        }
        confirmText={
            popupAction === 'approve'
            ? 'Yes, Approve'
            : 'Yes, Reject'
        }
        cancelText="Cancel"
        />
    </div>
  );
}

export default PendingRequest;

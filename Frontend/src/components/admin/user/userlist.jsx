
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '../../../features/userApi';

function UserList() {
  const navigate = useNavigate();
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("Notice");

  const currentUser = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const isAdmin = currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();

  
  const isOwnProfile = (user) =>
    Number(user.user_id) === Number(currentUser?.user_id);

  
  const visibleUsers =
    isAdmin || isManager ? users : [];

  
  const canEdit = (user) =>
  (isAdmin || isManager) && isOwnProfile(user);

 
  const canDelete = (user) => {
    if (isOwnProfile(user)) return false;

    if (isAdmin) return true;

    if (isManager && user.role === 'User') return true;

    return false;
  };

  function showMessage(title, message) {
    setPopupTitle(title);
    setPopupMessage(message);
    setShowPopup(true);
  }

const handleDelete = async (userId) => {
  setDeletingUserId(userId);

  try {
    await deleteUser(userId).unwrap();

    setShowPopup(true);
    setPopupTitle('Delete User');
    setPopupMessage('User deleted successfully!');
  } catch (err) {
    console.error('Delete error:', err);

    const message = err?.data?.message;

    setShowPopup(true);
    setPopupTitle('Delete Failed');
    setPopupMessage(
      Array.isArray(message)
        ? message.join(', ')
        : message || 'Failed to delete user.'
    );
  } finally {
    setDeletingUserId(null);
    setDeletingUserId(null);
  }
};


  
  if (!currentUser) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Please log in to continue.
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (!isAdmin && !isManager) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          You do not have permission to access User Management.
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-5">
        <p>Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Failed to load users.{' '}
          {error?.data?.message ||
            error?.error ||
            error?.status ||
            'Please check the backend and CORS settings.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0">
            User Management
          </h2>
          <p className="text-muted mb-0">
            Manage all system users
          </p>
        </div>

        <div className="d-flex gap-2">
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/add-user')}
            >
              + Add User
            </button>
          )}

           <button
          type="button"
          className="btn btn-danger d-flex align-items-center justify-content-center p-0"
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "6px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
          aria-label="Close"
          onClick={() => navigate('/admin-dashboard')}
        >
          ×
        </button>
        </div>
      </div>

  
      <div className="card shadow-sm">
        <div
          className="card-header text-white"
          style={{ backgroundColor: '#1e293b' }}
        >
          <h5 className="mb-0">
            All Users
          </h5>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>

                      <td>
                        <strong>{user.name}</strong>
                      </td>

                      <td>{user.email}</td>

                      <td>{user.phone || '-'}</td>

                      <td>
                        <span className="badge bg-secondary"
                      style={{
                        width: "80px",
                        display: "inline-block",
                        textAlign: "center",
                        padding:"10px"
                      }}>
                          {user.role}
                        </span>
                      </td>

                      <td>
                        {canEdit(user) && (
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              navigate(
                                `/edit-user/${user.user_id}`
                              )
                            }
                          >
                            Edit My Profile
                          </button>
                        )}

                        
                          {canDelete(user) && (
                            <button
                              className="btn btn-sm btn-danger"
                              disabled={deletingUserId !== null}
                              onClick={() => handleDelete(user.user_id)}
                            >
                              {deletingUserId === user.user_id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          )}


                        {!canEdit(user) &&
                          !canDelete(user) && (
                            <span className="text-muted">
                              View only
                            </span>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showPopup && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">{popupTitle}</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPopup(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p className="mb-0">{popupMessage}</p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowPopup(false)}
                >
                  OK
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;


import React from 'react';

function AdminDashboard() {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Users</h5>
              <p className="card-text">
                View and manage system users.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/user-list'}
              >
                View Users
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Movies</h5>
              <p className="card-text">
                View and Edit Movie.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/movie-list'}
              >
                View Movies
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Halls</h5>
              <p className="card-text">
                 Add and delete cinema halls.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/movie-hall'}
              >
                View Halls
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Seats</h5>
              <p className="card-text">
                Add, edit and delete cinema seats.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/seat-list'}
              >
                View Seats
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Bookings</h5>
              <p className="card-text">
                View and edit customer bookings.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/booking-list'}
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
         <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Coupons</h5>
              <p className="card-text">
                View and Delete customer coupons.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/coupons-list'}
              >
                View Coupons
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Manage Memberships</h5>
              <p className="card-text">
                Add, edit and delete customer memberships.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/membership-list'}
              >
                View Memberships
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useGetMembershipByIdQuery,
    useUpdateMembershipMutation
} from '../../../features/membershipApi';

import { useGetUsersQuery } from '../../../features/userApi';
import Popup from '../../../features/Popup';

function EditMembership() {

    const navigate = useNavigate();
    const { membership_id } = useParams();

    
    const {
        data: membership,
        isLoading,
        isError
    } = useGetMembershipByIdQuery(membership_id);

    
    const {
        data: users = [],
        isLoading: usersLoading,
        isError: usersError
    } = useGetUsersQuery();

    
    const [
        updateMembership,
        { isLoading: isUpdating }
    ] = useUpdateMembershipMutation();

    const [userId, setUserId] = useState('');
    const [status, setStatus] = useState('Active');
    const [membershipType, setMembershipType] = useState('Cinema Club');
    const [membershipDiscount, setMembershipDiscount] = useState('5');
    const [maxSeats, setMaxSeats] = useState('10');
    const [startDate, setStartDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('info');
    const [isSuccess, setIsSuccess] = useState(false);

    
    const customers = Array.isArray(users)
        ? users.filter(user =>
            ['customer', 'user'].includes(
                String(user.role).toLowerCase()
            )
        )
        : [];

    
    useEffect(() => {

        if (membership) {

            setUserId(String(membership.user_id ?? ''));

            setMembershipType(
                membership.membership_type || 'Cinema Club'
            );

            setMembershipDiscount(
                String(membership.discount_percentage ?? 5)
            );

            setMaxSeats(
                String(membership.max_seats ?? 10)
            );
            setStatus(membership.status || 'Active');

            setStartDate(
                membership.start_date
                    ? String(membership.start_date).split('T')[0]
                    : ''
            );

            setExpiryDate(
                membership.expiry_date
                    ? String(membership.expiry_date).split('T')[0]
                    : ''
            );
        }

    }, [membership]);

  
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await updateMembership({
            membership_id: Number(membership_id),
            user_id: Number(userId),
            membership_type: membershipType,
            discount_percentage: Number(membershipDiscount),
            max_seats: Number(maxSeats),
            status: status,
            start_date: startDate,
            expiry_date: expiryDate
        }).unwrap();

        
        setPopupTitle('Success');
        setPopupMessage('membership update successfully!');
        setPopupType('success');
        setIsSuccess(true);
        setShowPopup(true);

    } catch (error) {
        console.error('Update Error:', error);
        alert('Membership update failed!');
    }
};
    
    if (isLoading) {
        return (
            <div className="container mt-4">
                <p>Loading membership details...</p>
            </div>
        );
    }

    
    if (isError || !membership) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    Failed to load membership details.
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/membership-list')}
                >
                    Back
                </button>
            </div>
        );
    }

    return (

        <div className="container-fluid py-4 px-3 px-md-4">

            <div className="mb-4">

                <h3 className="fw-bold mb-1">
                    Edit Membership
                </h3>

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                {errorMessage && (
                    <div className="alert alert-danger">
                        {errorMessage}
                    </div>
                )}

                <p className="text-muted mb-0">
                    Edit customer membership
                </p>

            </div>

            <div className="card border-0 shadow-sm">

                <div className="card-header bg-white py-3">

                    <h5 className="fw-bold mb-0">
                        Membership Information
                    </h5>

                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleSubmit}>

                        <div className="row g-4">

                            
                            <div className="col-12 col-md-6">

                                <label className="form-label fw-semibold">
                                    Select Customer Name
                                </label>

                                <select
                                    className="form-select"
                                    value={userId}
                                    onChange={(e) =>
                                        setUserId(e.target.value)
                                    }
                                    required
                                    disabled={usersLoading || usersError}
                                >

                                    <option value="">
                                        Choose Customer
                                    </option>

                                    {customers.map((customer) => (

                                        <option
                                            key={customer.user_id}
                                            value={customer.user_id}
                                        >
                                            {customer.name}
                                        </option>

                                    ))}

                                </select>

                                {usersLoading && (
                                    <small className="text-primary">
                                        Loading customers...
                                    </small>
                                )}

                                {usersError && (
                                    <small className="text-danger">
                                        Failed to load customers.
                                    </small>
                                )}

                                {!usersLoading &&
                                    !usersError &&
                                    customers.length === 0 && (
                                        <small className="text-danger">
                                            No customers found.
                                        </small>
                                    )}

                            </div>

                            
                            <div className="col-12 col-md-6">

                                <label className="form-label fw-semibold">
                                    Select Membership Type
                                </label>

                                <select
                                    className="form-select"
                                    value={membershipType}
                                    onChange={(e) =>
                                        setMembershipType(e.target.value)
                                    }
                                    required
                                >

                                    <option value="Cinema Club">
                                        Cinema Club
                                    </option>

                                    <option value="Member">
                                        Member
                                    </option>

                                    <option value="Premium">
                                        Premium
                                    </option>

                                </select>

                            </div>

                            
                            <div className="col-12 col-md-6">

                                <label className="form-label fw-semibold">
                                    Membership Discount (%)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter discount percentage"
                                    min="0"
                                    max="100"
                                    value={membershipDiscount}
                                    onChange={(e) =>
                                        setMembershipDiscount(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            
                            <div className="col-12 col-md-6">

                                <label className="form-label fw-semibold">
                                    Maximum Seats
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter maximum seats"
                                    min="1"
                                    value={maxSeats}
                                    onChange={(e) =>
                                        setMaxSeats(e.target.value)
                                    }
                                    required
                                />

                            </div>
                            <div className="mb-3">
                                <label className="form-label">Status</label>

                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>
                                                        
                            <div className="col-12 col-md-6">

                                <label className="form-label fw-semibold">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);

                                        if (
                                            expiryDate &&
                                            expiryDate < e.target.value
                                        ) {
                                            setExpiryDate('');
                                        }
                                    }}
                                    required
                                />

                            </div>

                            
                            <div className="col-12 col-md-6">

                                <label className="form-label fw-semibold">
                                    Expiry Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    min={startDate || undefined}
                                    value={expiryDate}
                                    onChange={(e) =>
                                        setExpiryDate(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>

                        
                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">

                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={() =>
                                    navigate('/membership-list')
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={
                                    isUpdating ||
                                    usersLoading ||
                                    customers.length === 0
                                }
                            >

                                <i className="bi bi-save me-2"></i>

                                {isUpdating
                                    ? 'Updating...'
                                    : 'Update Membership'}

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
                    navigate('/membership-list');
                }
                }}
            />

        </div>
    );
}

export default EditMembership;


import React, { useState,useEffect } from 'react';
import EmailInput from '../../../features/emailValidation';
import PasswordValidation from '../../../features/passwordValidation';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '../../../features/userApi'


function EditUser() {

  const { user_id } = useParams();
  
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByIdQuery(user_id);

  const [
    updateUser,
    { isLoading: isUpdating, error: updateError },
  ] = useUpdateUserMutation();
  
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );
  const isAdmin = currentUser?.role === 'Admin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  

  useEffect(()=>{
    if(user){
      setName(user.name?? "");
      setEmail(user.email ?? "");
      
      setPassword("");
      setPhone(user.phone ?? "");
      setRole(user.role ?? "");
    }
  },[user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedUser = {
      user_id: Number(user_id),
      name,
      email,
      
      phone,
      role,
    };

    
    if (password.trim()) {
      updatedUser.password = password;
    }

    try {
      await updateUser(updatedUser).unwrap();
      navigate("/user-list");
    } catch (error) {
      console.error("Failed to update user:", error);
    }
    
  };
  if (isLoading) {
    return <div className="container py-5">Loading user...</div>;
  }

  if (isError || !user) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          User not found or failed to load user.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-dark py-4">
      <div
        className="card shadow-lg p-4"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div className="card-body">
          <h2 className="text-center text-primary mb-4">
            Edit New User
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
              />
            </div>

            <div>
                <label>Enter Email</label>
                <EmailInput
                email={email}
                setEmail={setEmail}
            />
            </div>
            
            

            <div>
                <label>Enter Password</label>
                <PasswordValidation
                password={password}
                setPassword={setPassword}
            />
            </div>


            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                placeholder="Enter Your Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-control"
              />
            </div>
            {isAdmin && (
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            )}
            {updateError && (
                  <div className="alert alert-danger">
                    Update failed. Check the email and backend response.
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning flex-grow-1"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update User"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/user-list")}
                  >
                    Cancel
                  </button>
                </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUser;

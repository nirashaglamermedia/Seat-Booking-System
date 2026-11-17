
import React, { useState } from 'react';
import EmailInput from '../../../features/emailValidation';
import PasswordValidation from '../../../features/passwordValidation';
import { useAddUserMutation } from '../../../features/userApi'
import { useNavigate } from 'react-router-dom';



function AddUser() {
  const navigate= useNavigate();

   const [addUser, { isLoading }] = useAddUserMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();

    setError('');
    
    if (!['Admin', 'Manager'].includes(role)) {
      setError('Please select Admin or Manager role.');
      return;
    }
    try {
      await addUser({
        name,
        email,
        password,
        phone,role
      }).unwrap();
      navigate('/user-list')
    } catch (error) {
      const message=error?.data?.message;

      setError(
        Array.isArray(message)
        ?message.join(',')
        :message||'Unable to creae user',
      );
    } 
    

    
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-dark py-4">
      <div
        className="card shadow-lg p-4"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div className="card-body">
          <h2 className="text-center text-primary mb-4">
            Add New User
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
            
            <div className="mb-3">
              <label className="form-label">Username</label>
              <EmailInput
                    email={email}
                    setEmail={setEmail}/>
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

            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value=""> </option>
                
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            

             <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Add User'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/user-list')}
                  >   Cancel
                  </button>
                </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;

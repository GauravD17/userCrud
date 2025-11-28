import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';

function Home() {
  const [state, setState] = useState({
    users: [],
    editingId: null,
    editEmail: "",
    editPass: "",
    currentUser: null
  })
  
  const Api = "http://localhost:3000";
  const navigate = useNavigate();

  // Get users from backend
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(Api + "/user");
     
        if (response.data.success && response.data.data) {
          const usersList = response.data.data.users || response.data.data;
          setState(prev => ({ 
            ...prev, 
            users: Array.isArray(usersList) ? usersList : [] 
          }));
        } else {
          setState(prev => ({ ...prev, users: [] }));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setState(prev => ({ ...prev, users: [] }));
      }
    };
    getData();
  }, []);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsedUser = JSON.parse(storedUser);
        setState(prev => ({ ...prev, currentUser: parsedUser }));
      } else {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAdmin');
        navigate('/');
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isAdmin');
      navigate('/');
    }
  }, [navigate]);

  async function onDeleteClick(id) {
    if (!state.currentUser?.isAdmin) {
      alert("Access Denied: Only admins can delete users");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(Api + "/delete/" + id, {
          data: {
            userId: state.currentUser._id,
            isAdmin: state.currentUser.isAdmin
          }
        });

        if (response.data.success) {
          setState(prev => ({
            ...prev,
            users: prev.users.filter((u) => u._id !== id)
          }));
          alert("User deleted successfully");
        } else {
          alert(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  }

  function startEdit(user) {
    if (!state.currentUser?.isAdmin) {
      alert("Access Denied: Only admins can edit users");
      return;
    }
    setState(prev => ({
      ...prev,
      editingId: user._id,
      editEmail: user.email,
      editPass: ""
    }));
  }

  function cancelEdit() {
    setState(prev => ({
      ...prev,
      editingId: null,
      editEmail: "",
      editPass: ""
    }));
  }

  async function onSaveClick(id) {
    if (!state.currentUser?.isAdmin) {
      alert("Access Denied: Only admins can update users");
      return;
    }

    if (!state.editEmail.trim()) {
      alert("Email cannot be empty");
      return;
    }

    try {
      const updateData = {
        userId: state.currentUser._id,
        isAdmin: state.currentUser.isAdmin
      };

      if (state.editEmail !== state.users.find(u => u._id === id)?.email) {
        updateData.email = state.editEmail;
      }

      if (state.editPass.trim()) {
        updateData.password = state.editPass;
      }

      const response = await axios.put(Api + "/update/" + id, updateData);

      if (response.data.success) {
        setState(prev => ({
          ...prev,
          users: prev.users.map((u) =>
            u._id === id ? { ...u, email: state.editEmail } : u
          ),
          editingId: null,
          editEmail: "",
          editPass: ""
        }));
        alert("User updated successfully");
      } else {
        alert(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Error updating user");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAdmin');
    setState(prev => ({ ...prev, currentUser: null }));
    navigate('/');
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <h1>User Management</h1>
          <p>Manage all registered users</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {state.currentUser && (
            <>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {state.currentUser.email}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: state.currentUser.isAdmin ? '#10b981' : '#6b7280',
                  fontWeight: 'bold' 
                }}>
                  {state.currentUser.isAdmin ? '👑 Admin' : '👤 User'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {!state.currentUser?.isAdmin && (
        <div style={{
          padding: '12px',
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          marginBottom: '20px',
          color: '#92400e'
        }}>
          ⚠️ You are logged in as a regular user. Only admins can edit or delete users.
        </div>
      )}

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Password</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.users.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">No users found</td>
              </tr>
            ) : (
              state.users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {state.editingId === user._id ? (
                      <input
                        type="email"
                        className="edit-input"
                        value={state.editEmail}
                        onChange={(e) => setState(prev => ({ 
                          ...prev, 
                          editEmail: e.target.value 
                        }))}
                        placeholder="Enter new email"
                      />
                    ) : (
                      <span className="user-email">{user.email}</span>
                    )}
                  </td>
                  <td>
                    {state.editingId === user._id ? (
                      <input
                        type="password"
                        className="edit-input"
                        value={state.editPass}
                        onChange={(e) => setState(prev => ({ 
                          ...prev, 
                          editPass: e.target.value 
                        }))}
                        placeholder="Enter new password (optional)"
                      />
                    ) : (
                      <span className="password-mask">••••••••</span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: user.isAdmin ? '#d1fae5' : '#e5e7eb',
                      color: user.isAdmin ? '#065f46' : '#374151'
                    }}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {state.editingId === user._id ? (
                        <>
                          <button
                            className="btn btn-save"
                            onClick={() => onSaveClick(user._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-cancel"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-edit"
                            onClick={() => startEdit(user)}
                            disabled={!state.currentUser?.isAdmin}
                            style={{
                              opacity: state.currentUser?.isAdmin ? 1 : 0.5,
                              cursor: state.currentUser?.isAdmin ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => onDeleteClick(user._id)}
                            disabled={!state.currentUser?.isAdmin}
                            style={{
                              opacity: state.currentUser?.isAdmin ? 1 : 0.5,
                              cursor: state.currentUser?.isAdmin ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
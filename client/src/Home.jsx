import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';

function Home() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPass, setEditPass] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const Api = "http://localhost:3000";
  const navigate = useNavigate();

  
  
  useEffect(() => {
    const getData = async () => {
      try {
        const userDetails = await axios.get(Api + "/user");
        setUsers(userDetails.data);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  
useEffect(() => {
  const getData = async () => {
    try {
      const userDetails = await axios.get(Api + "/user");
      setUsers(userDetails.data);
    } catch (error) {
      console.log(error);
    }
  };
  getData();
}, []);

// ADD THIS NEW useEffect HERE:
useEffect(() => {
  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    setCurrentUser(JSON.parse(storedUser));
  } else {
    // If no user is logged in, redirect to login page
    navigate('/');
  }
}, [navigate]);

  async function onDeleteClick(id) {
    if (!currentUser?.isAdmin) {
      alert("Access Denied: Only admins can delete users");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(Api + "/delete/" + id, {
          data: {
            userId: currentUser._id,
            isAdmin: currentUser.isAdmin
          }
        });

        if (response.data.success) {
          setUsers((prev) => prev.filter((u) => u._id !== id));
          alert("User deleted successfully");
        } else {
          alert(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  }

  // START EDITING (ADMIN ONLY)
  function startEdit(user) {
    if (!currentUser?.isAdmin) {
      alert("Access Denied: Only admins can edit users");
      return;
    }
    setEditingId(user._id);
    setEditEmail(user.email);
    setEditPass("");
  }

  // CANCEL EDITING
  function cancelEdit() {
    setEditingId(null);
    setEditEmail("");
    setEditPass("");
  }

  // SAVE UPDATE (ADMIN ONLY)
  async function onSaveClick(id) {
    if (!currentUser?.isAdmin) {
      alert("Access Denied: Only admins can update users");
      return;
    }

    try {
      const response = await axios.put(Api + "/update/" + id, {
        email: editEmail,
        password: editPass,
        userId: currentUser._id,
        isAdmin: currentUser.isAdmin
      });

      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, email: editEmail } : u
          )
        );
        setEditingId(null);
        setEditEmail("");
        setEditPass("");
        alert("User updated successfully");
      } else {
        alert(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error updating user");
    }
  }

  // LOGOUT
  function handleLogout() {
    sessionStorage.removeItem('user');
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
          {currentUser && (
            <>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {currentUser.email}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: currentUser.isAdmin ? '#10b981' : '#6b7280',
                  fontWeight: 'bold' 
                }}>
                  {currentUser.isAdmin ? '👑 Admin' : '👤 User'}
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
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {!currentUser?.isAdmin && (
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
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {editingId === user._id ? (
                      <input
                        type="email"
                        className="edit-input"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter new email"
                      />
                    ) : (
                      <span className="user-email">{user.email}</span>
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <input
                        type="password"
                        className="edit-input"
                        value={editPass}
                        onChange={(e) => setEditPass(e.target.value)}
                        placeholder="Enter new password"
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
                      {editingId === user._id ? (
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
                            disabled={!currentUser?.isAdmin}
                            style={{
                              opacity: currentUser?.isAdmin ? 1 : 0.5,
                              cursor: currentUser?.isAdmin ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => onDeleteClick(user._id)}
                            disabled={!currentUser?.isAdmin}
                            style={{
                              opacity: currentUser?.isAdmin ? 1 : 0.5,
                              cursor: currentUser?.isAdmin ? 'pointer' : 'not-allowed'
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
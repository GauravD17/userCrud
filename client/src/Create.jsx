import { useState } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Create.css'

function Create() {  
  const [formState, setFormState] = useState({
    isLogin: true,
    email: "",
    password: "",
    message: ""
  })
  
const Api = process.env.REACT_APP_API_URL;

  const navigate = useNavigate()

  function onEmailChange(e) {
    setFormState(prev => ({ ...prev, email: e.target.value }))
  }
    
  function onPasswordChange(e) {
    setFormState(prev => ({ ...prev, password: e.target.value }))
  }

  async function onFormSubmit(e) {
    e.preventDefault()
    setFormState(prev => ({ ...prev, message: "" }))
    
    try {
      const endpoint = formState.isLogin ? '/login' : '/register'
      const response = await axios.post(Api + endpoint, {
        email: formState.email,
        password: formState.password
      })
      
      if (response.data.success === false) {
        setFormState(prev => ({ ...prev, message: response.data.message }))
      } else if (formState.isLogin && response.data.success) {
     
        sessionStorage.setItem('user', JSON.stringify(response.data.data))
        
        setFormState(prev => ({ ...prev, message: "Login successful!" }))
        setTimeout(() => {
          navigate('/home')
        }, 500)
        setFormState(prev => ({ ...prev, email: "", password: "" }))
      } else {
        setFormState(prev => ({ 
          ...prev, 
          message: "Registration successful! Please login.",
          email: "",
          password: "",
          isLogin: true
        }))
      }
    } catch (error) {
      setFormState(prev => ({ ...prev, message: "An error occurred. Please try again." }))
      console.log(error)
    }
  }

  function switchMode() {
    setFormState(prev => ({
      ...prev,
      isLogin: !prev.isLogin,
      message: "",
      email: "",
      password: ""
    }))
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="toggle-buttons">
          <button
            onClick={() => setFormState(prev => ({ ...prev, isLogin: true }))}
            className={`toggle-btn ${formState.isLogin ? 'active' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setFormState(prev => ({ ...prev, isLogin: false }))}
            className={`toggle-btn ${!formState.isLogin ? 'active' : ''}`}
          >
            Register
          </button>
        </div>

        <div className="form-content">
          <h2 className="form-title">
            {formState.isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="form-subtitle">
            {formState.isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </p>

          <form onSubmit={onFormSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={formState.email}
                onChange={onEmailChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={formState.password}
                onChange={onPasswordChange}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            {formState.message && (
              <div className={`message ${formState.message.includes('successful') ? 'success' : 'error'}`}>
                {formState.message}
              </div>
            )}

            <button type="submit" className="submit-btn">
              {formState.isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="switch-mode">
            <p>
              {formState.isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={switchMode} className="switch-btn">
                {formState.isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Create
import { useState } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Create.css'

function Create() {  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const Api = "http://localhost:3000"
  const navigate = useNavigate()



  function onEmailChange(e) {
    setEmail(e.target.value)
  }
    
  function onPasswordChange(e) {
    setPassword(e.target.value)
  }

  async function onFormSubmit(e) {
  e.preventDefault()
  setMessage("")
  
  try {
    const endpoint = isLogin ? '/login' : '/register'
    const response = await axios.post(Api + endpoint, {
      email,
      password
    })
    
    if (response.data.success === false) {
      setMessage(response.data.message)
    } else if (isLogin && response.data.success) {
      // Store user data in sessionStorage - UNCOMMENT THIS!
      sessionStorage.setItem('user', JSON.stringify(response.data.user))
      
      setMessage("Login successful!")
      setTimeout(() => {
        navigate('/home')
      }, 500)
      setEmail("")
      setPassword("")
    } else {
      setMessage("Registration successful! Please login.")
      setEmail("")
      setPassword("")
      setIsLogin(true)
    }
  } catch (error) {
    setMessage("An error occurred. Please try again.")
    console.log(error)
  }
}

  function switchMode() {
    setIsLogin(!isLogin)
    setMessage("")
    setEmail("")
    setPassword("")
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="toggle-buttons">
          <button
            onClick={() => setIsLogin(true)}
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
          >
            Register
          </button>
        </div>

        <div className="form-content">
          <h2 className="form-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="form-subtitle">
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </p>

          <form onSubmit={onFormSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
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
                value={password}
                onChange={onPasswordChange}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            {message && (
              <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="switch-mode">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={switchMode} className="switch-btn">
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Create
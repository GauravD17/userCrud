import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Create from './Create'
import Home from './Home'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
function App() {


  return (
   <Router>
      <Routes>
        <Route path="/" element={<Create />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>

  )
}

export default App

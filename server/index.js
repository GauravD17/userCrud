import express from 'express'
import cors from 'cors'
import crudModel from './crud.js'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'



const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/crud')

// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}



class UserExits extends AppError {
  constructor(message = "User already exists!") {
    super(message, 422)
  }
}

class UserNotFoundError extends AppError {
  constructor(message = "User not found") {
    super(message, 404)
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden: Admin access required") {
    super(message, 403)
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500)
  }
}

// Success Response Class
class SuccessResponse {
  constructor(message, data = {}, statusCode = 200) {
    this.success = true
    this.message = message
    this.data = data
    this.statusCode = statusCode
  }
}

// GET all users
app.get('/user', async (req, res, next) => {
  try {
    const getUser = await crudModel.find().select('-password')
    
    const response = new SuccessResponse(
      "Users retrieved successfully",
      { users: getUser, count: getUser.length }
    )
    
    res.status(response.statusCode).json(response)
  } catch (error) {
    next(new DatabaseError("Failed to retrieve users"))
  }
})

// REGISTER new user
app.post('/register', async (req, res, next) => {
  try {
    const { email, password, Admin } = req.body

    // Validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required")
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format")
    }

    // Check if user already exists
    const existingUser = await crudModel.findOne({ email })
    if (existingUser) {
      throw new UserExits("User with this email already exists")
    }

    // Hash password and create user
    const hashPass = await bcrypt.hash(password, 10)
    const newUser = await crudModel.create({
      email: email,
      password: hashPass,
      isAdmin: Admin || false
    })

    const response = new SuccessResponse(
      "User registered successfully",
      {
        _id: newUser._id,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      },
      201
    )

    res.status(response.statusCode).json(response)

  } catch (error) {
    next(error)
  }
})

// LOGIN user
app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required")
    }

    // Find user
    const user = await crudModel.findOne({ email })
    if (!user) {
      throw new UserNotFoundError("Invalid email or password")
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      throw new UnauthorizedError("Invalid email or password")
    }

    const response = new SuccessResponse(
      "Login successful",
      {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    )

    res.status(response.statusCode).json(response)

  } catch (error) {
    next(error)
  }
})

// Middleware to check admin access
function checkAdmin(req, res, next) {
  try {
    const { userId, isAdmin } = req.body

    if (!userId) {
      throw new UnauthorizedError("User not authenticated")
    }

    if (!isAdmin) {
      throw new ForbiddenError("Admin access required")
    }

    next()
  } catch (error) {
    next(error)
  }
}

// UPDATE user
app.put("/update/:id", checkAdmin, async (req, res, next) => {
  try {
    const id = req.params.id
    const { email, password } = req.body

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid user ID format")
    }

    // Check if there's anything to update
    if (!email && !password) {
      throw new ValidationError("No update data provided")
    }

    // Build update object
    let updateData = {}
    
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format")
      }
      
      // Check if email already exists for another user
      const existingUser = await crudModel.findOne({ email, _id: { $ne: id } })
      if (existingUser) {
        throw new UserExits("Email already in use by another user")
      }
      
      updateData.email = email
    }
    
    if (password) {
      if (password.length < 6) {
        throw new ValidationError("Password must be at least 6 characters long")
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    // Update user
    const updatedUser = await crudModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!updatedUser) {
      throw new UserNotFoundError("User not found")
    }

    const response = new SuccessResponse(
      "User updated successfully",
      updatedUser
    )

    res.status(response.statusCode).json(response)

  } catch (error) {
    next(error)
  }
})

// DELETE user
app.delete('/delete/:id', checkAdmin, async (req, res, next) => {
  try {
    const id = req.params.id

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid user ID format")
    }

    const deletedUser = await crudModel.findByIdAndDelete(id)

    if (!deletedUser) {
      throw new UserNotFoundError("User not found")
    }

    const response = new SuccessResponse(
      "User deleted successfully",
      {
        _id: deletedUser._id,
        email: deletedUser.email
      }
    )

    res.status(response.statusCode).json(response)
    
  } catch (error) {
    next(error)
  }
})

// 404 Route Not Found Handler
app.use((req, res, next) => {
  const error = new AppError("Route not found", 404)
  next(error)
})

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  const message = err.message || "Internal Server Error"

 
  if (status === 500) {
    console.error('Error:', err)
  }

  return res.status(status).json({
    success: false,
    message: message,
   
  })
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
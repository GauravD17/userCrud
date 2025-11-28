import mongoose from 'mongoose';

const crudSchema = new mongoose.Schema({
    email: {
        type: String,
        //validation
        required: [true, 'email is required'],
        unique: true,
        lowercase:true,
        trim:true,
       match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ]
    },
    password: {
        type: String,
        //validation
        minlength:[6 ,'password must be greater than six characters'],
        required: [true, 'password is required']
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const crudModel = mongoose.model('User', crudSchema);

export default crudModel;
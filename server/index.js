import express from 'express'
import cors from 'cors'
import crudModel from './crud.js'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose';

const app  = express();
const port  = 3000;

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/crud');

app.get('/user',async (req,res)=>{
    try {
        const getUser  =  await crudModel.find();
        console.log(getUser)
        res.json(getUser)
    } catch (error) {
       console.log(error)       
    }
})




app.post('/register',async (req,res)=>{
    try {

       const email  =  req.body.email
       const password =  req.body.password
       const isAdmin = req.body.Admin
const user  = await crudModel.findOne({email})
if(user) {
    res.json({message:"user exits!", data:email})
return;
} else{
const hashPass = await  bcrypt.hash(password,10)

  const sendData  =  await crudModel.create({
            email:email,
            password:hashPass,
            isAdmin: isAdmin     
        })
       console.log(sendData);
    }
 
        
    } catch (error) {
 console.log(error);
        
    }
})

app.post('/login',async (req,res)=>{
    try {
         const { email, password } = req.body; 
        const user   = await crudModel.findOne({email})
  if(!user) {
  return res.json({ success: false, message: "User not found" });
  }

  //comapre
      const match = await bcrypt.compare(password, user.password);
        if (!match) {
      return res.json({ success: false, message: "Password is incorrect" });
    }
    return res.json({
        success:true,
        message: "Login successful",
        user: user,
         isAdmin: user.isAdmin || false
    })

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
        console.log(error);
        
    }
})


function checkAdmin(req, res, next) {
    const { userId, isAdmin } = req.body;
    
    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized: User not authenticated" 
        });
    }
    
    if (!isAdmin) {
        return res.status(403).json({ 
            success: false, 
            message: "Forbidden: Admin access required" 
        });
    }
    
    next();
}


app.put("/update/:id", checkAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { email, password } = req.body;


    let updateData = { email };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    
    const updatedUser = await crudModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated", data: updatedUser });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});




app.delete('/delete/:id', checkAdmin, async (req,res)=>{
  try {
    const id = req.params.id
    // WRONG: findOneAndDelete expects an object, not just the ID
    const deleteData = await crudModel.findByIdAndDelete(id) // Change this line
    
    if (!deleteData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    res.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });  
  }
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
    
})





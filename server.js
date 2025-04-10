const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const authRoutes=require('./routes/auth')
const taskRoutes=require('./routes/tasks')

const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/taskdb')
.then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

app.use('/api/auth',authRoutes)
app.use('/api/tasks',taskRoutes)

app.listen(5000,()=>console.log("Server running on 5000" ))
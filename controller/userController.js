import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bycrypt from "bcrypt"
import validator from "validator"

// Login User
const loginUser = async (req, res)=>{
    const {email, password} = req.body
    try {

        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false, message:"User Doesn't exist"})
        }

        const isMatch = await bycrypt.compare(password,user.password)

        if(!isMatch){
            return res.json({success:false, message:"Invalid credentials"})
        }

        const token = createToken(user._id);
        res.json({success:true, token})

    } catch (error) {
        console.log(error)
        res.json({success: false, message:"error"})
    }

}

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

// Register User
const registerUser = async (req,res)=>{
    const {name, password, email} = req.body;

    try {
        // Checking if the user already exists
        const exist = await userModel.findOne({email})
        if(exist){
            return res.json({success:false, message:"User already exists"})
        }

        // Validationg email format and strong password
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Please enter a valid email"})
        }

        if(password.length<8){
            return res.json({success:false, message:"Please enter a strong password"})
        }

        // Hashing user password
        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(password, salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true, token})
        
    
    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}


export {loginUser, registerUser}
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const transporter = require('../config/emailConfig')

const register = async (req,res) =>{
    const {name, email, password, confirm_password} = req.body
    const user = await userModel.findOne({email})
    if(user){
        return res.status(400).json({message: "User already exists"})
    } else{
        if(name && email && password && confirm_password){
            if(password === confirm_password){
                try {
                    const salt = await bcrypt.genSalt(10)
                    const hashedPassword = await bcrypt.hash(password, salt)
                    const user = new userModel({
                        name : name,
                        email : email,
                        password: hashedPassword
                    })
                    await user.save()
                    const saved_user = await userModel.findOne({email})
                    const token = jwt.sign({userID: saved_user._id}, process.env.JWT_SECRET, {expiresIn: '15m'})
                    res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
                } catch (error) {
                    console.log(error)
                    res.status(500).json({"status" : "failed" ,message: "Registration failed"})
                }

            } else{
                res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
            }
        } else{
            res.send({ "status": "failed", "message": "All fields are required" })
        }
    }
}

const login = async (req,res) =>{
    try {
        const {email, password} = req.body
        if(email && password){
            const user = await userModel.findOne({email})
            if(user != null){
                const isMatch = await bcrypt.compare(password, user.password)
                if(user.email === email && isMatch){
                    const token = jwt.sign({userID : user._id}, process.env.JWT_SECRET, {expiresIn: '15m'})
                    res.status(200).send({ "status": "success", "message": "Login Success", "token": token })
                } else{
                    res.send({ "status": "failed", "message": "Email or Password is not valid" })
                }
            } else{
                res.send({ "status": "failed", "message": "You are not registered user" })
            }
        } else{
            res.send({ "status": "failed", "message": "All fields are required" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({"status" : "failed" ,message: "Login failed"})
    }
}

const changeUserPassword = async (req,res) =>{
    const {password, confirm_password} = req.body
    if(password && confirm_password){
        if(password !== confirm_password){
            res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else{
            const salt = await bcrypt.genSalt(10)
            const newHashedPassword = await bcrypt.hash(password,salt)
            await userModel.findManyAndUpdate({_id:req.userID}, {$set: {password: newHashedPassword}})
            res.send({ "status": "success", "message": "Password changed successfully" })
        }
    } else{
        res.send({ "status": "failed", "message": "All fields are required" })
    }
}

const loggedUser = async (req,res) =>{
    res.send({"user": req.user})
}

const sendPasswordResetEmail = async (req,res) => {
    const {email} = req.body
    if(email){
        const user = await userModel.findOne({email:email})
        if(user){
            const secret = user._id + process.env.JWT_SECRET
            const token = jwt.sign({userID: user._id}, secret, {expiresIn: '15m'})
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link)
            let info = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "GeekShop - Password Reset Link",
                html: `<a href = ${link}>Click Here</a> to Reset Your Password`
            })
            console.log("MAIL INFO:", info);
            res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })
        } else{
            res.send({ "status": "failed", "message": "Email doesn't exist" })
        }
    } else{
        res.send({ "status": "failed", "message": "Email field is required" })
    }
}

const resetUserPassword = async (req,res) =>{
    const {password, confirm_password} = req.body
    const {id,token} = req.params
    const user = await userModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET
    try {
        jwt.verify(token, new_secret)
        if(password && confirm_password){
            if(password !== confirm_password){
                res.status(400).send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
            } else{
                const salt = bcrypt.genSalt(10)
                const newHashedPassword = bcrypt.hash(password,salt)
                await userModel.findbyIdAndUpdate(user._id, {$set: {password:  newHashedPassword}})
                res.send({ "status": "success", "message": "Password Reset Successfully" })
            }
        } else{
            res.send({ "status": "failed", "message": "All fields are required" })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({ "status": "failed", "message": "Invalid Token" })
    }
}

module.exports = {
    register,
    login,
    changeUserPassword,
    loggedUser,
    sendPasswordResetEmail,
    resetUserPassword
}
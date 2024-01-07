const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const router = express.Router()
const User = require('../models/User')
const fetchuser = require('../middleware/fetchuser')

const key = process.env.SECRETKEY

router.post("/create-new-account", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const pass = await bcrypt.hash(req.body.password, salt)
        const newuser = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: pass
        })
        //creating new user account
        await newuser.save()
        return res.json({ success: true, authtoken: jwt.sign({ payload: newuser.id }, key) })
    } catch (e) {
        return res.status(400).json({ success: false, message: "Email already exists" })
    }
})


router.post("/login-into-account", async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json("Invalid credentials")
    } else {
        //else compare the passsowrd
        const passowordComparison = await bcrypt.compare(req.body.password, user.password)
        if (passowordComparison) {
            return res.status(200).json({ success: true, authtoken: jwt.sign({ payload: user.id }, key) })
        } else {
            return res.status(400).json({ error: "Try to login with valid credentials" })
        }
    }
})

router.post("/save-user-profile-picture", async (req, res) => {
    try {
        await User.updateOne({ email: req.body.email }, { profile_image: req.body.newImage }).then(() => {
            res.status(200).json({ success: true, message: "added profile successfully" })
        }).catch((e)=>{
            res.status(200).json({ success: false, message: e.message })
        })
    } catch (e) {
        res.status(400).json({ success: false, error: e.message })
    }
})


router.post("/get-user-data", fetchuser, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password")
        res.json({ user })
    } catch (e) {
        res.status(400).json({ error: e.message })
    }
})

router.post("/update-username", async (req, res) => {
    const newFirstName = req.body.firstName
    const newLastName = req.body.lastName
    const email = req.body.email
    console.log(req.body);
    try {
        await User.findOneAndUpdate({
            email : email
        },{
            firstname : newFirstName,
            lastname : newLastName
        },{new:true}).then((snapshot)=>{
            console.log(snapshot.firstname + " " + snapshot.lastname);
            res.status(200).json({msg:"username updated"})
        })
    } catch (e) {
        res.status(400).json({ error:e})
    }
})


router.post("/delete-account", async (req, res) => {
    const email = req.body.email
    try {
       await User.deleteOne({email:email}).then(()=>{
         res.status(200).json({success:true})
       })
    } catch (e) {
        res.status(400).json({ error: e.message })
    }
})

module.exports = router
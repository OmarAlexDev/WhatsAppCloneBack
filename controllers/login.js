const logger = require('../utils/logger')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/',async (req,res)=>{
    const {username,password} = req.body

    if(!(username && password)||(username && password)===""){
        return res.status(402).json({error: "Missing parameters"})
    }

    const existingUser = await User.findOne({username:username})
    if(!(existingUser&&await bcrypt.compare(password,existingUser.passwordHash))){
        return res.status(402).json({error:"Invalid credentials"})
    }

    const user ={
        username:existingUser.username,
        id:existingUser._id
    }

    const token = jwt.sign(user,config.SECRET,{expiresIn:60*60})
    res.status(200).send(
        {
            token:token,
            username:existingUser.username,
            id:existingUser._id.toString(), 
            state:existingUser.state, 
            profileImage:existingUser.profileImage})

})

module.exports = loginRouter
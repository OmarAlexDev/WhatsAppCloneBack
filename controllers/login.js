const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')
const tokenGenerator = require('../utils/tokenGenerator')

loginRouter.post('/',async (req,res)=>{
    const {username,password} = req.body

    if(!(username && password)||(username && password)===""){
        return res.status(402).json({error: "Missing parameters"})
    }

    const existingUser = await User.findOne({username:username})
    if(!(existingUser&&await bcrypt.compare(password,existingUser.passwordHash))){
        return res.status(402).json({error:"Invalid credentials"})
    }
    const sessionObject = tokenGenerator.generateToken(existingUser)

    res.status(200).send(sessionObject)

})

module.exports = loginRouter
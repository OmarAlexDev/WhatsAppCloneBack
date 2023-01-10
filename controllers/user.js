const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require ('../utils/config')
const logger = require('../utils/logger')
const User = require('../models/User')
const tokenGenerator = require('../utils/tokenGenerator')
const userRouter = require('express').Router()

userRouter.get('/',async (req,res)=>{
    const users = await User.find({})
    return res.json(users)
})

userRouter.get('/:id', async (req,res)=>{
    const user = await User.findById(req.params.id)
    return res.status(200).json(user)
})

userRouter.post('/', async (req,res)=>{
    const {username,password, rePassword} = req.body

    if(!(username && password && rePassword)||(username && password && rePassword)===""){
        return res.status(402).json({error: "Missing parameters"})
    }

    if(rePassword!==password){
        return res.status(401).json({error: "Passwords mismatch"})
    }

    if(await User.findOne({username:username})){
        return res.status(402).json({error:"Username already in use, register another one."})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = new User({
        username: username,
        passwordHash: passwordHash
    })

    const savedUser = await newUser.save()
    return res.status(200).json(savedUser)
})

userRouter.put('/:id',  async(req,res)=>{
    const {username, state, profileImage} = req.body
    const decodedToken = jwt.verify(req.token,config.SECRET)
    const existingUser = await User.findById(req.params.id)
    const usernameInUse = await User.findOne({username:username})

    if(!(username && state)||(username)===''){
        return res.status(402).json({error: "Missing parameters"})
    }else if(!existingUser){
        return res.status(402).json({error: "Nonexistent id"})
    }else if(decodedToken.id!==req.params.id){
        return res.status(402).json({error:"Unauthorized token access"})
    }else if(usernameInUse && usernameInUse._id.toString()!==existingUser._id.toString()){
        return res.status(402).json({error:"Username already in use"})
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id,{username:username,state:state, profileImage: profileImage},{new:true})
    await updatedUser.save()

    const sessionObject = tokenGenerator.generateToken(updatedUser)

    res.status(200).send(sessionObject)

})

userRouter.delete('/:id', async (req,res)=>{
    const userToDelete = await User.findById(req.params.id)
    if(!userToDelete){
        return res.status(400).json({error:"Nonexistent id"})
    }
    const deletion = await userToDelete.delete()
    return res.status(204).json({message:`Deleted user with id ${req.params.id}`})   
    
})

module.exports = userRouter
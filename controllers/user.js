const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const logger = require('../utils/logger')
const User = require('../models/User')
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

userRouter.delete('/:id', async (req,res)=>{
    const userToDelete = await User.findById(req.params.id)
    if(!userToDelete){
        return res.status(400).json({error:"Nonexistent id"})
    }
    const deletion = await userToDelete.delete()
    return res.status(204).json({message:`Deleted user with id ${req.params.id}`})   
    
})

module.exports = userRouter
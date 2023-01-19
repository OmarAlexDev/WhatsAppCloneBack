const chatRouter = require('express').Router()
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const Chat = require('../models/Chat')
const Message = require('../models/Message')
const User = require('../models/User')
const middleware = require('../utils/middleware')

chatRouter.get('/', async(req,res)=>{
    const chats = await Chat.find({}).populate('user1',{username:1,state:1,profileImage:1}).populate('user2',{username:1,state:1,profileImage:1}).populate('messages',{content:1,remittent:1,destinatary:1})
    return res.json(chats)
})

chatRouter.get('/:id', async(req,res)=>{
    const chat = await Chat.findByIdAndDelete(req.params.id).populate('user1',{username:1,state:1,profileImage:1}).populate('user2',{username:1,state:1,profileImage:1}).populate('messages',{content:1,remittent:1,destinatary:1})
    return res.json(chat)
})

chatRouter.get('/fromUser/:id/byUser/:destinataryId', async(req,res)=>{
    const decodedToken = jwt.verify(req.token,config.SECRET)
    if(decodedToken.id!==req.params.id){
        return res.status(402).json({error:"Unauthorized token access"})
    }

    const existingUser = await User.findById(req.params.id)
    const existingDestinatary = await User.findById(req.params.destinataryId)
    if(!(existingUser && existingDestinatary)){
        return res.status(402).json({error:"Nonexisting user id"})
    }

    const chat = await Chat.find({
        $or: [
            {user1:existingUser._id, user2: existingDestinatary._id},
            {user2:existingUser._id, user1: existingDestinatary._id}
        ]
    }).populate('user1',{username:1,state:1,profileImage:1}).populate('user2',{username:1,state:1,profileImage:1}).populate('messages',{content:1,remittent:1,destinatary:1,time:1,active:1})

    return res.json(chat[0])
})

chatRouter.get('/fromUser/:id', async(req,res)=>{
    const decodedToken = jwt.verify(req.token,config.SECRET)
    if(decodedToken.id!==req.params.id){
        return res.status(402).json({error:"Unauthorized token access"})
    }

    const existingUser = await User.findById(req.params.id)
    if(!existingUser){
        return res.status(402).json({error:"Nonexisting user id"})
    }
    const chats = await Chat.find({
        $or: [
            {user1:existingUser._id},
            {user2:existingUser._id}
        ]
    }).populate('user1',{username:1,state:1,profileImage:1}).populate('user2',{username:1,state:1,profileImage:1}).populate('messages',{content:1,remittent:1,destinatary:1,time:1,active:1})
    return res.json(chats)
})

chatRouter.post('/',async(req,res)=>{

    const {user1,user2} = req.body
    if(!(user1 && user2)||(user1 && user2)===""){
        return res.status(402).json({error: "Missing parameters"})
    }
    
    const existingUser1 = await User.findOne({username:user1})
    const existingUser2 = await User.findOne({username:user2})
    const decodedToken = jwt.verify(req.token,config.SECRET)

    if(!(existingUser1&&existingUser2)){
        return res.status(402).json({error:"Nonexistent user/s"})
    }else if(decodedToken.id!==existingUser1._id.toString() && decodedToken.id!==existingUser2._id.toString()){
        return res.status(402).json({error:"Unauthorized token access"})
    }

    const existentChat = await Chat.findOne({
        $or: [
            {user1:existingUser1._id, user2: existingUser2._id},
            {user1:existingUser2._id, user2: existingUser1._id}
        ]
    })
    if(existentChat){
        return res.status(402).json({message:`Chat ${existentChat._id} with these users already existing`})
    }

    const newChat = new Chat({
        user1: existingUser1._id,
        user2:existingUser2._id
    })

    await newChat.save()
    return res.status(200).json(newChat)
})

chatRouter.delete('/:id', async(req,res)=>{     //check how to delete both user parts in chat registry later
    const chatToDelete = await Chat.findById(req.params.id)
    const decodedToken = jwt.verify(req.token,config.SECRET)

    if(!chatToDelete){
        return res.status(402).json({error:"Nonexistent chat"})
    }else if(decodedToken.id!==chatToDelete.user1.toString() && decodedToken.id!==chatToDelete.user2.toString()){
        return res.status(402).json({error:"Unauthorized token access"})
    }

    let numMessages = chatToDelete.messages.length
    for (let x=0; x<numMessages; x++){
        let currMessage = await Message.findById(chatToDelete.messages[x])
        await currMessage.delete()
    }
    await chatToDelete.delete()
    res.status(202).json({message:`Deleted chat ${req.params.id} and all its entries`})
})

chatRouter.delete('/all/end', async(req,res)=>{
    await Chat.deleteMany()
    await User.deleteMany()
    await Message.deleteMany()
    res.status(202).json({message: 'All registries in database removed'})
})

module.exports = chatRouter
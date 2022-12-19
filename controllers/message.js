const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Message = require('../models/Message')
const User = require('../models/User')
const Chat = require('../models/Chat')
const messageRouter = require('express').Router()

messageRouter.get('/', async (req,res)=>{
    const messages = await Message.find({}).populate('remittent',{username:1}).populate('destinatary',{username:1})
    return res.json(messages)
})

messageRouter.get('/:id', async(req,res)=>{
    const message = await Message.findById(req.params.id).populate('remittent',{username:1}).populate('destinatary',{username:1})
    return res.json(message)
})

messageRouter.post('/', async(req,res)=>{
    const {remittent,destinatary,content} = req.body
    if(!(remittent && destinatary && content)||(remittent && destinatary && content)===""){
        return res.status(402).json({error: "Missing parameters"})
    }
    const existentRemittent = await User.findOne({username:remittent})
    const existentDestinatary = await User.findOne({username:destinatary})
    const decodedToken = jwt.verify(req.token,config.SECRET)

    if(!(existentDestinatary && existentRemittent)){
        return res.status(402).json({error:"Nonexistent remittent/destinatary"})
    }else if(decodedToken.id!==existentRemittent._id.toString()){
        return res.status(402).json({error:"Unauthorized token access"})
    }

    const newMessage = new Message({
        remittent: existentRemittent._id,
        destinatary: existentDestinatary._id,
        content: content
    })
    await newMessage.save()
    const existentChat = await Chat.findOne({
        $or: [
            {user1:existentRemittent._id, user2: existentDestinatary._id},
            {user1:existentDestinatary._id, user2: existentRemittent._id}
        ]
    })

    if(!existentChat){
        const newChat = new Chat({
            user1: existentRemittent._id,
            user2: existentDestinatary._id,
            messages:[newMessage._id]
        })
        await newChat.save()
        return res.status(204).json(newMessage)
    }
    existentChat.messages = existentChat.messages.concat(newMessage._id)
    await existentChat.save()
    return res.status(204).json(newMessage)
})

messageRouter.delete('/:id', async(req,res)=>{  
    const decodedToken = jwt.verify(req.token,config.SECRET)
    const messageToDelete = await Message.findById(req.params.id)

    if(!messageToDelete){
        return res.status(400).json({error:"Nonexistent message"})
    }else if(decodedToken.id!==messageToDelete.remittent.toString()){
        return res.status(402).json({error:"Unauthorized token access"})
    }

    messageToDelete.content="Se eliminó este mensaje"
    messageToDelete.active=false
    messageToDelete.save()
    res.status(202).json({message:`Removed content from message ${messageToDelete._id}`})
})

module.exports = messageRouter
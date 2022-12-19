const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    user1:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    user2:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ]
})

chatSchema.set('toJSON',{
    transform:(document,returnedObject)=>{
        returnedObject.id=returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Chat',chatSchema)
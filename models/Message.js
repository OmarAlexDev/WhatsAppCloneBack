const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    remittent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destinatary:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content: {
        type:String,
        default: ""
    },
    time: {
        type: Date,
        default: new Date()
    },
    active:{
        type: Boolean,
        default: true
    }
})

messageSchema.set('toJSON',{
    transform: (document,returnedObject)=>{
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject._id,
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Message', messageSchema)
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    profileimage:{
        type: String,
        default: ''
    },
    username:{
        type: String,
        required: true
    },
    passwordHash:{
        type: String,
        required: true
    },
    state:{
        type: String,
        default: 'Hola! Estoy usando WhatsAppClone'
    }
})

userSchema.set('toJSON',{
    transform:(document, returnedObject)=>{
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

module.exports = mongoose.model('User',userSchema)
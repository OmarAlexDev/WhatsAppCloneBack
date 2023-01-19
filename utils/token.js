const jwt = require('jsonwebtoken')
const config = require('./config')

const generateToken = (registeredUser)=>{

    const user ={
        username: registeredUser.username,
        id: registeredUser._id
    }

    const token = jwt.sign(user,config.SECRET,{expiresIn:60*60})
    const sessionObject = {
            token:token,
            username: registeredUser.username,
            id: registeredUser._id.toString(), 
            state: registeredUser.state, 
            profileImage: registeredUser.profileImage
        }
    return sessionObject
}

module.exports = {generateToken}
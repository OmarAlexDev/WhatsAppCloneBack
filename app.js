const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('express-async-errors')
const app = express()
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/user')
const messageRouter = require('./controllers/message')
const chatRouter = require('./controllers/chat')

app.use(cors())
app.use(express.json())

mongoose.connect(config.MONGO_URL);
mongoose.connection.on('connected',()=>{
    logger.info("Connected to MongoDB")
})

mongoose.connection.on('error',(err)=>{
    logger.info("Can´t connect to MongoDB: "+err)
})

app.use(`/${config.PRIVATE}/api/login`,loginRouter)
app.use(`/${config.PRIVATE}/api/users`,userRouter)
app.use(`/${config.PRIVATE}/api/chats`,middleware.retrieveToken,chatRouter)
app.use(`/${config.PRIVATE}/api/messages`,middleware.retrieveToken,messageRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
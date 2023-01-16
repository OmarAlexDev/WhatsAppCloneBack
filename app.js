const express = require('express')
const mongoose = require('mongoose')
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors')
require('express-async-errors')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/user')
const messageRouter = require('./controllers/message')
const chatRouter = require('./controllers/chat')

const app = express()

mongoose.connect(config.MONGO_URL);
mongoose.connection.on('connected',()=>{
    logger.info("Connected to MongoDB")
})

mongoose.connection.on('error',(err)=>{
    logger.info("Can´t connect to MongoDB: "+err)
})

const server = createServer(app);
const io = new Server(server, {
    cors:{
        origin:'*'
    }
})

io.on("connection", (socket) => {
    logger.info(`Socket-client: ${socket.id} connected`)
    app.set('socketio', io)
})

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use(`/${config.PRIVATE}/api/login`,loginRouter)
app.use(`/${config.PRIVATE}/api/users`,middleware.retrieveToken,userRouter)
app.use(`/${config.PRIVATE}/api/chats`,middleware.retrieveToken,chatRouter)
app.use(`/${config.PRIVATE}/api/messages`,middleware.retrieveToken,messageRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)



module.exports = server
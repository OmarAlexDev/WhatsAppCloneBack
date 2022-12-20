const logger = require('./logger')
const config = require('./config')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requestLogger = (request,response,next)=>{
  logger.info(`Method: ${request.method}`)
  logger.info(`Path: ${request.path}`)
  logger.info(`Body: ${request.body}`)
  logger.info('---')
  next()
}

const retrieveToken= async (request,response,next)=>{
  const authorization = request.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    request.token = authorization.substring(7)
  }
  next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.name)

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if(error.name ==='JsonWebTokenError'){
      return response.status(400).json({error: "Missing token in request"})
    } else if(error.name ==='TokenExpiredError'){
      return response.status(400).json({error: "Token expired"})
    }
    next(error)
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    retrieveToken,
    requestLogger
}
const config = require('./utils/config')
const logger = require('./utils/logger')
const server = require('./app')

server.listen(config.PORT,()=>{
    logger.info(`Listening in port ${config.PORT} in ${config.NODE_ENV} mode`)
})
require('dotenv').config()

const PORT = process.env.PORT
const NODE_ENV = process.env.NODE_ENV
const MONGO_URL = NODE_ENV=="DEV" ? process.env.MONGO_URL : process.env.MONGO_URL_TEST
const SECRET = process.env.SECRET
const PRIVATE = process.env.PRIVATE


module.exports = {PORT,MONGO_URL, SECRET, NODE_ENV,  PRIVATE}


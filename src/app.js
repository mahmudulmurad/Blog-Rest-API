const express = require('express')
const cors = require('cors')
const fileUpload = require("express-fileupload");
require('./db/mongoose')
const userRouter = require('./routers/user')
const blogRouter = require('./routers/blog')

const app = express()
app.use(fileUpload())
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(blogRouter)


module.exports = app
const path = require('path')
const express = require('express')

const fileuplaod = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')

const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
 

dotenv.config({path:'./config/config.env'})
require('./config/db')

const bootcampRouter = require('./routes/bootcamps')
const coursesRouter = require('./routes/courses')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const reviewsRouter = require('./routes/reviews')

const errorHandler = require('./middleware/error')

const app = express()

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use(express.json())
app.use(fileuplaod()) 
app.use(cookieParser())
app.use(mongoSanitize()) ///sanitize data
app.use(helmet())        /// add security headers
app.use(xss())           /// prevent cross site scripting
app.use(hpp())           /// prevent http params polution

/// set limit to max of 100 request per 10 minutes
const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000,
    max: 100
})
app.use(limiter)
app.use(express.static(path.join(__dirname,'public')))


app.use(bootcampRouter)
app.use(coursesRouter)
app.use(authRouter)
app.use(userRouter)
app.use(reviewsRouter)
app.use(errorHandler)       /// custom error handeler for unhandeled promises rejection

const port = process.env.PORT || 5000
const server = app.listen(port, ()=>{
    console.log(`the app is up and running on port ${port} `.blue.inverse)
})

process.on('unhandledRejection',(error, promise)=>{
    console.log(`error:${error.message}`.red)
    server.close(()=>process.exit(1))

})


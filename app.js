const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')


const productRoutes = require('./api/routes/product')
const orderRoutes = require('./api/routes/orders')

const uri = 'mongodb://localhost:27017/nodeRestApi';
const options = {
    useNewUrlParser: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}

mongoose.connect(uri, options).then(() => {
    console.log("-----------------------------------------")
    console.log("connected to mongodb on port 27017.")
}, err => {
    console.log("-----------------------------------------")
    console.log(err)
})
mongoose.Promise = global.Promise

// show request log
app.use(morgan('dev'))
app.use(bodyparser.urlencoded({
    extended: false
}))
app.use(bodyparser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-with, Content-Type, Accept, Authorization'
    )
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

app.use((req, res, next) => {
    console.log("-----------------------------------------")
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    console.log("-----------------------------------------")
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app
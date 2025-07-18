const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const { createServer } = require('http'); 
const url = "mongodb+srv://sohilaahmed678:2UU03m0bUVXDjUwd@cluster0.9ijbpjx.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0";

const feedRouters = require("./routes/feed")
const authRoutes = require('./routes/auth')

const app = express();

const fileStorage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'images')
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
})

const fileFilter = (req, file, cb) =>{
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json
app.use(multer({ storage: fileStorage, fileFilter:fileFilter  }).single("image"))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization')
    next()
})


app.use('/feed',feedRouters)
app.use('/auth', authRoutes)
app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message
    const data = error.data
    res.status(status).json({
        message:message,
        data:data
    })
})

mongoose.connect(url).then(result =>{
    const httpServer = createServer(app);
    const io = require('./socket').init(httpServer)
    io.on('connection', socket => {
        // console.log('Client connected to WebSocket');
    });

    httpServer.listen(8080, () => {
        console.log('Server is running on port 8080');
    });
}
).catch(err =>{
    console.log(err)
})

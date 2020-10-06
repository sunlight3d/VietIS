const {MAXMUM_FILE_SIZE, PORT} = require('./constants/constants')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
const fileUpload = require('express-fileupload')
app.use(bodyParser.json())

app.use(fileUpload({
    limits: { fileSize: MAXMUM_FILE_SIZE * 1024 * 1024 },  //Maximum = 50 MB  
}))
//routings
const BookRouter = require('./routings/Book')
app.use('/books', BookRouter)
const UserRouter = require('./routings/User')
app.use('/users', UserRouter)

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})

/**
npm install mysql mysql2 sequelize bcrypt express-validator

 */
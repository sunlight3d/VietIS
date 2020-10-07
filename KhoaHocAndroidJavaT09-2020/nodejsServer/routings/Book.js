  
var express = require('express')
var router = express.Router()
const {checkToken} = require('../helpers/TokenCheck')
const {sequelize} = require('../databases/database')
const BookModel = require('../models/Book')(sequelize)

//http://books/
router.get('/', async (req, res) => {        
    const {tokenkey} = req.headers
    console.log(`tokkkkeeeen = ${tokenkey}`)
    const isValidToken = await checkToken({tokenkey})
    if(isValidToken == false) {
        res.json({
            result: "failed",
            data:{},
            message: 'Token is invalid'
        })    
        return;
    }
    let foundBooks = await BookModel.findAll()
    res.json({
        result: "ok",
        data:foundBooks,
        message: 'Get list of books successfully'
    })
})
//Them moi 1 quyen sach:
router.post('/', async (req, res) => {    
    //Noi dung them moi
})

module.exports = router

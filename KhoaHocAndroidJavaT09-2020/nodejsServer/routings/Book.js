  
var express = require('express')
var router = express.Router()
//http://books/
router.get('/', async (req, res) => {    
    var {fakeBooks} = require('../fakeData')
    res.json({
        result: "ok",
        data:fakeBooks
    })
})
//Them moi 1 quyen sach:
router.post('/', async (req, res) => {    
    //Noi dung them moi
})

module.exports = router
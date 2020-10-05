  
var express = require('express')
var router = express.Router()
//http://192.168.1.142:3000/users/register
router.post('/register', async (req, res) => {    
    res.json({
        result: 'ok',
        data: 'haha, chua co du lieu dau'
    })
})


module.exports = router
/*
CREATE TABLE IF NOT EXISTS User (
    id int PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(300) NOT NULL ,
    name VARCHAR(300) NOT NULL ,
    hashedPassword VARCHAR(500) NOT NULL ,
    tokenKey VARCHAR(300) DEFAULT '',
    expiredDate Date,
    phoneNumber VARCHAR(100) DEFAULT '',
    userType enum('default','facebook', 'google') default 'default'
);

INSERT INTO User(email, name, hashedPassword,tokenKey,phoneNumber, userType)
VALUES('hoang@gmail.com', 'hoangaa', 'reijrtie', 'ttookkee', '233445', 'facebook');

*/

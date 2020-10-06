  
var express = require('express')
var router = express.Router()
const {sequelize} = require('../databases/database')
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const {validate} = require('../validations/validate')
const UserModel = require('../models/User')(sequelize)

//http://192.168.1.142:3000/users/register
router.post('/register', validate.validateRegisterUser(), async (req, res) => {    
    //validate du lieu tu client gui len
    const errors = validationResult(req);        
    if (!errors.isEmpty()) {
        res.status(422).json({ 
            result: 'failed',
            data: {},
            message: 'Validation input error',
            errors: errors.errors
        });
        return;
    }
    //lay du lieu tu client        
    const {email, name, password, phoneNumber,userType} = req.body    
    try {
        let hashedPassword = await bcrypt.hash(password, 10)
        //let isMatchPassword = await bcrypt.compare('123456', hashedPassword)            
        const future30Days = new Date(); 
        future30Days.setDate(future30Days.getDate() + 30);
        let newUser = await UserModel.create({email, name, 
            hashedPassword, phoneNumber,userType,
            expiredDate: future30Days,
            tokenKey: require('key-creator').generate()
        })
        await newUser.save()
        res.json({
            result: 'ok',
            data: newUser,
            message: 'Register new user successfully'
        })
    }catch(exception) {
        res.status(500).json({
            result: 'failed',
            data: {},
            message: `Error details: ${exception.toString()}`,
            errors: []
        })
    }
})

module.exports = router

  
var express = require('express')
var router = express.Router()
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const {
    validateRegisterUser, 
    validateLogin,
    validateTokenKey
} = require('../validations/validate')

const { Op } = require("sequelize");
const {sequelize} = require('../databases/database')
const UserModel = require('../models/User')(sequelize)
const {checkToken} = require('../helpers/TokenCheck')

//http://192.168.1.142:3000/users/register
router.post('/register', validateRegisterUser(), async (req, res) => {    
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
    console.log('jaja')
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
//http://192.168.1.142:3000/users/login
router.post('/login', validateLogin(), async (req, res) => {    
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
    const {email, password} = req.body            
    try {
        let foundUsers = await UserModel.findAll({
            where:{
                email: {[Op.eq] : email}
            }
        })
        if(foundUsers.length == 0) {
            res.json({
                result: 'failed',
                data: {},
                message: 'Email/password is incorrect'
            })    
            return
        }
        let foundUser = foundUsers[0]
        let hashedPassword = foundUser.hashedPassword        
        let isMatchPassword = await bcrypt.compare(password, hashedPassword)            
        if(isMatchPassword) {
            const future30Days = new Date(); 
            future30Days.setDate(future30Days.getDate() + 30);
            foundUser.tokenKey = require('key-creator').generate()
            foundUser.expiredDate = future30Days            
            await foundUser.save()            
            foundUser.hashedPassword = "not show"
            res.status(200).json({
                result: 'ok',                
                data: foundUser,                
                message: 'Login user successfully'
            })
            return
        } else {
            res.json({
                result: 'failed',
                data: {},
                message: 'Email/password is incorrect'
            })    
            return
        }        
    }catch(exception) {
        res.status(500).json({
            result: 'failed',
            data: {},
            message: `Error details: ${exception.toString()}`,
            errors: []
        })
    }
})
router.post('/getDetailUser', validateTokenKey(), async (req, res) => {    
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
    const {tokenKey} = req.body                
    const isValidToken = await checkToken({tokenkey: tokenKey})
    if(isValidToken == false) {
        res.json({
            result: "failed",
            data:[],
            message: 'Token is invalid'
        })    
        return;
    }
    try {
        let foundUsers = await UserModel.findAll({
            where:{
                [Op.and]: [                    
                    {tokenKey: {[Op.eq] : tokenKey} },
                ]
            }
        })
        if(foundUsers.length == 0) {
            res.json({
                result: 'failed',
                data: {},
                message: 'Cannot found user'
            })    
            return
        }
        let foundUser = foundUsers[0]
        res.status(200).json({
            result: 'ok',                
            data: foundUser,                
            message: 'Login user successfully'
        })
        return        
    }catch(exception) {
        res.status(500).json({
            result: 'failed',
            data: {},
            message: `Error details: ${exception.toString()}`,
            errors: []
        })
        return
    }
})
module.exports = router

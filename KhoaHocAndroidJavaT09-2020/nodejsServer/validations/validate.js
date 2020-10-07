const {check, checkSchema} = require('express-validator');

const validateRegisterUser = () => {
  return [ 
    check('name', 'name does not Empty').not().isEmpty(),
    check('name', 'name more than 3 degits').isLength({ min: 3 }),
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'password more than 6 degits').isLength({ min: 6 }),
    checkSchema( {
        "userType": {
          in: 'body',
          matches: {
            options: [/\b(?:default|google|facebook)\b/],
            errorMessage: "Invalid userType, must be: facebook, default, google"
          }
        }
      }),    
  ]; 
}

const validateLogin = () => {
  return [ 
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),    
  ]; 
}

module.exports = {
  validateRegisterUser: validateRegisterUser,
  validateLogin: validateLogin
}
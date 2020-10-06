const {validate} = require('../validations/validate')
const UserModel = require('../models/User')(sequelize)
const checkToken = async (tokenKey) => {
    let foundUsers = UserModel.findAll({
        where: {
            tokenKey: tokenKey,
            expiredDate: {$gt: Date.now()}            
        }
    });
    return foundUsers.length > 0    
}
module.exports = {
    checkToken
}
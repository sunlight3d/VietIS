const {validate} = require('../validations/validate')
const {sequelize} = require('../databases/database')
const UserModel = require('../models/User')(sequelize)
const { Op } = require("sequelize");
const checkToken = async ({tokenkey}) => {
    let foundUsers = await UserModel.findAll({
        where: {
            tokenKey: tokenkey,
            expiredDate: {[Op.gte]: Date.now()}            
        }
    })
    return foundUsers.length > 0    
}
module.exports = {
    checkToken
}
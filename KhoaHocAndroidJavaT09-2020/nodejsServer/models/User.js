//  ./node_modules/.bin/sequelize-automate -t js -h 127.0.0.1 -d VietIS -u root -p "" -o xxx
const {
    DataTypes
  } = require('sequelize');
  
  module.exports = (sequelize) => {
    const attributes = {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: null,
        primaryKey: true,
        autoIncrement: true,
        comment: null,
        field: "id"
      },
      email: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "email"
      },
      name: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "name"
      },
      hashedPassword: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "hashedPassword"
      },
      tokenKey: {
        type: DataTypes.STRING(300),
        allowNull: true,
        defaultValue: "",
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "tokenKey"
      },
      
      phoneNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "",
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "phoneNumber"
      },
      expiredDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "expiredDate"
      },
      
      userType: {
        type: DataTypes.ENUM('default', 'facebook', 'google'),
        allowNull: true,
        defaultValue: "default",
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "userType"
      }
    };
    const options = {
      tableName: "user",
      timestamps: false,
      comment: "",
      indexes: []
    };
    const UserModel = sequelize.define("user_model", attributes, options);
    return UserModel;
  }
  //connect nodejs to MySQL through Sequelize
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

ALTER TABLE User ADD CONSTRAINT UniqueUser UNIQUE (email,userType);

INSERT INTO User(email, name, hashedPassword,tokenKey,phoneNumber, userType)
VALUES('hoang@gmail.com', 'hoangaa', 'reijrtie', 'ttookkee', '233445', 'facebook');


*/


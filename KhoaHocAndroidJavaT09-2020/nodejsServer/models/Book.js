const {
    DataTypes
  } = require('sequelize');
  
  module.exports = sequelize => {
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
      name: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "name"
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "imageUrl"
      },
      author: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "author"
      },
      rate: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "rate"
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "description"
      }
    };
    const options = {
      tableName: "book",
      timestamps: false,
      comment: "",
      indexes: []
    };
    const BookModel = sequelize.define("book_model", attributes, options);
    return BookModel;
  };

/*
CREATE TABLE book(
    id int PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(300) NOT NULL ,
    imageUrl VARCHAR(500) NOT NULL ,
    author VARCHAR(300) NOT NULL ,
    rate int,
    description TEXT
  );
  */
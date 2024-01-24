const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAddress = sequelize.define('UserAddress', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address_line1: {
        type: DataTypes.TEXT(50),
        allowNull: false
    },
    address_line2: {
        type: DataTypes.TEXT(50)
    },
    city: {
        type: DataTypes.TEXT(20),
        allowNull: false
    },
    postal_code: {
        type: DataTypes.TEXT(10),
        allowNull: false
    },
    country: {
        type: DataTypes.TEXT(20),
        allowNull: false
    },
    telephone: {
        type: DataTypes.TEXT(15),
        allowNull: false
    }
}, {
    tableName: 'user_addresses'
});

module.exports = UserAddress;
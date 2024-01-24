const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    address_id: {
        type: DataTypes.INTEGER
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false 
    }
});

module.exports = Order;
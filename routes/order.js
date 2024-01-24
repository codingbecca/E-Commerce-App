const orderRouter = require('express').Router();
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const passport = require('../config/passport');
const checkPermissionMiddleware = require('../middleware/permission');

// get all orders associated with a user
orderRouter.get('/:userId', passport.isAuthenticated, checkPermissionMiddleware, async (req, res) => {
    const userId = req.params.userId;

    try {
        const orders = await Order.findAll({
            where: {user_id: userId},
            include: [{ model: OrderItem, include: [Product] }]
        });

        if(!orders) {
            return res.status(204).json({error: 'no orders found'})
        }
        return res.status(200).json({message: 'orders succesfully found', orders });
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})

// get a specific order assocated whith a user
orderRouter.get('/:userId/:orderId', passport.isAuthenticated, checkPermissionMiddleware, async (req, res) =>{
    const orderId = req.params.orderId;

    try {
        const order = await Order.findOne({
            where: { id: orderId, user_id: userId },
            include: [{model: OrderItem, include: [Product] }]
        });

        if(!order) {
            return res.status(204).json({error: 'order not found'})
        }
        return res.status(200).json({message: 'order successfully found', order });
    } catch(error) {
        console.error(error);
        return res.status(500);
    }
})

module.exports = orderRouter;
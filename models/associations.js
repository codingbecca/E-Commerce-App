const User = require('./user');
const Cart = require('./cart');
const Product = require('./product');
const CartItem = require('./cartItem');
const Order = require('./order');
const OrderItem = require('./orderItem');
const UserAddress = require('./userAddress');

// define the one to many relationship between Users and Carts
User.hasMany(Cart, {
    foreignKey: 'user_id'
});
Cart.belongsTo(User);

// define the many to many relationship between carts and products through CartItems model
Product.belongsToMany(Cart, {
    through: CartItem,
    foreignKey: 'product_id'
});
Cart.belongsToMany(Product, {
    through: CartItem,
    foreignKey: 'cart_id'
});

// define the one to many relationship between users and orders
User.hasMany(Order, {
    foreignKey: 'user_id'
});
Order.belongsTo(User);

// define the many to many relationship between orders and products through OrderItems model
Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: 'product_id'
});
Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: 'order_id'
});

// define the one to many relationship between users and UserAddresses
User.hasMany(UserAddress, {
    foreignKey: 'user_id'
});
UserAddress.belongsTo(User);
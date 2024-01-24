const cartRouter = require('express').Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const CartItem = require('../models/cartItem');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const passport = require('../config/passport');

const productNotFoundError = { error: 'Product not found' }
const cartNotFoundError ={ error: 'Cart not found' }

//create a cart by adding an item
cartRouter.post('/', passport.isAuthenticated, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json(productNotFoundError);
        }

        const userId = req.user.id;
        const cart = await Cart.create({user_id: userId});

        // create the cartitem, if quantiy is valid
        if(quantity < 0) {
            return res.status(400).json({error: 'item quantity must be greater than 0'});
        }
        const cartItem = await CartItem.create({
            cart_id: cart.id,
            product_id: productId,
            quantity
        });

        return res.status(201).json({message: 'Product added to cart successfully', cartItem });
    } catch(error){
        console.error(error);
        return res.status(500);
    }
});

//update the quantity of an item in the cart
cartRouter.put('/:cartId/:productId', passport.isAuthenticated, async (req,res ) => {
    const { quantity } = req.body;
    const cartId = req.params.cartId;
    const productId = req.params.productId;
    const userId = req.user.id;
   
    try{
        // make sure the user is modifying their own cart
        const cart = await Cart.findOne({
            where: { id: cartId, user_id: userId }
          });
      
          if (!cart) {
            return res.status(404).json({ cartNotFoundError });
          }
        // find cartitem
        const cartItem = await CartItem.findOne({ 
            where: {
                cart_id: cartId,
                product_id: productId
            }
        });

        if(!cartItem) {
            return res.status(404).json(productNotFoundError);
        }

        // if quantity is zero, delete the item from the cart
        if(quantity === 0) {
            await cartItem.destroy();
            return res.status(204).json({message: 'cart item successfully deleted'});
        } else if (quantity < 0){
            // if quantiy is less than zero, return an error
            return res.status(400).json({error: 'item quantity must be greater than 0'});
        } else {
            cartItem.quantity = quantity;
            await cartItem.save();

            return res.status(200).json({message: 'item quantity successfully updated', cartItem });
        }
    } catch(error) {
        console.error(error);
        return res.status(500)
    }
});

//get all of a user's carts
cartRouter.get('/', passport.isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    
    try{
        const orders = await Cart.findAll({
            where: { user_id: userId },
            include: [{model: CartItem, include: [Product] }]
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({error: 'No carts found for this user'});
        }

        return res.status(200).json({carts: orders});
    } catch(error) {
        console.error(error);
        return res.status(500);
    }
});

//get contents of a single cart
cartRouter.get('=/:cartId', passport.isAuthenticated, async (req, res) => {
    const cartId = req.params.cartId;
    const userId = req.user.id;

    try{
        const cart = await Cart.findOne({
            where: { cart_id: cartId, user_id: userId },
            include: [{ model: CartItem, include: [Product] }]
        });

        if(!cart) {
            return res.status(404).json(cartNotFoundError);
        }

        return res.status(200).json({ cartItems: cart.CartItems });
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})

//delete a cart
cartRouter.delete('/:cartId', passport.isAuthenticated, async (req, res) => {
    const cartId = req.params.cartId;
    const userId = req.user.id;

    try {
        

        // find the relevant cart
        const cart = await Cart.findOne({
            where: { id: cartId, user_id: userId },
            include: [{ model: OrderItem, include: [Product] }],
          });

        if (!cart) {
            return res.status(404).json(cartNotFoundError);
        }

        await CartItem.destroy({
            where: { cart_id: cartId }
        });

        await cart.destroy();
        return res.status(204).json({message: 'Cart deleted'})
    } catch(error) {
        console.error(error);
        return res.status(500);
    }
});

//delete an item from a cart
cartRouter.delete('/:cartId/:productId', passport.isAuthenticated, async (req, res) => {
    const cartId = req.params.cartId;
    const productId = req.params.productId;
    const userId = req.user.id

    try{
         // make sure the user is modifying their own cart
         const cart = await Cart.findOne({
            where: { id: cartId, user_id: userId }
          });
      
          if (!cart) {
            return res.status(404).json({ cartNotFoundError });
          }

        const cartItem = await CartItem.findOne({
            where: {cart_id: cartId, product_id: productId}
        });

        if(!cartItem) {
            return res.status(404).json({error: 'cart item not foun'});
        }

        await cartItem.destroy();

        return res.status(204).json({message: 'cart item successfuly deleted'});
    } catch(error) {
        console.error(error);
        return res.status(500);
    }
});

// checkout a cart
cartRouter.post('/:cartId/checkout', passport.isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const cartId = req.params.cartId;
    const selectedAddressId = req.body.selectedAddressId;

    try {
         const cart = await Cart.findOne({
            where: { id: cartId, user_id: userId },
            include: [{ model: OrderItem, include: [Product] }],
        });

        if(!cart) {
            return res.status(404).json({cartNotFoundError})
        }

        const orderTotal = cart.CartItems.reduce((total, cartItem) =>{
            return total + cartItem.quantity * cartItem.Product.unit_price;
        }, 0);

        // create an order from the cart and the calculated total
        const order = await Order.create({ user_id: userId, total: orderTotal, address_id: selectedAddressId });

        const orderItems = await Promise.all(
            cart.CartItems.map(async (cartItem) => {
                return await OrderItem.create({
                    order_id: order.id,
                    product_id: cartItem.product_id,
                    quantity: cartItem.quantity
                });
            })
        );

        // delete the cartitems and cart connected to the order
        await CartItem.destroy({
            where: {cart_id: cartId}
        });

        await Cart.destroy({
            where: {id: cartId}
        });

        return res.status(201).json({message: 'checkout successful', order, orderItems});
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
});

module.exports = cartRouter;
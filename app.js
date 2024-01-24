const express = require('express');
const session = require('express-session')
const sequelize = require('./config/database');
require('./models/associations');
const passport = require('./config/passport');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const userRouter = require('./routes/user');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const addressRouter = require('./routes/userAddress');


app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRouter);
app.use('/products', productRouter);
app.use('/users', userRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);
app.use('/addresses', addressRouter);

app.get('/', (req, res) => {
    res.send('App under construction')
});


sequelize.sync().then(() => {
    app.listen (port, () => {
        console.log(`App running on port ${port}.`)
    });
})
const authRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('../config/passport');

//Register a user
authRouter.post('/register', async (req, res, next) => {
    try {
        const {username, password, first_name, last_name, telephone } = req.body;
        // check if trying to register an already existing username
        const existingUser = await User.findOne({where: { username }});
        if (existingUser) {
            return res.status(400).json({message: 'That username is not available'});
        }

        // salt and hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // create a new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            first_name,
            last_name,
            telephone
        })

        res.status(201).json({ message: 'User sucessfully registered' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error'})
    }
})

//Login a user
authRouter.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}), (req, res) => {
    res.json({message: 'Login successful'})
})

module.exports = authRouter;
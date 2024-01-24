const userRouter = require('express').Router();
const User = require('../models/user');
const passport = require('../config/passport');
const checkPermissionMiddleware = require('../middleware/permission');

const notFoundError = { error: 'User not found' };

// get a single user account
userRouter.get('/:userId', passport.isAuthenticated, checkPermissionMiddleware, async (req, res, next) => {
    const userId = req.params.userId;

    try {

        const user = await User.findByPk(userId);
        if(!user) {
            return res.status(404).json(notFoundError);
        } else {
            res.status(200).json(user);
        }
    } catch(error) {
        console.error(error);
        res.status(500);
    }
})

// update a user account
userRouter.put('/:userId', passport.isAuthenticated, checkPermissionMiddleware, async (req, res, next) =>{
    const requestedUserId = req.params.userId;
    const updateFields = req.body;

    try {
        const [rowsAffected, updatedUser] = await User.update(updateFields, {
            where: { id: requestedUserId },
            returning: true
        });

        if (rowsAffected === 0) {
            return res.status(404).json(notFoundError);
        }

        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser[0]
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})

// delete a user account
userRouter.delete('/:userId', passport.isAuthenticated, checkPermissionMiddleware, async (req, res, next) => {
    const requestedUserId = req.params.userId;

    try {
        const user = await User.findByPk(requestedUserId);
        if (!user) {
            return res.status(404).json(notFoundError);
        }

        // if the requested user exists, delete the user
        await user.destroy();
        return res.status(204).json({message: 'User successfully deleted'});
    } catch(error){
        console.error(error);
        return res.status(500)
    }
})

module.exports = userRouter;
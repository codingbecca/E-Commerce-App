const addressRouter = require('express').Router();
const UserAddress = require('../models/userAddress');
const passport = require('../config/passport');

// add a new address
addressRouter.post('/', passport.isAuthenticated, async (req, res) =>{
    const {addressLine1, addressLine2, city, postalCode, country, telephone } = req.body;
    const userId = req.user.id;

    try {
        const address = await UserAddress.create({
            user_id: userId,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            postal_code: postalCode,
            country,
            telephone
        });

        return res.status(200).json({message: 'address succsessfully added', address});
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})

// update an existing address
addressRouter.put('/:addressId', passport.isAuthenticated, async(req, res) => {
    const addressId = req.params.addressId;
    const userId = req.user.id;
    const updateFields = req.body;

    try {
        
        //find the relevant address
        const address = await UserAddress.findOne({
            where: {id: addressId, user_id: userId }
        });

        if (!address) {
            return res.status(404).json({ error: 'address not found' });
        }

        const [rowsAffected, updatedAddress] = await UserAddress.update(updateFields, {
            where: { id: addressId },
            returning: true
        });

        return res.status(200).json({message: 'address updated successfully', address: updatedAddress[0] })
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})

// get all addresses
addressRouter.get('/', passport.isAuthenticated, async(req, res) => {
    const userId = req.user.id;

    try {
        const addresses = await UserAddress.findAll({
            where: { user_id: userId }
        });

        if (!addresses.length) {
            return res.status(404).json({error: 'user has no saved addresses'});
        }

        return res.status(200).json({ message: 'addresses succesfully found', addresses });
    } catch (error) {
        console.error(error)
        return res.status(500);
    }
})

// get a single address
addressRouter.get('/:addressId', passport.isAuthenticated, async (req, res) => {
   const userId = req.user.id;
   const addressId = req.params.addressId;
   
   try {
        const address = await UserAddress.findOne({
            where: {id: addressId, user_id: userId }
        });

        if(!address) {
            return res.status(404).json({error: 'address not found'});
        }

        return res.status(200).json({message: 'address successfully found', address });
   } catch (error) {
        console.error(error);
        return res.status(500);
   }
})

// delete an address
addressRouter.delete('/:addressId', passport.isAuthenticated, async (req, res) => {
    const addressId = req.params.addressId;
    const userId = req.user.id;
    try {

        await UserAddress.destroy({
            where: {id: addressId, user_id: userId}
        });

        return res.status(204).json({message: 'address successfully deleted'});
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
})


module.exports = addressRouter;
const productRouter = require('express').Router();
const Product = require('../models/product');

// Create a product
productRouter.post('/', async (req, res, next) =>{
    const { unit_price, inventory, name, description } = req.body;
    const newProduct = await Product.create({
        unit_price,
        inventory,
        name,
        description
    });
    res.status(201).json(newProduct);
});

// Get a product
productRouter.get('/:productId', async (req, res, next) =>{
    const product = await Product.findByPk(req.params.productId);
    if (product === null) {
        res.status(404).json({error: 'Product with that Id not found'});
    } else {
        res.status(200).json(product);
    }
})

// Get all products
productRouter.get('/', async (req, res, next) => {
    const products = await Product.findAll();
    res.status(200).json(products)
})

// Update an existing product
productRouter.put('/:productId', async (req, res, next) => {
    const productId = req.params.productId;
    const updateFields = req.body;

    try {
        const [rowsAffected, updatedProduct] = await Product.update(updateFields, {
            where: { id: productId },
            returning: true
        });

        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct[0]
        });
    } catch(error) {
        console.error(error);
        return res.status(500);
    }
})

// Delete a product
productRouter.delete('/:productId', async (req, res, next) => {
    const productId = req.params.productId;
    try{
        const product = await Product.findByPk(productId);
        if(!product) {
            return res.status(404).json({error: 'product not found'});
        }

        // if product exists, delete it
        await product.destroy();
        return res.status(204).json({message: 'Product sucessfully deleted'});
    } catch(error){
        console.error(error);
        return res.status(500);
    }
})

module.exports = productRouter;
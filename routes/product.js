const express = require('express');
const Product = require('../models/Product');  
const router = express.Router();

// Fetch all products from the database
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);  // Send all products back as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products from database' });
  }
});

// POST endpoint to add products (this can be used with Postman)
router.post('/addProducts', async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;  // Get product data from body

    const newProduct = new Product({
      name,
      price,
      description,
      image: imageUrl,
    });

    await newProduct.save();  // Save new product to database

    res.status(201).json(newProduct);  // Send back the newly created product
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product to database' });
  }
});

module.exports = router;

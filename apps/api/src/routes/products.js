const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// GET all products with filtering, searching, pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      tag, 
      category, 
      sort = 'name', 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (category) {
      query.category = category;
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'price') sortObj.price = 1;
    else if (sort === 'price-desc') sortObj.price = -1;
    else if (sort === 'name') sortObj.name = 1;
    else sortObj.createdAt = -1;

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Failed to fetch product'
    });
  }
});

module.exports = router;
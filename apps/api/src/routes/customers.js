const express = require('express');
const Customer = require('../models/Customer');
const router = express.Router();

// GET customer by email (for identification)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email query parameter is required'
      });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        email: email
      });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      error: 'Failed to fetch customer'
    });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      error: 'Failed to fetch customer'
    });
  }
});

module.exports = router;
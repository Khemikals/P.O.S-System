const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { authMiddleware, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// CREATE a sale (checkout) — any logged-in user (owner or cashier)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in sale' });
    }

    let total = 0;
    const saleItems = [];

    // Loop through each item, check stock, calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stockQty < item.qty) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const itemTotal = product.sellingPrice * item.qty;
      total += itemTotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        priceAtSale: product.sellingPrice
      });

      // Reduce stock
      product.stockQty -= item.qty;
      await product.save();
    }

    // Create the sale record
    const sale = new Sale({
      items: saleItems,
      total,
      paymentMethod,
      cashier: req.user.id
    });

    await sale.save();

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all sales (owner only — for reports)
router.get('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('cashier', 'name')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
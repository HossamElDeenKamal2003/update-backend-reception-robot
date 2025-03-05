// routes/orderRouter.js
const express = require('express');
const orderController = require('./doctorController');

const router = express.Router();

// Create a new order
router.post('/create', orderController.createOrder);

// Get all orders for a doctor
router.get('/doctor/:doctorId', orderController.getDoctorsorders);

// Get orders for a doctor based on date range
router.get('/date', orderController.getOrdersBasedOnDate);

// Get orders for a doctor based on status
router.get('/status', orderController.ordersBasedonStatus);

module.exports = router;
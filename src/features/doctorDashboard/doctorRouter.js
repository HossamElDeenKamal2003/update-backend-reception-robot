// routes/orderRouter.js
const express = require('express');
const orderController = require('./doctorController');
const authenticateDoctor = require("../../middlewares/authincateDoctor");
const router = express.Router();

// Create a new order
router.post('/create', orderController.createOrder);

// Get all orders for a doctor
router.get('/doctor', authenticateDoctor, orderController.getDoctorsorders);

// Get orders for a doctor based on date range
router.get('/date', authenticateDoctor, orderController.getOrdersBasedOnDate);

// Get orders for a doctor based on status
router.get('/status',authenticateDoctor, orderController.ordersBasedonStatus);

module.exports = router;
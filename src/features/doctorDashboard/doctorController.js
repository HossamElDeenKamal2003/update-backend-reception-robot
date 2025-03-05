// controllers/orderController.js
const orderService = require('./doctorService');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { doctorId, patientName, age, teethNo, sex, color, type, description, price, prova, deadline, labId } = req.body;
        const result = await orderService.createOrder(doctorId, patientName, age, teethNo, sex, color, type, description, price, prova, deadline, labId);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all orders for a doctor
const getDoctorsorders = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const result = await orderService.getDoctorsorders(doctorId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get orders for a doctor based on date range
const getOrdersBasedOnDate = async (req, res) => {
    try {
        const { doctorId, startDate, endDate } = req.query;

        if (!doctorId || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Doctor ID, Start Date, and End Date are required" });
        }

        const ordersList = await orderService.getOrdersBasedOnDate(doctorId, startDate, endDate);
        res.status(200).json({ success: true, orders: ordersList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get orders for a doctor based on status
const ordersBasedonStatus = async (req, res) => {
    try {
        const { doctorId, status } = req.query;

        if (!doctorId || !status) {
            return res.status(400).json({ success: false, message: "Doctor ID and Status are required" });
        }

        const result = await orderService.ordersBasedonStatus(doctorId, status);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getDoctorsorders,
    getOrdersBasedOnDate,
    ordersBasedonStatus,
};
const orderService = require("./orders.service");

const createOrder = async (req, res) => {
    try {
        const { patientName, age, teethNo, sex, color, type, description, price, prova, deadline, labId } = req.body;
        // Pass the entire `req` object to the service
        const result = await orderService.createOrder(req, patientName, age, teethNo, sex, color, type, description, price, prova, deadline, labId);

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const updateOrderController = async (req, res) => {
    try {
        const orderId = req.params.id; // Get order ID from URL
        const updateData = req.body; // Get fields to update from request body
        console.log(orderId);
        // Call the service function to update order
        const updatedOrder = await orderService.updateOrders(req, orderId, updateData);

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    createOrder,
    updateOrderController
};
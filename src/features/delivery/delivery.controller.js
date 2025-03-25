const DeliveryService = require('./delivery.service');

class DeliveryController {
    static async getAvailableOrders(req, res) {
        const response = await DeliveryService.getAvailableOrders(req.del.role);
        return res.status(response.status).json({
            message: response.message,
            data: response.data,
            status: response.status
        });
    }

    static async takeOrder(req, res) {
        const response = await DeliveryService.takeOrder(
            req.del.id,
            req.params.id
        );
        return res.status(response.status).json({
            message: response.message,
            data: response.data,
            status: response.status
        });
    }

    static async endTask(req, res) {
        const response = await DeliveryService.endTask(
            req.del.id,
            req.params.orderId
        );
        return res.status(response.status).json({
            message: response.message,
            data: response.data,
            status: response.status
        });
    }
}

module.exports = DeliveryController;
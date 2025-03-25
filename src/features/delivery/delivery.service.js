const ordersModel = require('../../models/order.model');

class DeliveryService {
    static async getAvailableOrders(deliveryRole) {
        try {
            if (deliveryRole !== "del") {
                return { success: false, message: "Unauthorized", status: 401 };
            }

            const orders = await ordersModel.find({
                taked: false,
                $or: [
                    { status: { $regex: '^DoctorReady' } },
                    { status: { $regex: '^LabReady' } }
                ]
            }).lean();

            return {
                success: true,
                data: orders,
                message: "Orders retrieved successfully",
                status: 200
            };

        } catch (error) {
            console.error("[DeliveryService] getAvailableOrders error:", error);
            return {
                success: false,
                message: error.message,
                status: 500
            };
        }
    }

    static async takeOrder(deliveryId, orderId) {
        try {
            const updatedOrder = await ordersModel.findByIdAndUpdate(
                orderId,
                { taked: true, delivery: deliveryId },
                { new: true }
            );

            if (!updatedOrder) {
                return {
                    success: false,
                    message: "Order not found",
                    status: 404
                };
            }

            return {
                success: true,
                data: updatedOrder,
                message: "Order taken successfully",
                status: 200
            };

        } catch (error) {
            console.error("[DeliveryService] takeOrder error:", error);
            return {
                success: false,
                message: error.message,
                status: 500
            };
        }
    }

    static async endTask(deliveryId, orderId) {
        try {
            const order = await ordersModel.findById(orderId);
            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                    status: 404
                };
            }

            // Determine if the status is final or pending
            const isFinal = order.status.includes("(f)");
            const statusType = isFinal ? "(f)" : "(p)";

            // Extract base status without (f) or (p)
            const baseStatus = order.status.replace(/\([fp]\)$/, '').trim();

            // Fixed: use consistent status names matching DB (e.g., "DoctorReady" instead of "DocReady")
            const statusTransitions = {
                "DoctorReady": `going to lab${statusType}`,
                "going to lab": `lab received${statusType}`,
                // "lab received": `underway${statusType}`,
                "lab ready": `going to doctor${statusType}`,
                "going to doctor": `end${statusType}`
            };


            // Validate status transition
            if (!statusTransitions[baseStatus]) {
                return {
                    success: false,
                    message: `Invalid status transition from '${order.status}'`,
                    status: 400
                };
            }

            // Update order status and delivery tracking
            order.status = statusTransitions[baseStatus];
            order.taked = false;

            // Prevent duplicate deliveryId entries
            if (!order.delivery.includes(deliveryId)) {
                order.delivery.push(deliveryId);
            }

            await order.save();

            return {
                success: true,
                data: order,
                message: `Status updated to ${order.status}`,
                status: 200
            };

        } catch (error) {
            console.error("[DeliveryService] endTask error:", error);
            return {
                success: false,
                message: error.message,
                status: 500
            };
        }
    }
}

module.exports = DeliveryService;
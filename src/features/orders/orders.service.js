const labs = require("../../models/labs.model");
const orders = require("../../models/order.model");
const redisClient = require("../../config/redis.config");
const crypto = require("crypto");
const { generateOrderKey, generateDoctorOrdersKey, generateLabOrdersKey } = require("../../utility/redis.utility");

const generateUID = () => {
    return crypto.randomBytes(2).toString("hex").toUpperCase().slice(0, 3);
};

const createOrder = async (req, patientName, age, teethNo, sex, color, type, description, price, prova, deadline, labId) => {
    try {
        const doctorId = req.doctor.id;
        console.log("doctorId", doctorId);

        if (!patientName || !teethNo || !sex || !color || !type || prova === undefined || !deadline || !labId) {
            throw new Error("All required fields must be provided");
        }

        const lab = await labs.findOne({ _id: labId }).select("doctors");
        if (!lab || !lab.doctors.includes(doctorId)) {
            throw new Error("You are not subscribed to this lab");
        }

        const newOrder = new orders({
            UID: generateUID(),
            patientName,
            doctorId,
            age,
            teethNo,
            sex,
            color,
            type,
            description,
            price,
            status: prova ? "DoctorReady(p)" : "DoctorReady(f)",
            labId,
            doc_id: doctorId,
            delivery: [],
            deadline,
            prova,
            taked: false,
            media: [],
            date: new Date(),
        });

        await newOrder.save();

        // ✅ Cache the order by ID
        await redisClient.set(generateOrderKey(newOrder._id), JSON.stringify(newOrder));

        // ✅ Invalidate doctor's order list cache
        const doctorOrdersKey = generateDoctorOrdersKey(doctorId);
        await redisClient.del(doctorOrdersKey);

        // ✅ Optional: Invalidate lab orders if needed
        const labOrdersKey = generateLabOrdersKey(labId);
        await redisClient.del(labOrdersKey);

        // ✅ Emit to socket
        if (global.io) {
            console.log("connected to socket to get orders with socket");
            global.io.emit(`get-orders/${labId}`, { orders: newOrder });
        }

        return {
            success: true,
            message: "Order created successfully",
            order: newOrder,
            fromCache: false,
        };
    } catch (error) {
        console.error("Error in createOrder:", error);
        return {
            success: false,
            message: error.message,
        };
    }
};

const updateOrders = async (req, orderId, updateData) => {
    try {
        console.log("Doctor ID:", req.doctor?.id);
        console.log("Updating Order ID:", orderId);
        const doctorId = req.doctor.id;
        const cacheKey = generateOrderKey(orderId);
        const order = await orders.findById(orderId);
        if (!order) {
            console.error("Order not found in DB:", orderId);
            throw new Error("Order not found");
        }
        console.log("Order doctor ID:", order.doctorId);
        if (order.doctorId.toString() !== doctorId) {
            throw new Error("Unauthorized");
        }
        const updatedOrder = await orders.findOneAndUpdate(
            { _id: orderId },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        console.log("Updated order:", updatedOrder);
        try {
            await redisClient.del(cacheKey);
            console.log(`Deleted cache for order: ${orderId}`);
        } catch (redisError) {
            console.error("Redis cache deletion error:", redisError.message);
        }

        return updatedOrder;
    } catch (error) {
        console.error("Error updating order:", error.message);
        throw new Error(error.message || "Error in updateOrders");
    }
};

const getMyLabs = async(req)=>{
    const doctorId = req.doctor.id;
    try{
        const myLabs = await labs.find({ doctors: doctorId });
        return {
            myLabs: myLabs,
        }
    }
    catch (error){
        console.log(error)
        throw new Error("Error in getMyLabs");
    }
}


module.exports = {
    createOrder,
    updateOrders,
    getMyLabs
};
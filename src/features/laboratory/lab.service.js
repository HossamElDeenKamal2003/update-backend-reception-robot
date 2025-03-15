const labsModel = require("../../models/labs.model");
const doctorsModel = require("../../models/doctors.model");
const jwt = require("jsonwebtoken");
const redisClient = require('../../config/redis.config');
const crypto = require("crypto");
const orders = require("../../models/order.model");
const { generateLabOrdersKey, generateOrderKey } = require("../../utility/redis.utility");
const { getLabDataService } = require("../auth/labs/labsService");

const getAllOrders = async (req) => {
    try {
        const labId = req.lab.id;
        console.log("Lab ID:", labId);

        const lab = await labsModel.findById(labId).select("doctors").lean();
        if (!lab) {
            return { status: 404, message: "Lab not found", orders: [] };
        }
        const labDoctors = lab.doctors;
        if (!labDoctors || labDoctors.length === 0) {
            return { status: 200, message: "No doctors found", orders: [] };
        }
        const cacheKey = generateLabOrdersKey(labId);
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            console.log("Returning cached orders from Redis");
            return { status: 200, message: "Orders retrieved from cache", orders: JSON.parse(cachedOrders) };
        }
        const labOrders = await orders.find({ doctorId: { $in: labDoctors }, labId }).lean();
        await redisClient.set(cacheKey, JSON.stringify(labOrders), "EX", 600);

        return { status: 200, message: "Orders retrieved successfully", orders: labOrders };
    } catch (error) {
        console.error("Error in getAllOrders service:", error);
        return { status: 500, message: error.message, orders: [] };
    }
};

const getOrdersFilter = async (req) => {
    try {
        const labId = req.lab.id;
        const status = req.params.status;
        console.log("Status from query:", status);

        const cacheKey = generateLabOrdersKey(labId);

        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            console.log("Returning filtered orders from Redis cache");
            const orders = JSON.parse(cachedOrders);

            const filteredOrders = status ? orders.filter(order => {
                console.log(`Order status: ${order.status}, Filter status: ${status}`);
                return order.status === status;
            }) : orders;

            return { status: 200, message: "Filtered orders retrieved from cache", orders: filteredOrders };
        }

        console.log("Cache miss! Fetching orders from MongoDB...");
        const lab = await labsModel.findById(labId).select("doctors").lean();
        if (!lab) {
            return { status: 404, message: "Lab not found", orders: [] };
        }

        const labDoctors = lab.doctors;
        if (!labDoctors || labDoctors.length === 0) {
            return { status: 200, message: "No doctors found", orders: [] };
        }

        const labOrders = await orders.find({ doctorId: { $in: labDoctors }, labId }).lean();
        console.log("Sample order status:", labOrders[0]?.status);

        await redisClient.set(cacheKey, JSON.stringify(labOrders), "EX", 600);

        const filteredOrders = status ? labOrders.filter(order => {
            console.log(`Order status: ${order.status}, Filter status: ${status}`);
            return order.status === status;
        }) : labOrders;

        return { status: 200, message: "Filtered orders retrieved successfully", orders: filteredOrders.sort({ createdAt: -1 }) };
    } catch (error) {
        console.error("Error in getOrdersFilter:", error.message);
        return { status: 500, message: error.message, orders: [] };
    }
};

const getOrderById = async (req) => {
    try {
        const orderId = req.params.id;
        const labId = req.lab.id;
        const cacheKey = generateOrderKey(orderId);
        const cachedOrder = await redisClient.get(cacheKey);
        if (cachedOrder) {
            console.log("Cache hit");
            return { status: 200, message: "Order retrieved from cache", order: JSON.parse(cachedOrder) };
        }
        console.log("Cache miss");
        const order = await orders.findOne({ _id: orderId, labId: labId });
        if (!order) {
            console.error(`Order not found: ${orderId}`);
            return { status: 404, message: "Order not found", order: null };
        }
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(order));
        return { status: 200, message: "Order retrieved successfully", order };
    } catch (error) {
        console.error("Error fetching order:", error.message);
        return { status: 500, message: error.message, order: null };
    }
};

const updateTeethNumber = async (req) => {
    try {
        const orderId = req.params.id;
        const labId = req.lab.id;
        const labRole = req.lab.role;
        const teethNumber = req.body.teethNumber;
        console.log("orderId:", orderId);
        console.log("labId:", labId);
        console.log("teethNumber:", teethNumber);
        const order = await orders.findOne({ _id: orderId });
        if (!order) {
            return { status: 404, message: "Order not found", order: null };
        }
        if (order.labId.toString() !== labId || labRole !== "lab") {
            return { status: 403, message: "Unauthorized", order: null };
        }
        order.teethNo = teethNumber;
        await order.save();
        const cacheKey = generateOrderKey(orderId);
        await redisClient.del(cacheKey);
        return { status: 200, message: "Teeth number updated successfully", order };
    } catch (error) {
        console.error("Error in updateTeethNumber:", error.message);
        return { status: 500, message: error.message, order: null };
    }
};

const addDoctor = async (req) => {
    const labId = req.lab.id;
    const UID = req.params.UID;
    try {
        const lab = await labsModel.findOne({ _id: labId });
        const doctor = await doctorsModel.findOne({ UID: UID });
        if (!doctor) {
            return { status: 400, message: "Doctor not found", addDoctorResult: null };
        }
        if (lab.doctors.includes(doctor._id)) {
            return { status: 400, message: "You already have this doctor", addDoctorResult: null };
        }
        lab.doctors.push(doctor._id);
        await lab.save();
        return { status: 200, message: "Doctor added successfully", addDoctorResult: doctor };
    } catch (error) {
        console.log("Error in addDoctor:", error);
        return { status: 500, message: error.message, addDoctorResult: null };
    }
}
const removeDoctor = async (req) => {
    try {
        const labId = req.lab?.id;
        const UID = req.params.UID;
        if (!labId) {
            return { status: 400, message: "Lab authentication data is missing." };
        }
        const doctor = await doctorsModel.findOne({ UID: UID });
        if (!doctor) {
            return { status: 404, message: "Doctor not found." };
        }
        const lab = await labsModel.findOne({ _id: labId });
        if (!lab) {
            return { status: 404, message: "Lab not found." };
        }
        lab.doctors = lab.doctors.filter(docId => docId.toString() !== doctor._id.toString());
        lab.contracts = lab.contracts.filter(contract => contract.doctorId.toString() !== doctor._id.toString());
        await lab.save();

        return { status: 200, message: "Doctor and associated contract removed successfully.", removedDoctor: doctor };
    } catch (error) {
        console.error("Error in removeDoctor:", error);
        return { status: 500, message: error.message };
    }
};

const addContractForDoctor = async (req) => {
    const { doctorId, teethTypes } = req.body;
    const labId = req.lab.id;

    try {
        if (!doctorId || !teethTypes || typeof teethTypes !== "object") {
            return { status: 400, message: "Invalid input: doctorId and teethTypes are required", contract: null };
        }

        for (const [toothType, price] of Object.entries(teethTypes)) {
            if (typeof price !== "number" || price < 0) {
                return { status: 400, message: `Invalid price for tooth type: ${toothType}`, contract: null };
            }
        }
        const lab = await labsModel.findById(labId);
        if (!lab) return { status: 404, message: "Lab not found", contract: null };
        const doctor = await doctorsModel.findById(doctorId);
        if (!doctor) return { status: 404, message: "Doctor not found", contract: null };
        const existingContract = lab.contracts.find(c => c.doctorId.toString() === doctorId);
        if (existingContract) return { status: 400, message: "A contract already exists for this doctor", contract: null };
        const newContract = { doctorId, teethTypes };
        lab.contracts.push(newContract);
        await lab.save();
        await redisClient.del(`contract:${doctorId}`);
        return { status: 200, message: "Contract added successfully", contract: newContract };
    } catch (error) {
        console.error("Error in addContractForDoctor service:", error);
        return { status: 500, message: error.message, contract: null };
    }
};

const myDoctors = async (req) => {
    try {
        const labId = req.lab?.id;
        if (!labId) {
            return { status: 400, message: "Lab authentication data is missing." };
        }
        const lab = await labsModel
            .findOne({ _id: labId })
            .populate({
                path: "doctors",
                select: "UID username phoneNumber profileImage"
            })
            .select("username email doctors")
            .exec();

        if (!lab) {
            return { status: 404, message: "Lab not found." };
        }
        return { status: 200, message: "Doctors retrieved successfully.", doctors: lab.doctors };
    } catch (error) {
        console.error("Error in myDoctors:", error);
        return { status: 500, message: error.message };
    }
};

const updateContractForDoctor = async (req) => {
    const { doctorId, teethTypes } = req.body;
    const labId = req.lab.id;
    try {
        if (!doctorId || !teethTypes || typeof teethTypes !== "object") {
            return { status: 400, message: "Invalid input: doctorId and teethTypes are required", contract: null };
        }
        for (const [toothType, price] of Object.entries(teethTypes)) {
            if (typeof price !== "number" || price < 0) {
                return { status: 400, message: `Invalid price for tooth type: ${toothType}`, contract: null };
            }
        }
        const lab = await labsModel.findById(labId);
        if (!lab) return { status: 404, message: "Lab not found", contract: null };
        const contractIndex = lab.contracts.findIndex(c => c.doctorId.toString() === doctorId);
        if (contractIndex === -1) return { status: 404, message: "Contract not found", contract: null };
        lab.contracts[contractIndex].teethTypes = teethTypes;
        await lab.save();
        await redisClient.del(`contract:${doctorId}`);
        const updatedContract = lab.contracts[contractIndex];
        await redisClient.setEx(`contract:${doctorId}`, 3600, JSON.stringify(updatedContract));
        return { status: 200, message: "Contract updated successfully", contract: updatedContract };
    } catch (error) {
        console.error("Error in updateContractForDoctor service:", error);
        return { status: 500, message: error.message, contract: null };
    }
};

module.exports = {
    getAllOrders,
    getOrdersFilter,
    getOrderById,
    updateTeethNumber,
    addDoctor,
    removeDoctor,
    addContractForDoctor,
    myDoctors,
    updateContractForDoctor
}
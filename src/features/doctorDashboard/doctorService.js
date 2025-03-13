const redisClient = require('../../config/redis.config');
const {
    generateOrderKey,
    generateDoctorOrdersKey,
    generateDateBasedOrdersKey,
    generateStatusBasedOrdersKey,
} = require('../../utility/redis.utility'); // Ensure the correct path
const orders = require('../../models/order.model');
const labs = require('../../models/labs.model');
const crypto = require("crypto");

const generateUID = () => {
    return crypto.randomBytes(2).toString("hex").toUpperCase().slice(0, 3);
};

const createOrder = async (doctorId, patientName, age, teethNo, sex, color, type, description, price, prova, deadline, labId) => {
    try {
        // Validate required fields
        if (!doctorId || !patientName || !teethNo || !sex || !color || !type || prova === undefined || !deadline || !labId) {
            throw new Error("All required fields must be provided");
        }

        // Check if the doctor is associated with the lab
        const lab = await labs.findOne({ _id: labId }).select("doctors");
        if (!lab || !lab.doctors.includes(doctorId)) {
            throw new Error("You are not subscribed to this lab");
        }

        // Create a new order
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
            deadline,
            prova,
            media: [],
            date: new Date(),
        });

        // Save to database
        await newOrder.save();

        // Cache the order in Redis
        await redisClient.set(generateOrderKey(newOrder._id), JSON.stringify(newOrder));

        return {
            success: true,
            message: "Order created successfully",
            order: newOrder,
            fromCache: false, // Data is not from cache
        };
    } catch (error) {
        console.error("Error in createOrder:", error);
        return {
            success: false,
            message: error.message,
        };
    }
};
const getDoctorsorders = async (req) => {
    try {
        console.log("req", req.doctor);
        const doctorId = req.doctor.id;
        const cacheKey = generateDoctorOrdersKey(doctorId);

        // Check if orders are cached in Redis
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            return {
                orders: JSON.parse(cachedOrders),
                fromCache: true, // Data is from cache
            };
        }

        // Fetch from database if not cached
        const ordersD = await orders.find({ doctorId: doctorId });

        // Cache the orders in Redis
        await redisClient.set(cacheKey, JSON.stringify(ordersD));

        return {
            orders: ordersD,
            fromCache: false, // Data is not from cache
        };
    } catch (error) {
        console.log(error);
        throw new Error("Error in getDoctorsorders");
    }
};

const getOrdersBasedOnDate = async (req, startDate, endDate) => {
    try {
        if (!req || !startDate || !endDate) {
            throw new Error("Doctor ID, Start Date, and End Date are required");
        }
        const doctorId = req.doctor.id;
        console.log("doctorId", doctorId);
        const cacheKey = generateDateBasedOrdersKey(doctorId, startDate, endDate);

        // Check if orders are cached in Redis
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            return {
                orders: JSON.parse(cachedOrders),
                fromCache: true, // Data is from cache
            };
        }

        // Convert dates to JavaScript Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Query orders for the given doctor between the selected dates
        const ordersList = await orders.find({
            doc_id: doctorId,
            date: {
                $gte: start,
                $lte: end,
            },
        });

        // Cache the orders in Redis
        await redisClient.set(cacheKey, JSON.stringify(ordersList));

        return {
            orders: ordersList,
            fromCache: false, // Data is not from cache
        };
    } catch (error) {
        console.error("Error in getOrdersBasedOnDate:", error);
        throw new Error("Error fetching orders based on date");
    }
};

const ordersBasedonStatus = async (req, status) => {
    try {
        const doctorId = req.doctor.id;
        const cacheKey = generateStatusBasedOrdersKey(doctorId, status);

        // Check if orders are cached in Redis
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            return {
                orders: JSON.parse(cachedOrders),
                fromCache: true, // Data is from cache
            };
        }

        let query = { doctorId: doctorId };

        // If status is "docready", include both "docready (f)" and "docready (p)"
        if (status === "docready") {
            query.status = { $in: ["DoctorReady(f)", "DoctorReady(p)"] };
        } else {
            query.status = status;
        }

        const ordersD = await orders.find(query);

        // Cache the orders in Redis
        await redisClient.set(cacheKey, JSON.stringify(ordersD));

        return {
            orders: ordersD,
            fromCache: false, // Data is not from cache
        };
    } catch (error) {
        console.error("Error in ordersBasedonStatus:", error);
        throw new Error("Error fetching orders based on status");
    }
};

module.exports = { createOrder, getDoctorsorders, getOrdersBasedOnDate, ordersBasedonStatus };

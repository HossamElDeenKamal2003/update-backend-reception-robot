const doctorModel = require('../../models/doctors.model');
const orders = require('../../models/order.model');
const labs = require('../../models/labs.model');
const crypto = require("crypto");

// Function to generate a 3-character UID
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
            age,  // Optional
            teethNo,
            sex,
            color,
            type,
            description,  // Optional
            price,  // Optional
            status: prova?"DoctorReady(p)": "DoctorReady(f)", // Default status
            labId,
            doc_id: doctorId,
            deadline,
            prova,
            media: [],
            date: new Date(),
        });

        // Save to database
        await newOrder.save();

        return {
            success: true,
            message: "Order created successfully",
            order: newOrder
        };
    } catch (error) {
        console.error("Error in createOrder:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

const getDoctorsorders = async(doctorId) => {
    try {
        const ordersD = await orders.find();
        return {orders: ordersD};
    } catch (error) {
        console.log(error);
        throw new Error("Error in getDoctorsorders");
    }
}

const getOrdersBasedOnDate = async (doctorId, startDate, endDate) => {
    try {
        if (!doctorId || !startDate || !endDate) {
            throw new Error("Doctor ID, Start Date, and End Date are required");
        }

        // Convert dates to JavaScript Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Query orders for the given doctor between the selected dates
        const ordersList = await orders.find({
            doc_id: doctorId,
            date: {
                $gte: start, // Greater than or equal to startDate
                $lte: end    // Less than or equal to endDate
            }
        });

        return ordersList;
    } catch (error) {
        console.error("Error in getOrdersBasedOnDate:", error);
        throw new Error("Error fetching orders based on date");
    }
};

const ordersBasedonStatus = async (doctorId, status) => {
    try {
        let query = { doctorId: doctorId };

        // If status is "docready", include both "docready (f)" and "docready (p)"
        if (status === "docready") {
            query.status = { $in: ["DoctorReady(f)", "DoctorReady(p)"] };
        } else {
            query.status = status;
        }

        const ordersD = await orders.find(query);
        return { orders: ordersD };
    } catch (error) {
        console.error("Error in ordersBasedonStatus:", error);
        throw new Error("Error fetching orders based on status");
    }
};

module.exports = { createOrder, getDoctorsorders, getOrdersBasedOnDate, ordersBasedonStatus };

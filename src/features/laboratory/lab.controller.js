const { getAllOrders, getOrdersFilter, getOrderById, updateTeethNumber, addDoctor, removeDoctor, addContractForDoctor, myDoctors, updateContractForDoctor } = require("./lab.service");
const asyncHandler = require("express-async-handler");

const getAllOrdersController = asyncHandler(async (req, res) => {
    const { status, message, orders } = await getAllOrders(req);
    res.status(status).json({ success: status === 200, message, orders });
});

const getOrdersFilterController = asyncHandler(async (req, res) => {
    const { status, message, orders } = await getOrdersFilter(req);
    res.status(status).json({ success: status === 200, message, orders });
});

const getOrderByIdController = asyncHandler(async (req, res) => {
    const { status, message, order } = await getOrderById(req);
    res.status(status).json({ success: status === 200, message, order });
});

const updateTeethNumberController = asyncHandler(async (req, res) => {
    const { status, message, order } = await updateTeethNumber(req);
    res.status(status).json({ success: status === 200, message, order });
});

const addDoctorController = asyncHandler(async (req, res) => {
    const { status, message, addDoctorResult } = await addDoctor(req);
    res.status(status).json({ success: status === 200, message, addDoctorResult });
});

const removeDoctorController = asyncHandler(async (req, res) => {
    const { status, message, removeDoctorResult } = await removeDoctor(req);
    res.status(status).json({ success: status === 200, message, removeDoctorResult });
});

const addContractForDoctorController = asyncHandler(async (req, res) => {
    const { status, message, contract } = await addContractForDoctor(req);

    res.status(status).json({
        success: status === 200,
        message,
        contract,
    });
});

const myDoctorsController = asyncHandler(async (req, res) => {
    const { status, message, doctors } = await myDoctors(req);
    res.status(status).json({
        success: status === 200,
        message,
        doctors
    })
});

const updateContractController = async (req, res) => {
    const response = await updateContractForDoctor(req);
    res.status(response.status).json(response);
};

    module.exports = {
    getAllOrdersController,
    getOrdersFilterController,
    getOrderByIdController,
    updateTeethNumberController,
    addDoctorController,
    removeDoctorController,
    addContractForDoctorController,
        myDoctorsController,
        updateContractController
};
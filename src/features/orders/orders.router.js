const express = require("express");
const router = express.Router();
const authenticateDoctor = require("../../middlewares/authincateDoctor");
const {
    createOrder,
    updateOrderController
} = require("./orders.controller");
router.post("/create", authenticateDoctor, createOrder);
router.post("/update/:id", authenticateDoctor, updateOrderController);
module.exports = router;
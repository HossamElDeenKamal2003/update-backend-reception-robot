const express = require('express');
const router = express.Router();
const authenticateLab = require("../../middlewares/authincatedLabs");
const {
    getAllOrdersController,
    getOrdersFilterController,
    getOrderByIdController,
    updateTeethNumberController,
    addDoctorController,
    removeDoctorController,
    addContractForDoctorController,
    myDoctorsController,
    updateContractController
} = require('./lab.controller');
router.post('/get-orders', authenticateLab, getAllOrdersController);
router.get('/get-orders/:status', authenticateLab, getOrdersFilterController);
router.get('/order/:id', authenticateLab, getOrderByIdController);
router.patch('/update-order/:id', authenticateLab,updateTeethNumberController);
router.post('/add-doctor/:UID', authenticateLab, addDoctorController);
router.delete('/remove-doctor/:UID', authenticateLab, removeDoctorController);
router.put('/add-contract', authenticateLab, addContractForDoctorController);
router.get('/get-my-doctors', authenticateLab, myDoctorsController);
router.patch('/contract', authenticateLab,updateContractController);
module.exports = router;
const express = require("express");
const router = express.Router();
const labsController = require("./labsController");

router.post("/register", labsController.registerLab);
router.post("/login", labsController.loginLab);

module.exports = router;

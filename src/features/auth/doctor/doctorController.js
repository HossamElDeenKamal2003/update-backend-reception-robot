const asyncHandler = require("express-async-handler");
const { register: registerDoctor, login } = require("./doctorService.js");

const registerController = asyncHandler(async (req, res) => {
    const { username, phoneNumber, email, buildNo, floorNo, address, password } = req.body;

    if (!username || !phoneNumber || !email || !buildNo || !floorNo || !address || !password) {
        return res.status(400).json({ message: "Please Complete All Data" });
    }

    try {
        const doctor = await registerDoctor(username, phoneNumber, email, buildNo, floorNo, address, password);
        return res.status(201).json({ doctor });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
});

const loginController = asyncHandler(async (req, res) => {
    const { phoneNumber, email, password } = req.body;

    if ((!phoneNumber && !email) || !password) {
        return res.status(400).json({ message: "Please complete the data" });
    }

    try {
        await login(phoneNumber, email, password); // ✅ Fixed parameter order
        return res.status(200).json({ message: "Login Successful" });
    } catch (error) {
        return res.status(error.statusCode || 401).json({ message: error.message });
    }
});

module.exports = { registerController, loginController };

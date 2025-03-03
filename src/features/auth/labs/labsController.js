const labsService = require("./labsService");

// Register Lab
const registerLab = async (req, res) => {
    try {
        const { username, phoneNumber, email, buildNo, floorNo, address, password, coverImage, profileImage, subscribeDelivery, role, contracts } = req.body;
        const response = await labsService.register(username, phoneNumber, email, buildNo, floorNo, address, password, coverImage, profileImage, subscribeDelivery, role, contracts);
        res.status(201).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

// Lab Login
const loginLab = async (req, res) => {
    try {
        const { phoneNumber, email, password } = req.body;
        const response = await labsService.login(phoneNumber, email, password);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = { registerLab, loginLab };

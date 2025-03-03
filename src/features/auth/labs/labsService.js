const labs = require("../../../models/labs.model");
const bcrypt = require("bcryptjs");

const register = async (username, phoneNumber, email, buildNo, floorNo, address, password, coverImage, profileImage, subscribeDelivery, role, contracts) => {
    // Check if lab already exists
    const existLab = await labs.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (existLab) {
        const error = new Error("Lab already exists");
        error.statusCode = 400; 
        throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new lab
    const newLab = new labs({
        username,
        phoneNumber,
        email,
        buildNo,
        floorNo,
        address,
        coverImage,
        profileImage,
        password: hashedPassword,
        favouritePosts: [],
        posts: [],
        subscribeDelivery: subscribeDelivery || false,
        role: role || "lab",
        contracts: contracts || [],
    });

    await newLab.save();

    return {
        message: "Lab Created Successfully",
        newLab
    };
};

const login = async (phoneNumber, email, password) => {
    let lab = null;

    if (email) {
        lab = await labs.findOne({ email });
    } else {
        lab = await labs.findOne({ phoneNumber });
    }

    console.log("Phone:", phoneNumber, "Email:", email);
    console.log("Lab Found:", lab);

    if (!lab) {
        const error = new Error("Lab not found");
        error.statusCode = 401;
        throw error;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, lab.password);
    if (!isMatch) {
        const error = new Error("Incorrect Password");
        error.statusCode = 401;
        throw error;
    }

    return { message: "Login Successful",lab };
};

module.exports = {
    register,
    login
};

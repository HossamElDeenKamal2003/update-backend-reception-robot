const doctorsModel = require("../../../models/doctors.model");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const generateUID = () => {
    return crypto.randomBytes(2).toString("hex").toUpperCase().slice(0, 3);
};

const register = async (username, phoneNumber, email, buildNo, floorNo, address, password) => {
    const existDoctor = await doctorsModel.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (existDoctor) {
        const error = new Error("User already exists");
        error.statusCode = 400; // ✅ Proper status code
        throw error;
    }

    const UID = generateUID(); 

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new doctorsModel({
        username,
        phoneNumber,
        email,
        buildNo,
        floorNo,
        address,
        password: hashedPassword, 
        UID, 
    });

    await newDoctor.save();
    return { message: "Doctor registered successfully", newDoctor };
};

const login = async (phoneNumber, email, password) => {
    let doctor = null;

    if (email) {
        doctor = await doctorsModel.findOne({ email });
    } else {
        doctor = await doctorsModel.findOne({ phoneNumber });
    }

    if (!doctor) {
        const error = new Error("Doctor not found");
        error.statusCode = 401; // ✅ Proper status code
        throw error;
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
        const error = new Error("Incorrect Password");
        error.statusCode = 401; // ✅ Proper status code
        throw error;
    }

    return { message: "Login Successful" };
};

module.exports = { register, login };

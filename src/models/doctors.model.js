const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
    UID: {
        type: String,
        required: true,
        maxLength: 255,
    },
    username: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        type: String,
        unique: true
    },
    buildNo: {
        type: String,
        require: true
    },
    floorNo:{
        type: String,
        require: String,
    },
    coverImage: {
        type: String
    },
    address:{
        type: String
    },
    profileImage: {
        type: String
    },
    password: {
        type: String,
        reuire: true
    },
    favouritePosts: {
        type:[]
    },
    posts: {
        type: []
    },
    role: {
        type: String,
        default: "doctor"
    },
    subscribeWithLabs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "labs",
        default: [],
    }

}, { timestamps: true });

const doctorsModel = mongoose.model('doctors', doctorSchema);
module.exports = doctorsModel;



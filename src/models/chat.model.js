// models/chatModel.js
const mongoose = require('mongoose');

// Define the Chat Schema
const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    senderType: {
      type: String,
      required: true,
      enum: ['user', 'doctor', 'lab', 'delivery'], 
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    receiverType: {
      type: String, 
      required: true,
      enum: ['user', 'doctor', 'lab', 'delivery'], 
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now, 
    },
    isRead: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true, 
  }
);


const chatModel = mongoose.model('chat', chatSchema);


module.exports = chatModel;
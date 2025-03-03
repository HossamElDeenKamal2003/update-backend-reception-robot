const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    UID: {
      type: String,
      required: true,
      maxLength: 255,
    },
    patientName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    age: {
      type: Number,
      required: false,
    },
    teethNo: {
      type: Number,
      required: true,
    },
    sex: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
      maxLength: 255,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: false,
    },
    paid: {
      type: Number,
      required: false,
    },
    rest: {
        type: Number
    },
    lab_id: {
      type: mongoose.Schema.ObjectId,
      ref: "labs",
      required: true,
    },
    doc_id: {
      type: mongoose.Schema.ObjectId,
      ref: "doctor",
      required: true,
    },
    deadline: {
        type: String
    },
    date: {
      type: Date,
      default: Date.now(),
      required: false,
    },
    prova: {
      type: Boolean,
      required: false,
      default: true,
    },
    docReady: {
      type: Boolean,
      required: false,
      default: false,
    },
    media: {
        type: []
    },
    delivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "delivery",
        required: true
    },
  },
  { timestamps: true }
);

const ordersModel = mongoose.model("orders", orderSchema);
module.exports = ordersModel;
const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    createdByType: {
      type: String,
      required: true,
      enum: ['user', 'doctor', 'lab', 'delivery'], 
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String], 
      default: [],
    },
    usersReacted: {
      type: [mongoose.Schema.Types.ObjectId], 
      default: [],
    },
    usersCommented: {
      type: [mongoose.Schema.Types.ObjectId], 
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);

const postsModel = mongoose.model('posts', postsSchema);

module.exports = postsModel;
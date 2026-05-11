const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new"
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
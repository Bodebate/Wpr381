const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    ticketCode: {
      type: String,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid"
    },

    issuedAt: {
      type: Date,
      default: Date.now
    },

    checkedInAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
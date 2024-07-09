const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Meeting", MeetingSchema);

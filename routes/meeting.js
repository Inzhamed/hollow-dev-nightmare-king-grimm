const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");

// Create a new meeting
router.post("/create", async (req, res) => {
  const code = generateUniqueCode();
  const newMeeting = new Meeting({ code });
  await newMeeting.save();
  res.json({ code });
});

// Join a meeting
router.post("/join", async (req, res) => {
  const { code } = req.body;
  const meeting = await Meeting.findOne({ code });
  if (meeting) {
    res.json({ success: true, meeting });
  } else {
    res.json({ success: false, message: "Meeting not found" });
  }
});

function generateUniqueCode() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

module.exports = router;

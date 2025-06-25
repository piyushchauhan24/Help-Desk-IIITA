const express = require("express");
const router = express.Router();
const {
  submitComplaint,
  getAllComplaints,
  getUserComplaints,
  assign,
  resolvedComplaint,
  track,
  complaintTypes
} = require("../controllers/complaintController");
const upload = require("../utils/upload");

router.get("/complaints", getAllComplaints);
router.get("/complaint_types", complaintTypes);
router.get("/complaints/user/:email", getUserComplaints);
router.put("/complaints/:id/assign", assign);
router.patch("/complaints/:id", resolvedComplaint);
router.post("/complaints/track", track);
router.post("/complaints", upload.array("attachments"), submitComplaint);
module.exports = router;

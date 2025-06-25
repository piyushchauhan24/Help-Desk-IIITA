const express = require("express");
const router = express.Router();
const {
  getPersonnels, 
  getAvailablePersonnels, 
  addPersonnels
} = require("../controllers/personnelController");

router.get("/", getPersonnels);
router.get("/available/:role", getAvailablePersonnels);
router.post("/", addPersonnels);

module.exports = router;

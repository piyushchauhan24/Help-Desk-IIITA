const {
  createComplaint,
  getAll,
  getUserComplaint,
  assignPersonnel,
  markResolved,
  trackTicket,
  getComplaintTypes
} = require('../models/complaintModel');

const submitComplaint = (req, res) => {
  const { name, email, priority, location, type, message } = req.body;
  const attachments = req.files?.map((file) => file.filename).join(",") || "";

  if (!name || !email || !priority || !location || !type || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please fill all required fields' 
    
    });
  }

  const complaint = { name, email, priority, location, type, message, attachments };

  createComplaint(complaint, (err) => {
    if (err) return res.status(500).json({ 
      success: false, 
      message: err.message || 'Error submitting complaint' 
    });
    res.status(201).json({ 
      success: true, 
      message: "Ticket submitted and email sent." 
    
    });
  });
};

const getAllComplaints = (req, res) => {
  getAll((err, results) => {
    if (err) return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch complaints" 
    });
    res.json({ 
      success: true, 
      data: results 
    
    });
  });
};

const getUserComplaints = (req, res) => {
  const { email } = req.params;
  getUserComplaint(email, (err, results) => {
    if (err) return res.status(500).json({ 
      success: false, 
      message: "Error fetching user complaints" 
    });
    res.json({ 
      success: true, 
      complaints: results 
    });
  });
};

const assign = (req, res) => {
  const id = req.params.id;
  const { assignedName, assignedContact } = req.body;

  if (!assignedName || !assignedContact) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide both name and contact of personnel' 
    
    });
  }

  assignPersonnel(id, assignedName, assignedContact, (err, success) => {
    if (err) return res.status(500).json({ 
      success: false, 
      message: "Failed to assign personnel" 
    });
    if (!success) return res.status(404).json({ 
      success: false, 
      message: "Personnel not found" 
    });
    res.json({ 
      success: true, 
      message: "Personnel assigned successfully" 
    });
  });
};

const resolvedComplaint = (req, res) => {
  const { id } = req.params;
  markResolved(id, (err) => {
    if (err) return res.status(500).json({ 
      success: false, 
      message: "Failed to resolve complaint" 
    });
    res.json({ 
      success: true, 
      message: "Complaint marked as resolved" 
    });
  });
};

const track = (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ 
      success: false, 
      message: "Email and ticket code are required" 
    });
  }

  trackTicket(email, code, (err, results) => {
    if (err) return res.status(500).json({ 
      success: false, 
      error: err 
    });
    if (results.length === 0) return res.status(404).json({ 
      success: false, 
      message: "Ticket not found" 
    });

    const { status, personnel_name, personnel_contact } = results[0];
    const response = { success: true, status };
    if (status === 'Assigned') {
      response.personnel = { 
        name: personnel_name, 
        contact: personnel_contact 
      };
    }
    res.json(response);
  });
};

const complaintTypes = (req, res) => {
  getComplaintTypes((err, results) => {
    if (err) return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
    res.json({ 
      success: true, 
      complaintTypes: results 
    });
  });
};

module.exports = {
  submitComplaint,
  getAllComplaints,
  getUserComplaints,
  assign,
  resolvedComplaint,
  track,
  complaintTypes
}
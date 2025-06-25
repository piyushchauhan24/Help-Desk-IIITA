const db = require("../config/db");
require("dotenv").config();
const generateCode = () => Math.floor(1000 + Math.random() * 9000);
const { 
  sendTicketSubmissionMail, 
  adminAssignedPersonnelMail, 
  complaintResolvedMail 
} = require("../utils/mailer");

const getAll = (callback) => {
  const sql = `
    SELECT 
      c.*, 
      u.name AS name,
      u.email AS email,
      p.name AS assigned_name, 
      p.contact AS assigned_contact,
      ct.type_name AS complaint_type
    FROM complaints c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN personnel p ON c.assigned_personnel_id = p.id
    LEFT JOIN complaint_types ct ON c.complaint_type_id = ct.id
  `;
  db.query(sql, callback);
};

const createComplaint = async (complaint, callback) => {
  const { name, email, priority, location, type, message, attachments } = complaint;
  const code = generateCode();

  const sql = `
    INSERT INTO complaints 
    (priority, location, complaint_type_id, message, attachments, code, user_id)
    VALUES (
      ?, ?, 
      (SELECT id FROM complaint_types WHERE type_name = ? LIMIT 1),
      ?, ?, ?, 
      (SELECT id FROM users WHERE email = ? LIMIT 1)
    )
  `;

  db.query(
    sql,
    [priority, location, type, message, attachments, code, email],
    async (err, result) => {
      if (err) return callback(err);
      await sendTicketSubmissionMail(email, name, type, code);
      callback(null, result);
    }
  );
};

const getUserComplaint = (email, callback) => {
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, userResults) => {
    if (err) {
      return callback(err, null);
    }
    if (userResults.length === 0) {
      return callback(new Error("User not found"), null);
    }
    const user_id = userResults[0].id; 
    const q = `
      SELECT 
        c.*, 
        ct.type_name AS type, 
        f.rating AS feedback, 
        p.name AS assigned_personnel_name
      FROM complaints c
      LEFT JOIN complaint_types ct ON c.complaint_type_id = ct.id
      LEFT JOIN feedback f ON f.complaint_id = c.id
      LEFT JOIN personnel p ON c.assigned_personnel_id = p.id
      WHERE c.user_id = ?
    `;
    db.query(q, [user_id], callback);
  });
};

const assignPersonnel = (id, assignedName, assignedContact, callback) => {
  const fetchPersonnel = `SELECT id FROM personnel WHERE name = ? AND contact = ?`;
  db.query(fetchPersonnel, [assignedName, assignedContact], (err, result) => {
    if (err) return callback(err);
    if (result.length === 0) return callback(null, null);

    const personnelId = result[0].id;

    const updateComplaint = `
      UPDATE complaints 
      SET assigned_personnel_id = ?, status = 'Assigned' 
      WHERE id = ?
    `;
    db.query(updateComplaint, [personnelId, id], (err2) => {
      if (err2) return callback(err2);

      const updatePersonnel = `UPDATE personnel SET available = 0 WHERE id = ?`;
      db.query(updatePersonnel, [personnelId], (err3) => {
        if (err3) return callback(err3);

        const getUserDetails = `
          SELECT u.name, u.email, ct.type_name
          FROM complaints c
          JOIN users u ON c.user_id = u.id
          JOIN complaint_types ct ON c.complaint_type_id = ct.id
          WHERE c.id = ?
        `;

        db.query(getUserDetails, [id], (err4, result2) => {
          if (err4) return callback(err4);
          if (result2.length === 0) return callback(null, true); // fallback if no user info

          const { name, email, type_name } = result2[0];

          adminAssignedPersonnelMail(email, name, type_name, assignedName, assignedContact)
            .then(() => callback(null, true))
            .catch(mailErr => callback(mailErr));
        });
      });
    });
  });
};

const markResolved = (id, callback) => {
  const getComplaintDetails = `
    SELECT c.assigned_personnel_id, c.user_id, u.name, u.email, ct.type_name
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    JOIN complaint_types ct ON c.complaint_type_id = ct.id
    WHERE c.id = ?
  `;
  db.query(getComplaintDetails, [id], (err, result) => {
    if (err || result.length === 0) return callback(err || new Error("Complaint not found"));

    const {
      assigned_personnel_id: personnelId,
      name,
      email,
      type_name: type,
    } = result[0];

    const updateComplaint = "UPDATE complaints SET status = 'Resolved' WHERE id = ?";

    db.query(updateComplaint, [id], (err) => {
      if (err) return callback(err);
      
      complaintResolvedMail(email, name, type)
        .then(() => {
          if (personnelId) {
            const updatePersonnel = "UPDATE personnel SET available = 1 WHERE id = ?";
            db.query(updatePersonnel, [personnelId], callback);
          } else {
            callback(null, true);
          }
        })
        .catch((mailErr) => {
          console.error("Failed to send resolved mail:", mailErr);
          callback(mailErr);
        });
    });
  });
};

const trackTicket = (email, code, callback) => {
  const sql = `
    SELECT c.status, 
            p.name AS personnel_name, 
            p.contact AS personnel_contact 
    FROM complaints c 
    JOIN users u ON c.user_id = u.id
    LEFT JOIN personnel p ON c.assigned_personnel_id = p.id 
    WHERE u.email = ? AND c.code = ?
  `;
  db.query(sql, [email, code], callback);
};

const getComplaintTypes = (callback) => {
  const query = "SELECT id, type_name FROM complaint_types";
  db.query(query, callback);
};

module.exports = {
  getAll, 
  createComplaint, 
  getUserComplaint, 
  assignPersonnel, 
  markResolved, 
  trackTicket, 
  getComplaintTypes
};

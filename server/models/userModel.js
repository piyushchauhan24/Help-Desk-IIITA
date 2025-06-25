const db = require('../config/db');

const findUserByEmail = (email, callback) => {
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], callback);
};

const createUser = (name, email, hashedPassword, role, callback) => {
  const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(query, [name, email, hashedPassword, role], callback);
};

const getUserDetailsByEmail = (email, callback) => {
  const query = "SELECT name, email FROM users WHERE email = ?";
  db.query(query, [email], callback);
};

const checkExistingFeedback = (complaint_id, callback) => {
  const query = "SELECT id FROM feedback WHERE complaint_id = ?";
  db.query(query, [complaint_id], callback);
};

const insertFeedback = (complaint_id, user_id, assigned_personnel_id, rating, comment, callback) => {
  const query = `
    INSERT INTO feedback (complaint_id, user_id, assigned_personnel_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [complaint_id, user_id, assigned_personnel_id, rating, comment], callback);
};

const markFeedbackGiven = (complaint_id, callback) => {
  const query = "UPDATE complaints SET feedback_given = TRUE WHERE id = ?";
  db.query(query, [complaint_id], callback);
};

module.exports = {
  createUser,
  findUserByEmail,
  getUserDetailsByEmail,
  checkExistingFeedback,
  insertFeedback,
  markFeedbackGiven
};

const db = require("../config/db");

const getAll =  (callback) => {
  db.query("SELECT * FROM personnel", callback);
};

const getAvailableByRole = (role, callback) => {
  db.query("SELECT * FROM personnel WHERE role = ? AND available = TRUE", [role], callback);
};

const assignPersonnel = (id, callback) => {
  db.query("UPDATE personnel SET available = FALSE WHERE id = ?", [id], callback);
};

const releasePersonnel = (id, callback) => {
  db.query("UPDATE personnel SET available = TRUE WHERE id = ?", [id], callback);
};

const addPersonnel = (person, callback) => {
  const sql = `INSERT INTO personnel (name, contact, role, available) VALUES (?, ?, ?, 1)`;
  db.query(sql, [person.name, person.contact, person.role], callback);
};

module.exports = {
  getAll, 
  getAvailableByRole, 
  assignPersonnel, 
  releasePersonnel, 
  addPersonnel
};

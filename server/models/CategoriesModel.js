const db = require("../config/db");
// currently not in use
const categories = [
  "Network",
  "Cleaning",
  "Carpentry",
  "PC Maintenance",
  "Plumbing",
  "Electricity",
];

const insertCategories = () => {
  const sql = "INSERT IGNORE INTO complaint_types (type_name) VALUES ?";
  const values = categories.map((category) => [category]);

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting complaint types:", err);
    } else {
      console.log("Complaint types seeded successfully.");
    }
    db.end();
  });
};

insertCategories();

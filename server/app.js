const express = require('express');
const app = express();
const cors = require('cors');
const path = require("path");
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require("./routes/complaintRoutes");
const personnelRoutes = require("./routes/personnelRoutes");
// const http = require("http");
// const server = http.createServer(app);
// // const {connectSocket} = require("./socket");
// connectSocket(server);

dotenv.config();

app.use(cors({
  origin: "https://help-desk-iiita.vercel.app",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api', userRoutes);
app.use("/api", complaintRoutes);
app.use("/api/personnel", personnelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

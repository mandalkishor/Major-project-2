
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const complaintRoutes = require("./routes/complaintRoutes");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes

// app.use("/api/complaints", require("./routes/complaintRoutes"));

// // MongoDB Connection (FREE MongoDB Atlas)
// mongoose.connect("mongodb://127.0.0.1:27017/complaintDB")
// .then(() => console.log("✅ MongoDB Connected"))
// .catch(err => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// // app.listen(5000, () => {
// //     console.log("🚀 Server running on http://localhost:5000");
// // });


require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/complaints", require("./routes/complaintRoutes"));

// ✅ FIX: Use process.env.MONGO_URI for Render, fallback to local for development
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/complaintDB";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

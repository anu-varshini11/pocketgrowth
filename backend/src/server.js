require("dotenv").config();
const allowanceRoutes = require("./routes/allowance");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const unlockRoutes = require("./routes/unlock");
const investmentRoutes = require("./routes/investments");
const allowedOrigins = [
  "http://localhost:5173",
  "https://pocketgrowth-nrqtatam8-anu-varshini11s-projects.vercel.app"
];


const app = express();

// connect to DB
connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/allowance", allowanceRoutes);
app.use("/api/unlock", unlockRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/profile", require("./routes/profile"));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));


app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true
}));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});

// routes
app.get("/", (req, res) => {
  res.json({ message: "PocketGrowth backend running 🚀" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/upload');
const db = require('./config/firebase'); // Firebase database instance
const {
  adminLogin,
  adminLogout,
  adminCreate
} =  require("./controllers/adminController")
const {protect, isAdmin} = require("./middlewares/authMiddleware");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Route setup
app.use('/api', uploadRoutes());

const PORT = process.env.PORT || 5005;

// fetch it from firebase
app.get('/api/current-version', async (req, res) => {
  try {
    const versionRef = db.ref('firmware/version');
    const snapshot = await versionRef.once('value');
    const version = snapshot.val();

    if (version) {
      res.status(200).json({ version });
    } else {
      res.status(404).json({ error: "Version not found" });
    }
  } catch (error) {
    console.error("Firebase fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/admin/login',adminLogin);
app.post('/api/admin/secure/createAdmin', adminCreate);
app.post('/api/admin/logout',protect, isAdmin, adminLogout);
app.get("/api/admin/auth", protect, isAdmin, (req, res) => {
  res.status(200).json({ message: "Admin authenticated", user: req.user });
}
);

app.get('/', (req, res) => {
  res.send('Welcome to the Firmware Update Server');
});


// Start the server
mongoose
  .connect(process.env.DATABASE_CLOUD)
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => {
      console.log(mongoose.connection.name);
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });

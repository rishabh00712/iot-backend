const asyncHandler = require("express-async-handler");
const Admin = require("../models/AdminSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};


const adminLogout = asyncHandler(async (req, res) => {
  console.log("Logout called");
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    sameSite: "None",
    secure: true,
  });

  res.status(200).json({ message: "Logout successful" });
});


const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide both email and password");
  }
  const admin = await Admin.findOne({ email });
  console.log("Admin found:", admin);
  if (!admin || admin.role !== "admin") {
    res.status(400);
    throw new Error("Invalid login credentials");
  }
  const passwordIsCorrect = await bcrypt.compare(password, admin.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid email or password");
  }
  const token = generateToken(admin._id);
//   console.log("Generated token:", token);
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "None",
    secure: true,
  });

  res.status(200).json({ message: "Login successful"});

});

// Admin creation function (for initial setup or testing purposes)
const adminCreate = asyncHandler(async (req, res) => {
    console.log("Admin creation called");
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    res.status(400);
    throw new Error("Admin already exists with this email");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({
    name,
    email,
    password: password,
    role: "admin",
  });
  if (admin) {
    res.status(201).json({ message: "Admin created successfully" });
  } else {
    res.status(500);
    throw new Error("Failed to create admin");
  }
});

module.exports = {
    adminLogin,
    adminLogout,
    adminCreate
}

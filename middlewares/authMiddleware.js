const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminSchema");

const protect = expressAsyncHandler(async (req, res, next) => {
  console.log("Cookies received:", req.cookies);  // ✅ Debugging
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("No token received");  // ✅ Debugging
      res.status(401);
      throw new Error("Not authorized, Please Login");
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified:", verified);  // ✅ Debugging
    const user = await Admin.findById(verified.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Authorization error:", error.message);  // ✅ Debugging
    res.status(401);
    throw new Error("Not authorized, Please Login");
  }
});


const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. You are not an admin.");
  }
  console.log("YEE you are Admin : " + req.user.role);  // ✅ Debugging
};

module.exports = { protect, isAdmin };

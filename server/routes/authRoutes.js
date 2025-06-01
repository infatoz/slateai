const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refreshToken);
router.post("/forgot-password", authCtrl.forgotPassword);

// Private
router.get('/profile', verifyToken, authCtrl.getProfile);
router.put("/profile", verifyToken, authCtrl.updateProfile);
router.put("/update-password", verifyToken, authCtrl.updatePassword);
router.post("/logout", verifyToken, authCtrl.logout);


module.exports = router;

// CheckAndGetData.js
const express = require("express");
const router = express.Router();
const dbCourses = require("../models/db.Courses");
const {
  CheckUserId,
  GetPassword_hash,
  getUserByUsername,
} = require("../models/dbUser");
const { IsUserInForum } = require("../models/db.Forums");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
// const { storeRefreshToken } = require("../../mysql/db.Token");
// const crypto = require("crypto");

// API lấy danh sách học phần
router.get("/courses", async (req, res) => {
  try {
    const courses = await dbCourses.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu học phần:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dữ liệu học phần.",
    });
  }
});
//Kiểm tra username
async function CheckUserNameFromDatabase(Username) {
  try {
    return await getUserByUsername(Username);
  } catch (error) {
    console.error("Lỗi khi kiểm tra user ID:", error);
    throw error;
  }
}
// Hàm kiểm tra ID người dùng (xuất riêng)
async function CheckUserIDFromDatabase(userID) {
  try {
    return await CheckUserId(userID);
  } catch (error) {
    console.error("Lỗi khi kiểm tra user ID:", error);
    throw error;
  }
}
//Kiểm tra user đã có trong nhóm hay chưa
async function CheckIsUserInForum(ForumId, userID) {
  try {
    return await IsUserInForum(ForumId, userID);
  } catch (error) {
    console.error("Lỗi khi kiểm tra user ID:", error);
    throw error;
  }
}

//Phục vụ cho Repair_Login và RegisterAndSendEmail
async function handleLogin(username, password) {
  console.log("handleLogin:", { username, password });
  const user = await getUserByUsername(username);
  if (!user) {
    return {
      success: false,
      status: 401,
      message: "Sai tên đăng nhập hoặc mật khẩu!",
    };
  }
  const hash = await GetPassword_hash(username);
  if (!hash) {
    return {
      success: false,
      status: 500,
      message: "Không tìm thấy thông tin xác thực.",
    };
  }
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return {
      success: false,
      status: 401,
      message: "Sai tên đăng nhập hoặc mật khẩu!",
    };
  }
  const accessTokenPayload = { userId: user.id, username: user.username };
  const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {
    expiresIn: "15m",
  });
  // Có thể thêm refreshToken nếu cần
  return {
    success: true,
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      gender: user.gender,
      Name: user.Name,
      avatar: user.avatar ? user.avatar : "logoT3V.png",
    },
  };
}

// 👉 Export cả router và hàm check
module.exports = {
  router,
  CheckUserIDFromDatabase,
  CheckIsUserInForum,
  handleLogin,
  CheckUserNameFromDatabase
};

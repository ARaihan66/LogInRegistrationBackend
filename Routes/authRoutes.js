import express from "express";
import db from "../DbConnection/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authorizedUser from "../Authorization/authorization.js";

const router = express.Router();

// user signup
router.post("/sign-up", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: 400,
      message: "Username, Email and Password is required.",
    });
  }

  const existedUser = "SELECT * FROM users where email = ?";

  db.query(existedUser, [email], async (err, data) => {
    if (err)
      return res.status(500).json({
        status: 500,
        message: err.message,
      });

    if (data.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Already user existed with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser =
      "INSERT INTO users (`username`, `email`, `password`) VALUES(?)";

    db.query(newUser, [[username, email, hashedPassword]], (err, data) => {
      if (err)
        return res.status(500).json({
          status: 500,
          message: err.message,
        });

      return res.status(201).json({
        status: 201,
        message: "Registration successful",
      });
    });
  });
});

// user signin
router.post("/sign-in", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: 400,
      message: "Email and Password is required",
    });
  }

  const existedUser = "SELECT * FROM users WHERE email = ?";

  db.query(existedUser, [email], async (err, data) => {
    if (err)
      return res.status(500).json({
        status: 500,
        message: err.message,
      });

    if (data.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "User not found.",
      });
    }

    const user = data[0];

    console.log(user);

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_TOKEN, {
        expiresIn: "1h",
      });

      return res.status(200).json({
        status: 200,
        message: "Login successful",
        token: token,
      });
    } else {
      res.status(400).json({
        status: 400,
        message: "Password incorrect",
      });
    }
  });
});

// update user info
router.post("/update-user-info", (req, res) => {
  const { username, email, oldPassword, newPassword, confirmPassword } =
    req.body;

  const existedUser = "SELECT * FROM users WHERE email = ?";
  db.query(existedUser, [email], async (err, data) => {
    if (err)
      return res.status(500).json({
        status: 500,
        message: err.message,
      });

    if (data.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "User not found.",
      });
    }
    const user = data[0];

    const isMatched = await bcrypt.compare(oldPassword, user.password);

    if (!isMatched) {
      return res.status(400).json({
        status: 400,
        message: "Password is not correct.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "New password and confirm password does not match.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updateUser =
      "UPDATE users SET username=?, email=?, password=? WHERE email=?";
    db.query(
      updateUser,
      [username, email, hashedNewPassword, email],
      (err, data) => {
        if (err)
          return res.status(500).json({
            status: 500,
            message: err.message,
          });

        return res.status(200).json({
          status: 200,
          message: "User information update successfully.",
        });
      }
    );
  });
});

// forgot password
router.get("/profile", authorizedUser, (req, res) => {
  console.log(req.userId);
  res.status(200).json({
    status: 200,
    message: "Hello Protected Route",
  });
});

export default router;

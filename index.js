import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "userauthentication",
});

app.use(express.json());

app.post("/sign-up", (req, res) => {
  const { username, email, password } = req.body;

  const existedUser = "SELECT * FROM users where email = ?";

  db.query(existedUser, [email], async (err, data) => {
    if (err) return res.status(500).json({ message: err.message });

    if (data.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "User Already Existed.",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("error");
      const q =
        "INSERT INTO users (`username`, `email`, `password`) VALUES (?)";
      const values = [username, email, hashedPassword];

      db.query(q, [values], (err, data) => {
        if (err) return res.json({ error: err.message });
        return res.status(200).json({
          status: 200,
          message: "Successfully Signed Up",
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  });
});

app.post("/sign-in", (req, res) => {
  const { email, password } = req.body;
  const existedUser = "SELECT * FROM users WHERE email = ? ";

  db.query(existedUser, [email], async (err, data) => {
    if (err)
      return res.status(500).json({
        status: 500,
        message: err.message,
      });

    if (data.length === 0) {
      return res.status(404).json({
        status: 200,
        message: "User not found.",
      });
    }

    const user = data[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.status(200).json({
        status: 200,
        message: "Login successful.",
        user: user,
      });
    } else {
      return res.status(200).json({
        status: 401,
        message: "Invalid Password",
      });
    }
  });
});

app.put("/update/user", (req, res) => {
  const { username, email, oldPassword, newPassword, confirmPassword } =
    req.body;

  const existedUser = "SELECT * FROM users WHERE email= ?";

  db.query(existedUser, [email], async (err, data) => {
    if (err)
      return res.status(500).json({
        status: 500,
        message: err.message,
      });

    if (data.length === 0) {
      return res.status(404).json({
        status: 200,
        message: "User not found",
      });
    }

    const user = data[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Old password is not correct",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        status: 401,
        message: "New password did not match with confirm password",
      });
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Hello from node js backend",
  });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

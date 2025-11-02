import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authorizedUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log(token);

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Please login first.",
    });
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
    if (err) {
      console.log(err.message);
      return res.status(401).json({
        status: 401,
        message: "Invalid or expired token.",
      });
    }

    req.userId = decoded.id;
    next();
  });
};

export default authorizedUser;

import express from "express";
import cors from "cors";
import authRoutes from "./Routes/authRoutes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(port);
  console.log(`Server is running on port ${port}`);
});

import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "Hello from node js backend",
  });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

const express = require("express");
const connectMongoDB = require("./connection.js");
const jwt = require("jsonwebtoken");
const userRoutes = require("./Routes/userRoutes");
const candidateRoutes = require("./Routes/candidateRoutes.js");


const app = express();

const PORT = 3000;

connectMongoDB("mongodb://localhost:27017/votingSystem");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/candidate" ,candidateRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

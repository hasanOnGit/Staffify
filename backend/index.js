require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));


app.use(express.json());


require("./app/config/db")(app);
require("./app/routes")(app);

app.listen(PORT, () =>{
    console.log(`server running on port ${PORT}`)
});
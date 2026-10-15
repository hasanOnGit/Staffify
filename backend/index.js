const express = require("express");
const app = express();
const cors = require("cors");

const PORT = 5000;


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));


app.use(express.json());


require("./app/config/db")(app);
require("./app/routes")(app);

app.listen(PORT, () =>{
    console.log(`server running on port ${PORT}`)
});
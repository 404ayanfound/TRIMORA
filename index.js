
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api", (req, res) => {
    res.send("TRIMORA Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`TRIMORA server running at http://localhost:${PORT}`);
});

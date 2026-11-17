const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("TRIMORA Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`TRIMORA server running on http://localhost:${PORT}`);
});
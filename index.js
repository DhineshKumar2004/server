const express = require("express");
const users = require("./data.json");
const cors = require("cors");
const fs = require("fs");
const app = express();

app.use(express.json());
const port = 8000;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));

// Display all users
app.get("/users", (req, res) => {
    return res.json(users);
});

// Delete user detail
app.delete("/users/:id", (req, res) => {
    let id = Number(req.params.id);
    let filteredUsers = users.filter((user) => user.id !== id);

    fs.writeFile("./data.json", JSON.stringify(filteredUsers), (err) => {
        if (err) {
            return res.status(500).json({ message: "Error saving data" });
        }
        return res.json(filteredUsers);
    });
});

// Add new user
app.post("/users", (req, res) => {
    let { name, email, phone } = req.body;

    // Set default status to true (active) when adding a new user
    let status = req.body.status !== undefined ? req.body.status : true;

    if (!name || !email || !phone) {
        return res.status(400).send({ message: "All fields are required" });
    }

    let id = Date.now();
    users.push({ id, name, email, phone, status }); // Include status

    fs.writeFile("./data.json", JSON.stringify(users), (err) => {
        if (err) {
            return res.status(500).json({ message: "Error saving data" });
        }
        return res.json({ message: "User details added successfully" });
    });
});

// Update user
app.patch("/users/:id", (req, res) => {
    let id = Number(req.params.id);
    let { name, email, phone, status } = req.body; // Include status in the body

    if (!name || !email || !phone) {
        return res.status(400).send({ message: "All fields are required" });
    }

    let userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    // Update user details, including status
    users[userIndex] = { ...users[userIndex], name, email, phone, status };

    fs.writeFile("./data.json", JSON.stringify(users), (err) => {
        if (err) {
            return res.status(500).json({ message: "Error saving data" });
        }
        return res.json({ message: "User details updated successfully" });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});

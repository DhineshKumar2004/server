const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 8000;

// Path to the data file
const dataFilePath = path.join(__dirname, "data.json");

// Middleware to parse JSON bodies
app.use(express.json());

// CORS setup for your Netlify deployment
app.use(cors({
    origin: "https://neon-pothos-1a2c00.netlify.app", // Ensure no trailing slash here
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));

// Utility function to read data from the JSON file
const readData = () => {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
};

// Utility function to write data to the JSON file
const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to the User Management API");
});

// Display all users
app.get("/users", (req, res) => {
    try {
        const users = readData();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error reading users data" });
    }
});

// Delete user by ID
app.delete("/users/:id", (req, res) => {
    try {
        let id = Number(req.params.id);
        let users = readData();
        let filteredUsers = users.filter((user) => user.id !== id);

        if (filteredUsers.length === users.length) {
            return res.status(404).json({ message: "User not found" });
        }

        writeData(filteredUsers);
        res.json({ message: "User deleted successfully", users: filteredUsers });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

// Add new user
app.post("/users", (req, res) => {
    try {
        let { name, email, phone } = req.body;
        let status = req.body.status !== undefined ? req.body.status : true;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "All fields (name, email, phone) are required" });
        }

        let users = readData();
        let id = Date.now();
        users.push({ id, name, email, phone, status });

        writeData(users);
        res.json({ message: "User added successfully", users });
    } catch (err) {
        res.status(500).json({ message: "Error adding user" });
    }
});

// Update user by ID
app.patch("/users/:id", (req, res) => {
    try {
        let id = Number(req.params.id);
        let { name, email, phone, status } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "All fields (name, email, phone) are required" });
        }

        let users = readData();
        let userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        users[userIndex] = { ...users[userIndex], name, email, phone, status };

        writeData(users);
        res.json({ message: "User updated successfully", users });
    } catch (err) {
        res.status(500).json({ message: "Error updating user" });
    }
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});

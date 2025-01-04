import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD, // Store sensitive info in `.env`
  database: "employee_db",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit();
  }
  console.log("Connected to the database.");
});

// POST route to add an employee
app.post("/addEmployee", (req, res) => {
  const { name, employee_id, email, phone, department, date_of_joining, role } = req.body;

  const checkQuery = `SELECT * FROM employees WHERE employee_id = ? OR email = ?`;
  db.query(checkQuery, [employee_id, email], (err, result) => {
    if (err) {
      console.error("Error checking employee:", err);
      return res.status(500).send({ message: "Error checking for existing employee." });
    }

    if (result.length > 0) {
      return res.status(400).send({ message: "Employee ID or Email already exists." });
    }

    const query = `INSERT INTO employees (name, employee_id, email, phone, department, date_of_joining, role)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, employee_id, email, phone, department, date_of_joining, role], (err) => {
      if (err) {
        console.error("Error adding employee:", err);
        return res.status(500).send({ message: "Error adding employee." });
      }
      res.status(201).send({ message: "Employee added successfully!" });
    });
  });
});

// GET route to fetch all employees
app.get("/getEmployees", (req, res) => {
  const query = "SELECT * FROM employees";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error retrieving employees:", err);
      return res.status(500).send({ message: "Error retrieving employees." });
    }
    res.status(200).json(result);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

